interface ServiceRegistrationOptions {
  consulAddress: string;
  serviceId: string;
  serviceName: string;
  serviceAddress: string;
  servicePort: number;
}

export async function registerService(options: ServiceRegistrationOptions): Promise<void> {
  const consulAddress = options.consulAddress.replace(/\/+$/, '');

  const response = await fetch(`${consulAddress}/v1/agent/service/register`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      ID: options.serviceId,
      Name: options.serviceName,
      Address: options.serviceAddress,
      Port: options.servicePort,
      Check: {
        HTTP: `http://${options.serviceAddress}:${options.servicePort}/health`,
        Interval: '10s',
        Timeout: '2s',
        DeregisterCriticalServiceAfter: '1m',
      },
    }),
  });

  if (!response.ok) {
    throw new Error(`Consul registration failed with status ${response.status}`);
  }
}

export async function deregisterService(consulAddress: string, serviceId: string): Promise<void> {
  const baseUrl = consulAddress.replace(/\/+$/, '');
  const encodedServiceId = encodeURIComponent(serviceId);

  const response = await fetch(`${baseUrl}/v1/agent/service/deregister/${encodedServiceId}`, {
    method: 'PUT',
  });

  if (!response.ok) {
    throw new Error(`Consul deregistration failed with status ${response.status}`);
  }
}
