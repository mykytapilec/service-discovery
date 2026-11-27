import { afterEach, describe, expect, it, vi } from 'vitest';
import { deregisterService, registerService } from '../src/services/service-a/consul.js';

describe('Service A Consul integration', () => {
  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it('should register Service A with Consul', async () => {
    const fetchMock = vi.fn().mockResolvedValue({
      ok: true,
      status: 200,
    } as Response);

    vi.stubGlobal('fetch', fetchMock);

    await registerService({
      consulAddress: 'http://127.0.0.1:8500/',
      serviceId: 'service-a',
      serviceName: 'service-a',
      serviceAddress: 'host.docker.internal',
      servicePort: 3102,
    });

    expect(fetchMock).toHaveBeenCalledWith(
      'http://127.0.0.1:8500/v1/agent/service/register',
      expect.objectContaining({
        method: 'PUT',
      }),
    );

    const request = fetchMock.mock.calls[0]?.[1] as RequestInit;
    const body = JSON.parse(request.body as string);

    expect(body).toMatchObject({
      ID: 'service-a',
      Name: 'service-a',
      Address: 'host.docker.internal',
      Port: 3102,
    });
  });

  it('should deregister Service A from Consul', async () => {
    const fetchMock = vi.fn().mockResolvedValue({
      ok: true,
      status: 200,
    } as Response);

    vi.stubGlobal('fetch', fetchMock);

    await deregisterService('http://127.0.0.1:8500', 'service-a');

    expect(fetchMock).toHaveBeenCalledWith(
      'http://127.0.0.1:8500/v1/agent/service/deregister/service-a',
      {
        method: 'PUT',
      },
    );
  });

  it('should throw an error when Consul registration fails', async () => {
    const fetchMock = vi.fn().mockResolvedValue({
      ok: false,
      status: 500,
    } as Response);

    vi.stubGlobal('fetch', fetchMock);

    await expect(
      registerService({
        consulAddress: 'http://127.0.0.1:8500',
        serviceId: 'service-a',
        serviceName: 'service-a',
        serviceAddress: 'host.docker.internal',
        servicePort: 3102,
      }),
    ).rejects.toThrow('Consul registration failed with status 500');
  });
});
