/* eslint-disable no-console */
// eslint-disable-next-line @typescript-eslint/no-var-requires
const SmeeClient = require('smee-client');

const PORT = process.env.PORT || 3000;
const smee = new SmeeClient({
  source: 'https://smee.io/SU8oEMflbeyvuv',
  target: `http://localhost:${PORT}/api/webhooks`,
  logger: console,
});

const events = smee.start();

events.on('connect', (origin, targets) => {
  console.log('[smee-client] Connected to', origin, 'with targets', targets);
});

events.on('disconnect', (origin, targets, error) => {
  console.log(
    '[smee-client] Disconnected from',
    origin,
    'with targets',
    targets,
    'and error',
    error,
  );
});

// on ctrl+c, stop the smee client
process.on('SIGINT', () => {
  console.log('[smee-client] Stopping smee client');
  smee.stop();
  process.exit(0);
});
