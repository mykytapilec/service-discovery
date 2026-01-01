import { afterEach, describe, expect, it, vi } from 'vitest';
import { deregisterService, registerService } from '../src/services/service-b/consul.js';

describe('Service B Consul integration', () => {
  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it('should register Service B with Consul', async () => {
    const fetchMock = vi.fn().mockResolvedValue({
      ok: true,
      status: 200,
    } as Response);

    vi.stubGlobal('fetch', fetchMock);

    await registerService({
      consulAddress: 'http://127.0.0.1:8500/',
      serviceId: 'service-b',
      serviceName: 'service-b',
      serviceAddress: 'host.docker.internal',
      servicePort: 3103,
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
      ID: 'service-b',
      Name: 'service-b',
      Address: 'host.docker.internal',
      Port: 3103,
    });
  });

  it('should deregister Service B from Consul', async () => {
    const fetchMock = vi.fn().mockResolvedValue({
      ok: true,
      status: 200,
    } as Response);

    vi.stubGlobal('fetch', fetchMock);

    await deregisterService('http://127.0.0.1:8500', 'service-b');

    expect(fetchMock).toHaveBeenCalledWith(
      'http://127.0.0.1:8500/v1/agent/service/deregister/service-b',
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
        serviceId: 'service-b',
        serviceName: 'service-b',
        serviceAddress: 'host.docker.internal',
        servicePort: 3103,
      }),
    ).rejects.toThrow('Consul registration failed with status 500');
  });
});
