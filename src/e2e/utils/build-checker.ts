import { exec } from 'child_process';
import crypto from 'crypto';
import fs from 'fs';
import { IncomingMessage } from 'http';
import https from 'https';
import ignore from 'ignore';
import path from 'path';
import { promisify } from 'util';

import { createLogger } from '@/utils/logger';

const logger = createLogger('build-checker', 'info');
const execAsync = promisify(exec);

export class BuildChecker {
  #CACHE_FILE = '.cache/src-checksum';
  #MAX_BUILD_WAIT_TIME = 5 * 60 * 1000; // 5 minutes
  #CHECK_INTERVAL = 5000; // 5 seconds
  #gitIgnore: ReturnType<typeof ignore>;

  constructor() {
    this.#gitIgnore = ignore();
    if (fs.existsSync('.gitignore')) {
      this.#gitIgnore.add(fs.readFileSync('.gitignore').toString());
    }
  }

  #calculateSrcChecksum(): string {
    logger.debug('Starting source checksum calculation');
    const getAllFiles = (dirPath: string, arrayOfFiles: string[] = []): string[] => {
      logger.debug(`Scanning directory: ${dirPath}`);
      const files = fs.readdirSync(dirPath);

      files.forEach((file) => {
        const fullPath = path.join(dirPath, file);
        const relativePath = path.relative('.', fullPath);

        if (this.#gitIgnore.ignores(relativePath)) {
          logger.debug(`Ignoring file: ${relativePath}`);
          return;
        }

        if (fs.statSync(fullPath).isDirectory()) {
          if (!fullPath.includes('src/e2e')) {
            logger.debug(`Entering directory: ${fullPath}`);
            arrayOfFiles = getAllFiles(fullPath, arrayOfFiles);
          } else {
            logger.debug(`Skipping e2e directory: ${fullPath}`);
          }
        } else {
          logger.debug(`Adding file to checksum: ${fullPath}`);
          arrayOfFiles.push(fullPath);
        }
      });

      return arrayOfFiles;
    };

    const files = getAllFiles('./src');
    logger.debug(`Found ${files.length} files to hash`);
    const hash = crypto.createHash('md5');

    files.forEach((file) => {
      hash.update(fs.readFileSync(file));
    });

    const checksum = hash.digest('hex');
    logger.debug(`Calculated checksum: ${checksum}`);
    return checksum;
  }

  async #waitForBuild(): Promise<boolean> {
    const startTime = Date.now();
    logger.debug('Starting build wait loop');

    const cert = fs.readFileSync(path.join(process.cwd(), 'src/docker/certs/cert.pem'));
    const key = fs.readFileSync(path.join(process.cwd(), 'src/docker/certs/key.pem'));
    const ca = fs.readFileSync(path.join(process.cwd(), 'src/docker/certs/rootCA.pem'));
    const agent = new https.Agent({
      cert,
      key,
      ca,
      rejectUnauthorized: false,
    });

    while (Date.now() - startTime < this.#MAX_BUILD_WAIT_TIME) {
      try {
        logger.debug('Checking build status...');
        const response = await new Promise<IncomingMessage>((resolve, reject) => {
          const req = https.get('https://prod.apadana.local', { agent }, resolve);
          req.on('error', reject);
        });

        let text = '';
        for await (const chunk of response) {
          text += chunk;
        }

        if (!text.includes('<title>Building...</title>')) {
          logger.debug('Build completed detection');
          return true;
        }
        logger.debug('Build still in progress...');
      } catch (error) {
        logger.debug('Connection error while checking build status', error);
      }

      logger.debug(`Waiting ${this.#CHECK_INTERVAL}ms before next check`);
      await new Promise((resolve) => setTimeout(resolve, this.#CHECK_INTERVAL));
    }

    logger.debug('Build wait timeout reached');
    return false;
  }

  async checkAndRebuildIfNeeded(): Promise<void> {
    try {
      logger.debug('Starting build check process');
      const currentChecksum = this.#calculateSrcChecksum();

      if (!fs.existsSync('.cache')) {
        logger.debug('Creating cache directory');
        fs.mkdirSync('.cache');
      }

      let previousChecksum = '';
      if (fs.existsSync(this.#CACHE_FILE)) {
        previousChecksum = fs.readFileSync(this.#CACHE_FILE, 'utf8');
        logger.debug(`Previous checksum: ${previousChecksum}`);
      } else {
        logger.debug('No previous checksum found');
      }

      if (currentChecksum !== previousChecksum) {
        logger.debug(`Checksum changed: ${previousChecksum} -> ${currentChecksum}`);
        logger.info('Source code changes detected, rebuilding...');

        logger.debug('Executing docker redeploy command');
        await execAsync('pnpm docker:prod:redeploy');

        logger.info('Redeploying docker app. Now waiting for build to complete...');
        const buildSuccess = await this.#waitForBuild();

        if (buildSuccess) {
          logger.debug('Writing new checksum to cache file');
          fs.writeFileSync(this.#CACHE_FILE, currentChecksum);
          logger.info('Build completed successfully');
        } else {
          logger.debug('Build timeout occurred');
          throw new Error('Build timed out after 5 minutes');
        }
      } else {
        logger.debug('Checksum unchanged');
        logger.info('No source code changes detected, skipping rebuild');
      }
    } catch (error) {
      logger.debug('Build check process failed', error);
      logger.error('Build check failed:', error);
      throw error;
    }
  }
}
