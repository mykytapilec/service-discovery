import { buildServiceBApp } from './app.js';
import { deregisterService, registerService } from './consul.js';

const app = buildServiceBApp();

const port = Number(process.env.SERVICE_B_PORT ?? 3103);
const host = process.env.SERVICE_B_HOST ?? '0.0.0.0';
const serviceAddress = process.env.SERVICE_B_ADDRESS ?? 'host.docker.internal';
const consulAddress = process.env.CONSUL_HTTP_ADDR ?? 'http://127.0.0.1:8500';

const serviceId = 'service-b';
const serviceName = 'service-b';

let isRegistered = false;
let isShuttingDown = false;

const shutdown = async (signal: string): Promise<void> => {
  if (isShuttingDown) {
    return;
  }

  isShuttingDown = true;

  app.log.info(`Received ${signal}. Shutting down Service B`);

  try {
    if (isRegistered) {
      await deregisterService(consulAddress, serviceId);
      isRegistered = false;

      app.log.info('Service B deregistered from Consul');
    }
  } catch (error) {
    app.log.error(error, 'Failed to deregister Service B');
    process.exitCode = 1;
  }

  try {
    await app.close();
    app.log.info('Service B stopped successfully');
  } catch (error) {
    app.log.error(error, 'Failed to close Service B');
    process.exitCode = 1;
  }
};

const start = async (): Promise<void> => {
  await app.listen({
    port,
    host,
  });

  try {
    await registerService({
      consulAddress,
      serviceId,
      serviceName,
      serviceAddress,
      servicePort: port,
    });

    isRegistered = true;

    app.log.info('Service B registered with Consul');
  } catch (error) {
    app.log.error(error, 'Failed to register Service B');

    await app.close();

    throw error;
  }

  process.once('SIGINT', () => {
    void shutdown('SIGINT');
  });

  process.once('SIGTERM', () => {
    void shutdown('SIGTERM');
  });
};

await start().catch((error: unknown) => {
  app.log.error(error);
  process.exitCode = 1;
});
