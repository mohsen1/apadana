import { STSClient, GetCallerIdentityCommand } from '@aws-sdk/client-sts';

(async () => {
  const stsClient = new STSClient({});
  const identity = await stsClient.send(new GetCallerIdentityCommand({}));
  console.log('Caller identity:', identity);
  console.log('Preflight checks passed.');
})(); 