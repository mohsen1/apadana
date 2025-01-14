#!/usr/bin/env bash
set -euo pipefail

if [ $# -lt 1 ]; then
  echo "Usage: $0 <VPC_NAME>"
  exit 1
fi

VPC_NAME="$1"
echo "Finding VPC with name: $VPC_NAME"

VPC_ID=$(aws ec2 describe-vpcs \
  --filters "Name=tag:Name,Values=$VPC_NAME" \
  --query "Vpcs[0].VpcId" \
  --output text)

if [ "$VPC_ID" = "None" ]; then
  echo "No VPC found with name $VPC_NAME. Exiting."
  exit 0
fi

echo "Found VPC: $VPC_ID"

# Delete ALBs/NLBs
echo "Deleting ALBs/NLBs..."
for LB_ARN in $(aws elbv2 describe-load-balancers \
  --query "LoadBalancers[?VpcId=='$VPC_ID'].LoadBalancerArn" \
  --output text 2>/dev/null || true); do
  echo "Deleting ALB/NLB: $LB_ARN"
  aws elbv2 delete-load-balancer --load-balancer-arn "$LB_ARN"
  aws elbv2 wait load-balancers-deleted --load-balancer-arns "$LB_ARN"
done

# Delete Classic ELBs
echo "Deleting Classic ELBs..."
for ELB_NAME in $(aws elb describe-load-balancers \
  --query "LoadBalancerDescriptions[?VPCId=='$VPC_ID'].LoadBalancerName" \
  --output text 2>/dev/null || true); do
  echo "Deleting Classic ELB: $ELB_NAME"
  aws elb delete-load-balancer --load-balancer-name "$ELB_NAME"
done

# Delete VPC Endpoints
echo "Deleting VPC Endpoints..."
for EP_ID in $(aws ec2 describe-vpc-endpoints \
  --filters "Name=vpc-id,Values=$VPC_ID" \
  --query "VpcEndpoints[].VpcEndpointId" \
  --output text 2>/dev/null || true); do
  echo "Deleting VPC Endpoint: $EP_ID"
  aws ec2 delete-vpc-endpoints --vpc-endpoint-ids "$EP_ID"
done

# Delete NAT Gateways and wait for deletion
echo "Deleting NAT Gateways..."
for NGW_ID in $(aws ec2 describe-nat-gateways \
  --filter "Name=vpc-id,Values=$VPC_ID" \
  --query "NatGateways[].NatGatewayId" \
  --output text 2>/dev/null || true); do
  echo "Deleting NAT Gateway: $NGW_ID"
  aws ec2 delete-nat-gateway --nat-gateway-id "$NGW_ID"
  echo "Waiting for NAT Gateway $NGW_ID to be deleted..."
  aws ec2 wait nat-gateway-deleted --nat-gateway-ids "$NGW_ID"
done

# Delete VPC Peering Connections
echo "Deleting VPC Peering Connections..."
for PCX_ID in $(aws ec2 describe-vpc-peering-connections \
  --filters "Name=requester-vpc-info.vpc-id,Values=$VPC_ID" \
  "Name=accepter-vpc-info.vpc-id,Values=$VPC_ID" \
  --query "VpcPeeringConnections[].VpcPeeringConnectionId" \
  --output text 2>/dev/null || true); do
  echo "Deleting VPC Peering Connection: $PCX_ID"
  aws ec2 delete-vpc-peering-connection --vpc-peering-connection-id "$PCX_ID"
done

# Delete RDS instances in the VPC
echo "Deleting RDS instances..."
for DB_INSTANCE in $(aws rds describe-db-instances \
  --query "DBInstances[?DBSubnetGroup.VpcId=='$VPC_ID'].DBInstanceIdentifier" \
  --output text 2>/dev/null || true); do
  echo "Deleting RDS instance: $DB_INSTANCE"
  # Disable deletion protection if enabled
  aws rds modify-db-instance \
    --db-instance-identifier "$DB_INSTANCE" \
    --no-deletion-protection \
    --apply-immediately || true
  # Delete the instance without final snapshot
  aws rds delete-db-instance \
    --db-instance-identifier "$DB_INSTANCE" \
    --skip-final-snapshot \
    --delete-automated-backups || true
  echo "Waiting for RDS instance $DB_INSTANCE to be deleted..."
  aws rds wait db-instance-deleted --db-instance-identifier "$DB_INSTANCE"
done

# Delete RDS subnet groups in the VPC
echo "Deleting RDS subnet groups..."
for SUBNET_GROUP in $(aws rds describe-db-subnet-groups \
  --query "DBSubnetGroups[?VpcId=='$VPC_ID'].DBSubnetGroupName" \
  --output text 2>/dev/null || true); do
  echo "Deleting RDS subnet group: $SUBNET_GROUP"
  aws rds delete-db-subnet-group --db-subnet-group-name "$SUBNET_GROUP" || true
done

# Release any Elastic IPs associated with the VPC
echo "Releasing Elastic IPs..."
for EIP_ALLOC in $(aws ec2 describe-addresses \
  --filters "Name=domain,Values=vpc" \
  --query "Addresses[?NetworkInterfaceId!=null && VpcId=='$VPC_ID'].AllocationId" \
  --output text 2>/dev/null || true); do
  echo "Releasing Elastic IP: $EIP_ALLOC"
  aws ec2 release-address --allocation-id "$EIP_ALLOC"
done

# Terminate any EC2 instances in the VPC
echo "Terminating EC2 instances..."
INSTANCE_IDS=$(aws ec2 describe-instances \
  --filters "Name=vpc-id,Values=$VPC_ID" "Name=instance-state-name,Values=pending,running,stopping,stopped" \
  --query "Reservations[].Instances[].InstanceId" \
  --output text 2>/dev/null || true)

if [ -n "$INSTANCE_IDS" ]; then
  echo "Terminating instances: $INSTANCE_IDS"
  aws ec2 terminate-instances --instance-ids $INSTANCE_IDS
  echo "Waiting for instances to terminate..."
  aws ec2 wait instance-terminated --instance-ids $INSTANCE_IDS
fi

# Delete Network Interfaces
echo "Deleting Network Interfaces..."
for ENI_ID in $(aws ec2 describe-network-interfaces \
  --filters "Name=vpc-id,Values=$VPC_ID" \
  --query "NetworkInterfaces[].NetworkInterfaceId" \
  --output text 2>/dev/null || true); do
  echo "Deleting Network Interface: $ENI_ID"
  aws ec2 delete-network-interface --network-interface-id "$ENI_ID" || {
    echo "Warning: Failed to delete network interface $ENI_ID, attempting to detach first..."
    ATTACHMENT_ID=$(aws ec2 describe-network-interfaces \
      --network-interface-ids "$ENI_ID" \
      --query "NetworkInterfaces[0].Attachment.AttachmentId" \
      --output text 2>/dev/null || true)
    if [ "$ATTACHMENT_ID" != "None" ] && [ -n "$ATTACHMENT_ID" ]; then
      echo "Detaching Network Interface: $ENI_ID (Attachment: $ATTACHMENT_ID)"
      aws ec2 detach-network-interface --attachment-id "$ATTACHMENT_ID" --force
      sleep 5 # Give AWS some time to detach
      echo "Retrying deletion of Network Interface: $ENI_ID"
      aws ec2 delete-network-interface --network-interface-id "$ENI_ID" || true
    fi
  }
done

# Detach and delete IGWs
echo "Detaching and deleting IGWs..."
for IGW_ID in $(aws ec2 describe-internet-gateways \
  --filters "Name=attachment.vpc-id,Values=$VPC_ID" \
  --query "InternetGateways[].InternetGatewayId" \
  --output text 2>/dev/null || true); do
  echo "Detaching and deleting IGW: $IGW_ID"
  aws ec2 detach-internet-gateway --internet-gateway-id "$IGW_ID" --vpc-id "$VPC_ID" || true
  aws ec2 delete-internet-gateway --internet-gateway-id "$IGW_ID" || true
done

# Delete custom Route Tables (skip main)
echo "Deleting custom Route Tables..."
ROUTE_TABLE_IDS=$(aws ec2 describe-route-tables \
  --filters "Name=vpc-id,Values=$VPC_ID" \
  --query "RouteTables[].RouteTableId" \
  --output text 2>/dev/null || true)

for RTB_ID in $ROUTE_TABLE_IDS; do
  # Check if it's the main route table
  MAIN=$(aws ec2 describe-route-tables \
    --route-table-ids "$RTB_ID" \
    --query "RouteTables[0].Associations[?Main==\`true\`].Main" \
    --output text 2>/dev/null || true)

  if [ "$MAIN" = "True" ]; then
    echo "Skipping main Route Table: $RTB_ID"
    continue
  fi

  echo "Cleaning up Route Table: $RTB_ID"

  # First, disassociate any subnets
  for ASSOC_ID in $(aws ec2 describe-route-tables \
    --route-table-ids "$RTB_ID" \
    --query "RouteTables[0].Associations[].RouteTableAssociationId" \
    --output text 2>/dev/null || true); do
    if [ "$ASSOC_ID" != "None" ]; then
      echo "Disassociating $ASSOC_ID from $RTB_ID"
      aws ec2 disassociate-route-table --association-id "$ASSOC_ID"
    fi
  done

  # Delete all non-local routes (ignore local routes as they can't be deleted)
  ROUTES=$(aws ec2 describe-route-tables \
    --route-table-ids "$RTB_ID" \
    --query "RouteTables[0].Routes[?GatewayId!='local']" \
    --output json 2>/dev/null || true)

  if [ "$ROUTES" != "[]" ] && [ "$ROUTES" != "" ]; then
    echo "Deleting routes from $RTB_ID"
    # Delete IPv4 routes
    for DEST_CIDR in $(echo "$ROUTES" | jq -r '.[].DestinationCidrBlock // empty'); do
      if [ "$DEST_CIDR" != "null" ] && [ "$DEST_CIDR" != "" ]; then
        echo "Deleting route $DEST_CIDR from $RTB_ID"
        aws ec2 delete-route --route-table-id "$RTB_ID" --destination-cidr-block "$DEST_CIDR" || true
      fi
    done

    # Delete IPv6 routes
    for DEST_CIDR6 in $(echo "$ROUTES" | jq -r '.[].DestinationIpv6CidrBlock // empty'); do
      if [ "$DEST_CIDR6" != "null" ] && [ "$DEST_CIDR6" != "" ]; then
        echo "Deleting IPv6 route $DEST_CIDR6 from $RTB_ID"
        aws ec2 delete-route --route-table-id "$RTB_ID" --destination-ipv6-cidr-block "$DEST_CIDR6" || true
      fi
    done
  fi

  # Now try to delete the route table
  echo "Deleting Route Table: $RTB_ID"
  aws ec2 delete-route-table --route-table-id "$RTB_ID" || {
    echo "Warning: Failed to delete route table $RTB_ID, continuing..."
  }
done

# Delete subnets
echo "Deleting Subnets..."
for SUBNET_ID in $(aws ec2 describe-subnets \
  --filters "Name=vpc-id,Values=$VPC_ID" \
  --query "Subnets[].SubnetId" \
  --output text 2>/dev/null || true); do
  echo "Deleting Subnet: $SUBNET_ID"
  aws ec2 delete-subnet --subnet-id "$SUBNET_ID" || {
    echo "Warning: Failed to delete subnet $SUBNET_ID, continuing..."
  }
done

# Delete non-default Network ACLs
echo "Deleting non-default Network ACLs..."
for NACL_ID in $(aws ec2 describe-network-acls \
  --filters "Name=vpc-id,Values=$VPC_ID" \
  --query "NetworkAcls[].NetworkAclId" \
  --output text 2>/dev/null || true); do
  IS_DEFAULT=$(aws ec2 describe-network-acls \
    --network-acl-ids "$NACL_ID" \
    --query "NetworkAcls[0].IsDefault" \
    --output text 2>/dev/null || true)
  if [ "$IS_DEFAULT" = "True" ]; then
    echo "Skipping default NACL: $NACL_ID"
    continue
  fi
  echo "Deleting Network ACL: $NACL_ID"
  aws ec2 delete-network-acl --network-acl-id "$NACL_ID" || {
    echo "Warning: Failed to delete NACL $NACL_ID, continuing..."
  }
done

# Delete non-default Security Groups
echo "Deleting non-default Security Groups..."
for SG_ID in $(aws ec2 describe-security-groups \
  --filters "Name=vpc-id,Values=$VPC_ID" \
  --query "SecurityGroups[].GroupId" \
  --output text 2>/dev/null || true); do
  SG_NAME=$(aws ec2 describe-security-groups \
    --group-ids "$SG_ID" \
    --query "SecurityGroups[0].GroupName" \
    --output text 2>/dev/null || true)
  if [ "$SG_NAME" = "default" ]; then
    echo "Skipping default Security Group: $SG_ID"
    continue
  fi
  echo "Deleting Security Group: $SG_ID"
  aws ec2 delete-security-group --group-id "$SG_ID" || {
    echo "Warning: Failed to delete security group $SG_ID, continuing..."
  }
done

# Finally, delete the VPC
echo "Deleting VPC: $VPC_ID"
aws ec2 delete-vpc --vpc-id "$VPC_ID" || {
  echo "Failed to delete VPC $VPC_ID. Please check for remaining dependencies."
  exit 1
}
echo "VPC $VPC_NAME ($VPC_ID) deleted successfully."
