export interface DiscoveredService {
  serviceId: string;
  serviceName: string;
  address: string;
  port: number;
}

interface ConsulServiceEntry {
  Service: {
    ID: string;
    Service: string;
    Address: string;
    Port: number;
  };
}

export class ConsulClient {
  private readonly consulAddress: string;

  constructor(consulAddress: string) {
    this.consulAddress = consulAddress.replace(/\/+$/, '');
  }

  async discoverService(serviceName: string): Promise<DiscoveredService[]> {
    const encodedServiceName = encodeURIComponent(serviceName);
    const url = `${this.consulAddress}/v1/health/service/${encodedServiceName}?passing=true`;

    const response = await fetch(url);

    if (!response.ok) {
      throw new Error(`Consul service discovery failed with status ${response.status}`);
    }

    const entries = (await response.json()) as ConsulServiceEntry[];

    return entries.map((entry) => ({
      serviceId: entry.Service.ID,
      serviceName: entry.Service.Service,
      address: entry.Service.Address,
      port: entry.Service.Port,
    }));
  }
}
