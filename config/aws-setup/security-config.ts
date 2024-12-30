import { Duration } from 'aws-cdk-lib';

export const SecurityConfig = {
  memoryDb: {
    // Restrict Redis commands to only what's needed
    accessString: 'on ~* -@all +@read +@write +@connection +@transaction',

    // Encryption settings
    encryption: {
      atRest: true,
      inTransit: true,
      kmsKeyRotation: true,
    },

    // Backup settings
    backup: {
      retentionDays: 7,
      preferredMaintenanceWindow: 'sun:03:00-sun:04:00',
      snapshotWindow: '02:00-03:00',
    },

    // Secret rotation
    secretRotation: {
      enabled: true,
      schedule: Duration.days(30),
    },
  },

  // IAM settings
  iam: {
    // Minimal permissions needed after bootstrap
    minimalPermissions: [
      'cloudformation:*',
      'memorydb:*',
      'ec2:Describe*',
      'secretsmanager:Get*',
      'secretsmanager:List*',
      's3:List*',
      's3:Get*',
    ],

    // Resource naming patterns for access control
    resourcePatterns: {
      stacks: 'Apadana*',
      secrets: 'apadana-*',
      memoryDb: 'apadana-*',
    },

    // Tags required for resource access
    requiredTags: {
      Project: 'Apadana',
      Environment: ['development', 'production'],
    },
  },

  // Logging configuration
  logging: {
    retention: Duration.days(30),
    logGroups: {
      memoryDb: '/aws/memorydb/apadana',
      cloudformation: '/aws/cloudformation/apadana',
    },
  },

  // Security scanning configuration
  securityScanning: {
    // CDK Nag rules to enforce
    nagRules: {
      // Require encryption at rest
      requireEncryption: true,
      // Require secure TLS versions
      requireSecureTls: true,
      // Require backup configuration
      requireBackups: true,
      // Require resource tagging
      requireTags: true,
      // Require access logging
      requireAccessLogs: true,
    },
  },
};
