import { IAM } from '@aws-sdk/client-iam';

import { createLogger } from '@/utils/logger';

const logger = createLogger(import.meta.filename);
const iam = new IAM({});

export async function cleanupIamGroup(groupName: string) {
  try {
    logger.info(`Cleaning up IAM group: ${groupName}`);

    // Get all users in the group
    const { Users = [] } = await iam.getGroup({ GroupName: groupName });

    // Remove each user from the group
    for (const user of Users) {
      if (!user.UserName) continue;

      logger.info(`Removing user ${user.UserName} from group ${groupName}`);
      await iam.removeUserFromGroup({
        GroupName: groupName,
        UserName: user.UserName,
      });
    }

    logger.info(`Successfully cleaned up group ${groupName}`);
  } catch (error) {
    if ((error as any)?.name === 'NoSuchEntityException') {
      logger.info(`Group ${groupName} does not exist`);
      return;
    }
    throw error;
  }
}

// Allow running directly
if (require.main === module) {
  const groupName = process.argv[2];
  if (!groupName) {
    console.error('Please provide a group name');
    process.exit(1);
  }

  cleanupIamGroup(groupName)
    .then(() => process.exit(0))
    .catch((error) => {
      console.error('Error:', error);
      process.exit(1);
    });
}
