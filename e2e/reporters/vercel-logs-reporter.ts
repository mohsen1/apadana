// reporters/vercel-logs-reporter.ts
import { Reporter } from '@playwright/test/reporter';
import * as cheerio from 'cheerio';
import { execSync } from 'child_process';
import * as fs from 'fs';
import * as path from 'path';

import { retryAsync } from '@/lib/utils';

import { assertError } from '@/utils';

interface VercelLogEntry {
  created: number;
  date: number;
  deploymentId: string;
  id: string;
  text: string;
  type: string;
  serial: string;
  info: {
    type: string;
    name: string;
    entrypoint: string;
  };
}

interface Deployment {
  uid: string;
  meta: {
    gitCommitSha: string;
    gitCommitMessage: string;
    gitCommitAuthorName: string;
    [key: string]: unknown;
  };
  createdAt: number;
}
export interface VercelLogsReporterOptions {
  config: {
    reporterOptions: {
      outputDir: string;
      maxLogs: number;
    };
  };
}

export class VercelLogsReporter implements Reporter {
  private config: VercelLogsReporterOptions['config'];
  private outputDir: string;
  private reportPath: string;
  private vercelToken: string;
  private commitSha: string;
  private maxLogs: number;

  constructor(options: VercelLogsReporterOptions) {
    this.config = options.config;
    this.outputDir = this.config.reporterOptions?.outputDir || 'test-results';
    this.reportPath = path.join(this.outputDir, 'html.html');
    this.vercelToken = process.env.VERCEL_TOKEN || '';
    this.commitSha =
      process.env.GITHUB_SHA ||
      execSync('git rev-parse HEAD').toString().trim();
    this.maxLogs = this.config.reporterOptions?.maxLogs || 100_000;

    this.log(
      'Vercel Logs Reporter initialized with commit SHA:',
      this.commitSha,
    );
  }

  log(...messages: string[]) {
    // eslint-disable-next-line no-console
    console.log(`[Vercel Logs Reporter] ${messages.join(' ')}`);
  }

  async onExit() {
    try {
      const logs = await this.fetchVercelLogs();
      this.log(`Fetched Vercel logs: ${logs.length} logs`);
      if (logs.length > 0) {
        await this.appendLogsToReport(logs);
      } else {
        this.log('No Vercel logs to append.');
        await this.appendErrorToReport(
          `No Vercel logs found for ${this.commitSha}`,
        );
      }
    } catch (error) {
      assertError(error);
      this.log(`Error fetching or appending Vercel logs: ${error.stack}`);
      await this.appendErrorToReport(error.message);
    }
  }

  /**
   * Fetches Vercel deployments based on the commit SHA.
   */
  async fetchVercelDeployment(): Promise<Deployment | null> {
    const deploymentsUrl = `https://api.vercel.com/v6/deployments`;
    const deploymentsResponse = await fetch(deploymentsUrl, {
      headers: {
        Authorization: `Bearer ${this.vercelToken}`,
      },
    });

    if (!deploymentsResponse.ok) {
      throw new Error(
        `Failed to fetch deployments: ${deploymentsResponse.status} ${deploymentsResponse.statusText}`,
      );
    }

    const deploymentsData = await deploymentsResponse.json();

    if (!deploymentsData.deployments) {
      this.log('No deployments found for the given commit SHA.');
      return null;
    }
    const deployments: Deployment[] = deploymentsData.deployments;

    const deployment = deployments.filter(
      (deployment) => deployment.meta.githubCommitSha === this.commitSha,
    )[0];

    if (!deployment) {
      this.log('No deployment found for the given commit SHA.');
      return null;
    }
    return deployment;
  }

  /**
   * Fetches Vercel deployment logs based on the commit SHA.
   */
  async fetchVercelLogs(): Promise<VercelLogEntry[]> {
    if (!this.vercelToken) {
      this.log('Vercel API token is not provided.');
      return [];
    }

    if (!this.commitSha) {
      this.log('GitHub commit SHA is not provided.');
      return [];
    }
    const deployment = await retryAsync(
      this.fetchVercelDeployment.bind(this),
      3,
      1000,
    );

    if (!deployment) {
      this.log('No deployment found for the given commit SHA.');
      return [];
    }

    const deploymentId = deployment.uid;

    // Step 2: Fetch Logs for the Deployment
    const logsUrl = `https://api.vercel.com/v3/deployments/${deploymentId}/events?limit=${this.maxLogs}`;
    const logsResponse = await fetch(logsUrl, {
      headers: {
        Authorization: `Bearer ${this.vercelToken}`,
      },
    });

    if (!logsResponse.ok) {
      throw new Error(
        `Failed to fetch logs: ${logsResponse.status} ${logsResponse.statusText}`,
      );
    }

    const logs: VercelLogEntry[] = await logsResponse.json();

    return logs;
  }

