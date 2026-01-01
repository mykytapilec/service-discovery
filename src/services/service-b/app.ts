import Fastify from 'fastify';

export function buildServiceBApp() {
  const app = Fastify({
    logger: true,
  });

  app.get('/info', async () => {
    return {
      service: 'service-b',
      timestamp: new Date().toISOString(),
    };
  });

  app.get('/health', async () => {
    return {
      status: 'ok',
    };
  });

  return app;
}
