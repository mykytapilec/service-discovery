import { buildServiceAApp } from './app.js';
import { deregisterService, registerService } from './consul.js';

const app = buildServiceAApp();

const port = Number(process.env.SERVICE_A_PORT ?? 3102);
const host = process.env.SERVICE_A_HOST ?? '0.0.0.0';
const serviceAddress = process.env.SERVICE_A_ADDRESS ?? 'host.docker.internal';
const consulAddress = process.env.CONSUL_HTTP_ADDR ?? 'http://127.0.0.1:8500';

const serviceId = 'service-a';
const serviceName = 'service-a';

let isRegistered = false;
let isShuttingDown = false;

const shutdown = async (signal: string): Promise<void> => {
  if (isShuttingDown) {
    return;
  }

  isShuttingDown = true;

  app.log.info(`Received ${signal}. Shutting down Service A`);

  try {
    if (isRegistered) {
      await deregisterService(consulAddress, serviceId);
      isRegistered = false;

      app.log.info('Service A deregistered from Consul');
    }
  } catch (error) {
    app.log.error(error, 'Failed to deregister Service A');
    process.exitCode = 1;
  }

  try {
    await app.close();
    app.log.info('Service A stopped successfully');
  } catch (error) {
    app.log.error(error, 'Failed to close Service A');
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

    app.log.info('Service A registered with Consul');
  } catch (error) {
    app.log.error(error, 'Failed to register Service A');

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