  async waitForHtmlFileToExist(timeout: number): Promise<boolean> {
    this.log(`Waiting for HTML file to exist at: ${this.reportPath}`);
    return new Promise((resolve) => {
      const endTime = Date.now() + timeout;
      const checkFile = () => {
        if (fs.existsSync(this.reportPath)) {
          this.log(`HTML file found at: ${this.reportPath}`);
          resolve(true);
        } else if (Date.now() >= endTime) {
          this.log(
            `Timeout reached. HTML file not found at: ${this.reportPath}`,
          );
          resolve(false);
        } else {
          setTimeout(checkFile, 100);
        }
      };
      checkFile();
    });
  }
  /**
   * Appends the fetched Vercel logs to the Playwright HTML report.
   * @param logs Array of Vercel log entries.
   */
  async appendLogsToReport(logs: VercelLogEntry[]) {
    const reportExists = await this.waitForHtmlFileToExist(10000);
    if (!reportExists) {
      this.log('Playwright HTML report not found at:', this.reportPath);
      return;
    }

    const reportContent = fs.readFileSync(this.reportPath, 'utf-8');
    const $ = cheerio.load(reportContent);

    // Create a new section for Vercel Logs
    const logsSection = `
      <section id="vercel-logs" style="margin-top: 2rem;">
        <h2>Vercel Deployment Logs</h2>
        <details>
          <summary>Show Vercel Logs</summary>
        <div style="max-height: 400px; overflow: auto; background-color: #f9f9f9; padding: 1rem; border: 1px solid #ddd;">
          <table style="width: 100%; border-collapse: collapse;">
            <thead>
              <tr>
                <th style="text-align: left; border-bottom: 1px solid #ddd;">Timestamp</th>
                <th style="text-align: left; border-bottom: 1px solid #ddd;">Type</th>
                <th style="text-align: left; border-bottom: 1px solid #ddd;">Message</th>
              </tr>
            </thead>
            <tbody>
              ${logs
                .map(
                  (log: VercelLogEntry) => `
                      <tr>
                        <td style="padding: 0.5rem; border-bottom: 1px solid #eee;">${new Date(log.date).toLocaleString()}</td>
                        <td style="padding: 0.5rem; border-bottom: 1px solid #eee;">${this.escapeHtml(log.type)}</td>
                        <td style="padding: 0.5rem; border-bottom: 1px solid #eee;">${this.escapeHtml(log.text)}</td>
                      </tr>
                    `,
                )
                .join('')}
            </tbody>
          </table>
        </div>
        </details>
      </section>
    `;

    // Append the logs section before the closing </body> tag
    $('body').append(logsSection);

    // Write the modified HTML back to the report file
    this.log(`Appending Vercel logs to ${this.reportPath}`);
    fs.writeFileSync(this.reportPath, $.html(), 'utf-8');
    this.log('Vercel logs appended to Playwright HTML report.');
  }

  /**
   * Appends an error message to the Playwright HTML report.
   * @param errorMessage The error message to append.
   */
  async appendErrorToReport(errorMessage: string) {
    const reportExists = await this.waitForHtmlFileToExist(10000);
    if (!reportExists) {
      this.log('Playwright HTML report not found at:', this.reportPath);
      return;
    }

    const reportContent = fs.readFileSync(this.reportPath, 'utf-8');
    const $ = cheerio.load(reportContent);

    const errorSection = `
      <section id="vercel-logs-error" style="margin-top: 2rem;">
        <h2>Vercel Deployment Logs</h2>
        <div style="color: red;">
          <p>Error fetching Vercel logs: ${this.escapeHtml(errorMessage)}</p>
        </div>
      </section>
    `;

    $('body').append(errorSection);
    fs.writeFileSync(this.reportPath, $.html(), 'utf-8');
    this.log('Error message appended to Playwright HTML report.');
  }

  /**
   * Escapes HTML characters to prevent injection.
   * @param unsafe The unsafe string to escape.
   * @returns The escaped string.
   */
  escapeHtml(unsafe: string): string {
    return cheerio.load(`<div>${unsafe}</div>`).text();
  }
}

export default VercelLogsReporter;
