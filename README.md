# Service Discovery

A service discovery system built with Node.js, TypeScript, Fastify, and Consul.

## Overview

This project demonstrates service registration, service discovery, and communication between independent services through an API Gateway.

## Technology Stack

- Node.js
- TypeScript
- Fastify
- Consul
- Docker
- Docker Compose
- Vitest

## Project Goals

- Implement independent services.
- Register services in Consul.
- Discover services dynamically.
- Implement an API Gateway.
- Enable communication between services.
- Verify the system through automated tests.

## Consul

Consul runs in development mode using Docker Compose.

### Start Consul

```bash
docker compose up -d consul
```

### Check container status

```bash
docker compose ps
```

The Consul container should report a healthy status.

### Access the Consul UI

Open the following URL in your browser:

http://localhost:8500/ui

### Check the Consul HTTP API

```bash
curl --fail http://localhost:8500/v1/status/leader
```

The API should return the current Raft leader address.

### View Consul logs

```bash
docker compose logs -f consul
```

### Stop Consul

```bash
docker compose down
```

> Development mode stores data in memory and is intended for local development and testing only. Do not use it in production.
