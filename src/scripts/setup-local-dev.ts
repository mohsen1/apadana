import { execSync } from 'child_process';
import fs from 'fs';
import sudoPrompt from 'sudo-prompt';
import { promisify } from 'util';

import { createLogger } from '@/utils/logger';

const sudoExec = promisify<string, Parameters<typeof sudoPrompt.exec>[1]>(
  sudoPrompt.exec,
);

const logger = createLogger(__filename);
const DOMAINS = ['dev.apadana.local', 'prod.apadana.local'];
const HOSTS_FILE = '/etc/hosts';

async function setupLocalDomains() {
  const certDir = 'src/docker/certs';
  const certFile = `${certDir}/cert.pem`;
  const keyFile = `${certDir}/key.pem`;
  const rootCAFile = `${certDir}/rootCA.pem`;

  try {
    if (fs.existsSync(certFile) && fs.existsSync(keyFile)) {
      // Check hosts file
      const hostsContent = fs.readFileSync(HOSTS_FILE, 'utf8');
      const allDomainsExist = DOMAINS.every((domain) =>
        hostsContent.includes(domain),
      );

      if (allDomainsExist) {
        logger.info('Local development environment already set up! ✨');
        return;
      }
    }

    // Check if running on macOS
    const platform = process.platform;
    if (platform !== 'darwin') {
      logger.error('This script is only supported on macOS');
      process.exit(1);
    }

    // Get mkcert binary path
    const mkcertPath =
      execSync('brew --prefix mkcert').toString().trim() + '/bin/mkcert';

    // Install mkcert if not already installed
    try {
      execSync('brew info mkcert');
    } catch {
      logger.info('Installing mkcert...');
      execSync('brew install mkcert');
    }

    // Install nss if not already installed (for Firefox support)
    try {
      execSync('brew info nss');
    } catch {
      logger.info('Installing nss for Firefox support...');
      execSync('brew install nss');
    }

    // Initialize mkcert
    logger.info('Initializing mkcert...');
    await sudoExec(`${mkcertPath} -install`, {
      name: 'Setting up local development environment with SSL',
    });

    // Create certificates directory if it doesn't exist
    if (!fs.existsSync(certDir)) {
      fs.mkdirSync(certDir, { recursive: true });
    }

    // Generate certificates for domains with root CA
    logger.info('Generating certificates...');
    execSync(
      `cd ${certDir} && ${mkcertPath} -cert-file cert.pem -key-file key.pem ${DOMAINS.join(' ')}`,
    );

    // Copy root CA certificate
    const caPath = execSync('mkcert -CAROOT').toString().trim();
    fs.copyFileSync(`${caPath}/rootCA.pem`, rootCAFile);

    // Set proper permissions for certificate files
    execSync(`chmod 644 ${certFile} ${keyFile} ${rootCAFile}`);

    // Update /etc/hosts file
    logger.info('Updating /etc/hosts...');
    const hostsContent = fs.readFileSync(HOSTS_FILE, 'utf8');
    let needsUpdate = false;

    DOMAINS.forEach((domain) => {
      if (!hostsContent.includes(domain)) {
        needsUpdate = true;
      }
    });

    if (needsUpdate) {
      const entries = DOMAINS.map((domain) => `127.0.0.1 ${domain}`).join('\n');
      execSync(
        `sudo sh -c 'echo "\n# Apadana local domains\n${entries}" >> ${HOSTS_FILE}'`,
      );
      logger.info('Updated /etc/hosts successfully');
    } else {
      logger.info('Hosts file already contains required entries');
    }

    logger.info('Local development environment setup complete! ✨');
    logger.info('Root CA certificate available at:', rootCAFile);
  } catch (error) {
    logger.error('Error setting up local development environment:', error);
    process.exit(1);
  }
}

setupLocalDomains().catch((error) => {
  logger.error('Error setting up local development environment:', error);
  process.exit(1);
});
