import Fastify from 'fastify';

export function buildServiceAApp() {
  const app = Fastify({
    logger: true,
  });

  app.get('/info', async () => {
    return {
      service: 'service-a',
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
