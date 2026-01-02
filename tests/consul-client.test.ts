import { afterEach, describe, expect, it, vi } from 'vitest';
import { ConsulClient } from '../src/discovery/consul-client.js';

describe('ConsulClient', () => {
  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it('should discover healthy service instances', async () => {
    const fetchMock = vi.fn().mockResolvedValue({
      ok: true,
      status: 200,
      json: async () => [
        {
          Service: {
            ID: 'service-a',
            Service: 'service-a',
            Address: 'host.docker.internal',
            Port: 3102,
          },
        },
        {
          Service: {
            ID: 'service-a-2',
            Service: 'service-a',
            Address: 'host.docker.internal',
            Port: 3104,
          },
        },
      ],
    } as Response);

    vi.stubGlobal('fetch', fetchMock);

    const client = new ConsulClient('http://127.0.0.1:8500/');

    const services = await client.discoverService('service-a');

    expect(fetchMock).toHaveBeenCalledWith(
      'http://127.0.0.1:8500/v1/health/service/service-a?passing=true',
    );

    expect(services).toEqual([
      {
        serviceId: 'service-a',
        serviceName: 'service-a',
        address: 'host.docker.internal',
        port: 3102,
      },
      {
        serviceId: 'service-a-2',
        serviceName: 'service-a',
        address: 'host.docker.internal',
        port: 3104,
      },
    ]);
  });

  it('should return an empty array when no healthy instances are found', async () => {
    const fetchMock = vi.fn().mockResolvedValue({
      ok: true,
      status: 200,
      json: async () => [],
    } as Response);

    vi.stubGlobal('fetch', fetchMock);

    const client = new ConsulClient('http://127.0.0.1:8500');

    const services = await client.discoverService('unknown-service');

    expect(services).toEqual([]);
  });

  it('should throw an error when Consul returns a failed response', async () => {
    const fetchMock = vi.fn().mockResolvedValue({
      ok: false,
      status: 500,
    } as Response);

    vi.stubGlobal('fetch', fetchMock);

    const client = new ConsulClient('http://127.0.0.1:8500');

    await expect(client.discoverService('service-a')).rejects.toThrow(
      'Consul service discovery failed with status 500',
    );
  });

  it('should propagate network errors', async () => {
    const fetchMock = vi.fn().mockRejectedValue(new Error('Network error'));

    vi.stubGlobal('fetch', fetchMock);

    const client = new ConsulClient('http://127.0.0.1:8500');

    await expect(client.discoverService('service-a')).rejects.toThrow('Network error');
  });

  it('should encode service names in the request URL', async () => {
    const fetchMock = vi.fn().mockResolvedValue({
      ok: true,
      status: 200,
      json: async () => [],
    } as Response);

    vi.stubGlobal('fetch', fetchMock);

    const client = new ConsulClient('http://127.0.0.1:8500');

    await client.discoverService('service name');

    expect(fetchMock).toHaveBeenCalledWith(
      'http://127.0.0.1:8500/v1/health/service/service%20name?passing=true',
    );
  });
});
