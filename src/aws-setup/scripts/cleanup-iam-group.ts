import { IAM } from '@aws-sdk/client-iam';

import { assertError } from '@/utils';
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
    assertError(error);
    if (error.name === 'NoSuchEntityException') {
      logger.info(`Group ${groupName} does not exist`);
      return;
    }
    throw error;
  }
}

const isMain = import.meta.filename === process.argv[1];
// Allow running directly
if (isMain) {
  const groupName = process.argv[2];
  if (!groupName) {
    process.exit(1);
  }

  cleanupIamGroup(groupName)
    .then(() => process.exit(0))
    .catch(() => {
      process.exit(1);
    });
}
