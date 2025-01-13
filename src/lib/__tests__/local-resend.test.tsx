import React from 'react';
import { afterEach, beforeEach, describe, expect, test } from 'vitest';

import prisma from '@/lib/prisma/client';

import { LocalResend } from '../email/local-resend';

describe('LocalResend', () => {
  let localResend: LocalResend;

  beforeEach(async () => {
    localResend = new LocalResend();
  });

  afterEach(async () => {
    await prisma.localEmail.deleteMany();
  });

  test('emails.send writes single recipient email to database', async () => {
    const payload = {
      from: 'test@example.com',
      to: 'recipient@example.com',
      subject: 'Test Email',
      html: '<p>Hello</p>',
    };

    const result = await localResend.emails.send(payload);
    expect(result.error).toBeNull();
    expect(result.data?.id).toBeDefined();

    const savedEmail = await prisma.localEmail.findUnique({
      where: { id: result.data?.id },
    });

    expect(savedEmail).toMatchObject({
      from: payload.from,
      to: payload.to,
      subject: payload.subject,
      html: payload.html,
    });
  });

  test('emails.send writes multiple recipients to database', async () => {
    const payload = {
      from: 'test@example.com',
      to: ['recipient1@example.com', 'recipient2@example.com'],
      subject: 'Test Email',
      html: '<p>Hello</p>',
    };

    const result = await localResend.emails.send(payload);
    expect(result.error).toBeNull();
    expect(result.data?.id).toBeDefined();

    const savedEmail = await prisma.localEmail.findUnique({
      where: { id: result.data?.id },
    });

    expect(savedEmail).toMatchObject({
      from: payload.from,
      to: 'recipient1@example.com, recipient2@example.com',
      subject: payload.subject,
      html: payload.html,
    });
  });

  test('emails.send writes React component email to database', async () => {
    const TestComponent = () => <div>Hello from React</div>;
    const payload = {
      from: 'test@example.com',
      to: 'recipient@example.com',
      subject: 'Test Email',
      react: <TestComponent />,
    };

    const result = await localResend.emails.send(payload);
    expect(result.error).toBeNull();
    expect(result.data?.id).toBeDefined();

    const savedEmail = await prisma.localEmail.findUnique({
      where: { id: result.data?.id },
    });

    expect(savedEmail).toBeDefined();
    expect(savedEmail?.from).toBe(payload.from);
    expect(savedEmail?.to).toBe(payload.to);
    expect(savedEmail?.subject).toBe(payload.subject);
    expect(savedEmail?.html).toContain('Hello from React');
  });

  test('unimplemented methods throw errors', async () => {
    await expect(localResend.emails.create()).rejects.toThrow('not implemented');
    await expect(localResend.emails.get()).rejects.toThrow('not implemented');
    await expect(localResend.emails.update()).rejects.toThrow('not implemented');
    await expect(localResend.emails.cancel()).rejects.toThrow('not implemented');
  });
});
