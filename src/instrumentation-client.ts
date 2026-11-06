import { registerServiceWorker } from '@/lib/register-service-worker';

// Runs on every page before React hydrates. The worker only shows push messages, so there is nothing to wait for.
registerServiceWorker();
