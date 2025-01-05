import { IAMClient, CreateUserCommand, AttachUserPolicyCommand, CreateAccessKeyCommand } from '@aws-sdk/client-iam';
import { createLogger } from '@/utils/logger';

const logger = createLogger(__filename);

(async () => {
  const iamClient = new IAMClient({});

  const userName = process.env.AWS_DEPLOYER_USER || 'ap-deployer';
  try {
    await iamClient.send(new CreateUserCommand({ UserName: userName }));
    logger.info(`Created user: ${userName}`);
  } catch (err: any) {
    if (err.name === 'EntityAlreadyExists') {
      logger.info(`User ${userName} already exists, continuing...`);
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
  logger.info(`Attached policy ${policyArn} to ${userName}`);

  // Create access key
  const accessKey = await iamClient.send(new CreateAccessKeyCommand({ UserName: userName }));
  logger.info(`Deployer Access Key: ${accessKey.AccessKey?.AccessKeyId}`);
  logger.info(`Deployer Secret Key: ${accessKey.AccessKey?.SecretAccessKey}`);
})();
