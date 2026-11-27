import { afterAll, describe, expect, it } from 'vitest';
import { buildServiceAApp } from '../src/services/service-a/app.js';

describe('Service A', () => {
  const app = buildServiceAApp();

  afterAll(async () => {
    await app.close();
  });

  it('should return service information', async () => {
    const response = await app.inject({
      method: 'GET',
      url: '/info',
    });

    expect(response.statusCode).toBe(200);

    const body = response.json();

    expect(body.service).toBe('service-a');
    expect(Number.isNaN(Date.parse(body.timestamp))).toBe(false);
  });

  it('should return a successful health check', async () => {
    const response = await app.inject({
      method: 'GET',
      url: '/health',
    });

    expect(response.statusCode).toBe(200);
    expect(response.json()).toEqual({
      status: 'ok',
    });
  });
});
