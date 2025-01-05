import { IAMClient, CreateUserCommand, AttachUserPolicyCommand, CreateAccessKeyCommand } from '@aws-sdk/client-iam';

(async () => {
  const iamClient = new IAMClient({});

  const userName = process.env.AWS_DEPLOYER_USER || 'ap-deployer';
  try {
    await iamClient.send(new CreateUserCommand({ UserName: userName }));
    console.log(`Created user: ${userName}`);
  } catch (err: any) {
    if (err.name === 'EntityAlreadyExists') {
      console.log(`User ${userName} already exists, continuing...`);
    } else {
      throw err;
    }
  }

  // Attach the policy. This could be a managed policy you created.
  const policyArn = 'arn:aws:iam::aws:policy/AdministratorAccess'; // or a custom one
  await iamClient.send(new AttachUserPolicyCommand({
    PolicyArn: policyArn,
    UserName: userName,
  }));
  console.log(`Attached policy ${policyArn} to ${userName}`);

  // Create access key
  const accessKey = await iamClient.send(new CreateAccessKeyCommand({ UserName: userName }));
  console.log(`Deployer Access Key: ${accessKey.AccessKey?.AccessKeyId}`);
  console.log(`Deployer Secret Key: ${accessKey.AccessKey?.SecretAccessKey}`);
})();
