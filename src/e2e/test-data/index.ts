import { APIRequestContext, Page } from '@playwright/test';
import { Prisma } from '@prisma/client';

import { Command, CommandArgs, CommandResponse } from '@/app/api/e2e/route';

export class TestData {
  #context: APIRequestContext;
  #baseURL: string;
  #disposed = false;

  constructor(context: APIRequestContext, baseURL: string) {
    this.#context = context;
    this.#baseURL = baseURL;
  }

  async #runCommand<T extends Command>(
    command: T,
    args?: CommandArgs<T>,
  ): Promise<CommandResponse<T>> {
    if (this.#disposed) {
      throw new Error('TestData has been disposed');
    }

    const secret = process.env.E2E_TESTING_SECRET;

    const response = await this.#context.post('/api/e2e', {
      headers: secret ? { 'x-e2e-testing-secret': secret } : {},
      data: { command, args: args ?? {} },
    });
    const json = (await response.json()) as CommandResponse<T>;

    if (response.status() !== 200) {
      const error = (json as { message: string }).message ?? 'Unknown error';
      throw new Error(`Failed to run command ${command}: ${error}`);
    }

    return json;
  }

  async dispose() {
    await this.#context.dispose();
    this.#disposed = true;
  }

  createUser(email: string, password: string) {
    return this.#runCommand('createUser', { email, password });
  }

  /**
   * Logs in a user and adds the session cookie to the page
   * @param email - The email of the user to log in
   * @param page - The page to add the session cookie to
   * @returns The response from the login command
   */
  async login(email: string, page: Page) {
    const response = await this.#runCommand('login', { email });

    const url = new URL(this.#baseURL);

    const cookieData = {
      name: response.cookieName,
      value: response.sessionId,
      expires: Math.floor(new Date(response.sessionExpiresAt).getTime() / 1000),
      httpOnly: true,
      path: '/',
      secure: true,
      domain: url.hostname,
    };

    await page.context().addCookies([cookieData]);
    return response;
  }

  createListing(listing: Prisma.ListingCreateInput) {
    return this.#runCommand('createListing', listing);
  }

  deleteListing(id: string) {
    return this.#runCommand('deleteListing', { id });
  }

  deleteAllE2eListings() {
    return this.#runCommand('deleteAllE2eListings');
  }
}
