import { Worker } from 'bullmq';
import IORedis from 'ioredis';

const REDIS_URL = process.env.REDIS_URL || 'redis://localhost:6379';

async function startWorker() {
  const connection = new IORedis(REDIS_URL, {
    maxRetriesPerRequest: null,
    retryStrategy(times) {
      const delay = Math.min(times * 1000, 10000);
      console.log(`🔧 Redis connection attempt ${times}, retrying in ${delay / 1000}s...`);
      return delay;
    },
    lazyConnect: true,
  });

  // Try to connect with a timeout
  try {
    await connection.connect();
    console.log('🔧 Connected to Redis');
  } catch (err) {
    console.warn(`🔧 Could not connect to Redis at ${REDIS_URL} — worker will retry in background`);
  }

  // Handle connection errors without crashing
  connection.on('error', (err) => {
    if ((err as any).code === 'ECONNREFUSED') {
      // Suppress repeated ECONNREFUSED spam — retryStrategy handles reconnection
      return;
    }
    console.error('🔧 Redis error:', err.message);
  });

  connection.on('connect', () => {
    console.log('🔧 Redis connected');
  });

  const worker = new Worker(
    'schutzkompass',
    async (job) => {
      console.log(`Processing job ${job.id} of type ${job.name}`);

      switch (job.name) {
        case 'sbom:generate':
          console.log('SBOM generation job — not yet implemented');
          break;
        case 'sbom:parse':
          console.log('SBOM parse job — not yet implemented');
          break;
        case 'vuln:scan':
          console.log('Vulnerability scan job — not yet implemented');
          break;
        case 'pdf:generate':
          console.log('PDF generation job — not yet implemented');
          break;
        case 'email:send':
          console.log('Email sending job — not yet implemented');
          break;
        case 'reminder':
          console.log('Reminder job — not yet implemented');
          break;
        default:
          console.warn(`Unknown job type: ${job.name}`);
      }
    },
    {
      connection,
      concurrency: 5,
    }
  );

  worker.on('completed', (job) => {
    console.log(`Job ${job.id} completed`);
  });

  worker.on('failed', (job, err) => {
    console.error(`Job ${job?.id} failed:`, err.message);
  });

  worker.on('error', (err) => {
    // Prevent unhandled error from crashing the process
    console.error('🔧 Worker error:', err.message);
  });

  console.log('🔧 SchutzKompass Worker started. Waiting for jobs...');
}

startWorker().catch((err) => {
  console.error('🔧 Worker failed to start:', err.message);
  // Don't exit — let turbo keep running
});
