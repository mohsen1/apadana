/* eslint-disable no-console */
// reporters/vercel-logs-reporter.ts
import { FullResult, Reporter } from '@playwright/test/reporter';
import * as cheerio from 'cheerio';
import { execSync } from 'child_process';
import * as fs from 'fs';
import * as path from 'path';

import { assertError } from '@/utils';

interface VercelLogEntry {
  id: string;
  timestamp: number;
  message: string;
  type: string;
}

interface Deployment {
  uid: string;
  name: string;
  url: string;
  meta: {
    gitCommitSha: string;
    gitCommitMessage: string;
    gitCommitAuthorName: string;
    [key: string]: unknown;
  };
  createdAt: string; // Assuming createdAt is available
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
    this.reportPath = path.join(this.outputDir, 'report.html');
    this.vercelToken = process.env.VERCEL_TOKEN || '';
    this.commitSha =
      process.env.GITHUB_SHA ||
      execSync('git rev-parse HEAD').toString().trim();
    this.maxLogs = this.config.reporterOptions?.maxLogs || 100_000;

    console.log(
      'Vercel Logs Reporter initialized with commit SHA:',
      this.commitSha,
    );
  }

  async onEnd(_result: FullResult) {
    try {
      const logs = await this.fetchVercelLogs();
      console.log('Fetched Vercel logs:', logs.length, 'logs');
      if (logs.length > 0) {
        this.appendLogsToReport(logs);
      } else {
        console.warn('No Vercel logs to append.');
        this.appendErrorToReport(`No Vercel logs found for ${this.commitSha}`);
      }
    } catch (error) {
      assertError(error);
      console.error('Error fetching or appending Vercel logs:', error);
      this.appendErrorToReport(error.message);
    }
  }

  /**
   * Fetches Vercel deployment logs based on the commit SHA.
   */
  private async fetchVercelLogs(): Promise<VercelLogEntry[]> {
    if (!this.vercelToken) {
      console.warn('Vercel API token is not provided.');
      return [];
    }

    if (!this.commitSha) {
      console.warn('GitHub commit SHA is not provided.');
      return [];
    }

    // Step 1: Get Deployment ID using Commit SHA
    const deploymentsUrl = `https://api.vercel.com/v6/deployments?meta-gitCommitSha=${this.commitSha}`;
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
    const deployments: Deployment[] = deploymentsData.deployments;

    if (!deployments || deployments.length === 0) {
      console.warn('No deployments found for the given commit SHA.');
      return [];
    }

    // Sort deployments by creation date descending to get the latest
    const sortedDeployments = deployments.sort(
      (a, b) =>
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
    );
    const deploymentId = sortedDeployments[0].uid;

    // Step 2: Fetch Logs for the Deployment
    const logsUrl = `https://api.vercel.com/v2/deployments/${deploymentId}/logs?limit=${this.maxLogs}`;
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

    const logsData = await logsResponse.json();
    const logs: VercelLogEntry[] = logsData.logs;

    return logs;
  }

  /**
   * Appends the fetched Vercel logs to the Playwright HTML report.
   * @param logs Array of Vercel log entries.
   */
  private appendLogsToReport(logs: VercelLogEntry[]) {
    if (!fs.existsSync(this.reportPath)) {
      console.warn('Playwright HTML report not found at:', this.reportPath);
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
                  (log) => `
                <tr>
                  <td style="padding: 0.5rem; border-bottom: 1px solid #eee;">${new Date(log.timestamp).toLocaleString()}</td>
                  <td style="padding: 0.5rem; border-bottom: 1px solid #eee;">${this.escapeHtml(log.type)}</td>
                  <td style="padding: 0.5rem; border-bottom: 1px solid #eee;">${this.escapeHtml(log.message)}</td>
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
    fs.writeFileSync(this.reportPath, $.html(), 'utf-8');
    console.log('Vercel logs appended to Playwright HTML report.');
  }

  /**
   * Appends an error message to the Playwright HTML report.
   * @param errorMessage The error message to append.
   */
  private appendErrorToReport(errorMessage: string) {
    if (!fs.existsSync(this.reportPath)) {
      console.warn('Playwright HTML report not found at:', this.reportPath);
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
    console.log('Error message appended to Playwright HTML report.');
  }

  /**
   * Escapes HTML characters to prevent injection.
   * @param unsafe The unsafe string to escape.
   * @returns The escaped string.
   */
  private escapeHtml(unsafe: string): string {
    return cheerio.load(`<div>${unsafe}</div>`).text();
  }
}

export default VercelLogsReporter;
