/**
 * @fileoverview This file is a handler for the deployer group.
 * It is used to create the deployer group and attach the deployer policy to it.
 * Run via AWS Lambda Custom Resource.
 */

/* eslint-disable @typescript-eslint/no-require-imports */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable no-console */
const {
  AttachGroupPolicyCommand,
  CreateGroupCommand,
  DetachGroupPolicyCommand,
  GetGroupCommand,
  IAMClient,
} = require('@aws-sdk/client-iam');

exports.handler = async (event) => {
  const client = new IAMClient();
  const groupName = event.ResourceProperties.groupName;
  const policyArn = event.ResourceProperties.policyArn;

  // Always use a consistent PhysicalResourceId
  const physicalResourceId = event.PhysicalResourceId || groupName;

  try {
    if (event.RequestType === 'Create' || event.RequestType === 'Update') {
      let groupExists = false;
      try {
        await client.send(new GetGroupCommand({ GroupName: groupName }));
        groupExists = true;
      } catch (err) {
        if (err.name === 'NoSuchEntityException') {
          await client.send(new CreateGroupCommand({ GroupName: groupName }));
        } else {
          throw err;
        }
      }

      // Only try to attach policy if group was just created
      if (!groupExists) {
        try {
          await client.send(
            new AttachGroupPolicyCommand({
              GroupName: groupName,
              PolicyArn: policyArn,
            }),
          );
        } catch (err) {
          if (err.name !== 'EntityAlreadyExists' && err.name !== 'LimitExceeded') throw err;
        }
      }
    } else if (event.RequestType === 'Delete') {
      try {
        // Try to detach policy before deletion
        await client.send(
          new DetachGroupPolicyCommand({
            GroupName: groupName,
            PolicyArn: policyArn,
          }),
        );
      } catch (err) {
        // Ignore errors during cleanup
        console.warn('Error detaching policy during deletion:', err);
      }
    }

    return {
      PhysicalResourceId: physicalResourceId,
      Data: {
        GroupName: groupName,
      },
    };
  } catch (error) {
    console.error('Error:', error);
    throw error; // Let CloudFormation handle the error
  }
};
