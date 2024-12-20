import { execSync } from 'child_process';
import fs from 'fs';
import sudoPrompt from 'sudo-prompt';
import { promisify } from 'util';

import { createLogger } from '@/utils/logger';

const sudoExec = promisify<string, Parameters<typeof sudoPrompt.exec>[1]>(
  sudoPrompt.exec,
);

const logger = createLogger(__filename);
const DOMAINS = [
  'dev.apadana.local',
  'prod.apadana.local',
  'storybook.apadana.local',
  'prisma_studio.apadana.local',
];
const HOSTS_FILE = '/etc/hosts';

async function setupLocalDomains() {
  const certDir = `${process.cwd()}/src/docker/certs`;
  const certFile = `${certDir}/cert.pem`;
  const keyFile = `${certDir}/key.pem`;

  try {
    if (fs.existsSync(certFile) && fs.existsSync(keyFile)) {
      const hostsContent = fs.readFileSync(HOSTS_FILE, 'utf8');
      const allDomainsExist = DOMAINS.every((domain) =>
        hostsContent.includes(domain),
      );
      if (allDomainsExist) {
        logger.info('Local development environment already set up! ✨');
        return;
      }
    }

    if (process.platform !== 'darwin') {
      // TODO: Add support for Linux in setup-local-dev.ts.
      //       Windows will be supported via WSL.
      logger.error('This script is only supported on macOS');
      process.exit(1);
    }

    try {
      execSync('brew list mkcert');
    } catch {
      logger.info('Installing mkcert...');
      execSync('brew install mkcert');
      await new Promise((resolve) => setTimeout(resolve, 1000));
    }

    const mkcertPath =
      execSync('brew --prefix mkcert').toString().trim() + '/bin/mkcert';
    if (!fs.existsSync(mkcertPath)) {
      throw new Error(`mkcert binary not found at ${mkcertPath}`);
    }

    try {
      execSync('brew list nss');
    } catch {
      logger.info('Installing nss for Firefox support...');
      execSync('brew install nss');
    }

    logger.info('Initializing and generating certificates...');

    fs.mkdirSync(certDir, { recursive: true });
    const caPath = execSync(`${mkcertPath} -CAROOT`).toString().trim();

    const needHostsUpdate = !DOMAINS.every((d) => {
      const content = fs.readFileSync(HOSTS_FILE, 'utf8');
      return content.includes(d);
    });

    const entries = needHostsUpdate
      ? `\\n# Apadana local domains\\n${DOMAINS.map((d) => `127.0.0.1 ${d}`).join('\\n')}`
      : '';

    const commands = `
      ${mkcertPath} -install && 
      cd "${certDir}" && 
      ${mkcertPath} -cert-file "${certFile}" -key-file "${keyFile}" ${DOMAINS.join(' ')} &&
      cp "${caPath}/rootCA.pem" "${certDir}/rootCA.pem" &&
      chmod 644 "${certFile}" "${keyFile}" "${certDir}/rootCA.pem"${
        needHostsUpdate ? ` && sh -c 'echo "${entries}" >> ${HOSTS_FILE}'` : ''
      }
    `.trim();

    await sudoExec(commands, { name: 'LocalDevSetup' });

    logger.info(
      needHostsUpdate
        ? 'Updated /etc/hosts successfully'
        : 'Hosts file already contains required entries',
    );
    logger.info('Local development environment setup complete! ✨');
    logger.info('Root CA certificate available at:', certDir);
  } catch (error) {
    logger.error('Error setting up local development environment:', error);
    process.exit(1);
  }
}

setupLocalDomains().catch((error) => {
  logger.error('Error setting up local development environment:', error);
  process.exit(1);
});
