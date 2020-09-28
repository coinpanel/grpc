# grpc

This is a project that handles communication between services using gRPC. It includes proto buffers and clients.

## Proto buffers

Proto files are stored in `/proto` directory in a following structure:
```
/proto
  root.proto
  /SecretManager
    secret.proto
    root.proto
```

Where root proto import is equivalent to the `index.js` in NodeJS. To make proto buffer available for the client please import it in the `/proto/root.proto`.

### Enabling service for the JS client

In order to make the gRPC service available for the JS client you need to:

1. import the proto file in `/proto/root.proto`:
```
import "SecretManager/root.proto";
```

2. register it in `/client/js/src/index.ts`:

```typescript
export enum SERVICE { SecretManager }; // used to access the service

const servicesConfig: ServicesConfig = {
  [SERVICE.SecretManager]: {
    protoPath: 'SecretManager/root.proto',
    package: 'SecretManager', // package name from proto file
  },
};
```

## Versioning

Every push to master results in creating new git tag with bumped patch version and releasing a new version of the client to the npm registry.

## JS client

The JS client provides all proto files along with TypeScript types of the gRPC services.

### Login to the npm registry
1. Generate personal access token for the account in github settings
2. npm login: `npm login --registry=https://npm.pkg.github.com --scope=@coinpanel`
3. Provide GH username, token from point 1. as a password and email

### Install a client package
`yarn add @coinpanel/grpc`

### Update a client package
`yarn add @coinpanel/grpc`

### Usage with Nest

1. Install a client package

2. Register GRPC client:

```typescript
// app.module.ts

import { Module } from '@nestjs/common';
import { ClientsModule, Transport } from '@nestjs/microservices';
import { AppController } from './app.controller';
import { AppService } from './app.service';

import { getServiceConfig, SERVICE } from '@coinpanel/grpc';

// get proto configuration for a particular service
const SecretManagerConfig = getServiceConfig(SERVICE.SecretManager);

@Module({
  imports: [
    ClientsModule.register([
      {
        name: 'SECRET_MANAGER',
        transport: Transport.GRPC,
        options: {
          url: 'localhost:5678',
          package: SecretManagerConfig.package,
          protoPath: SecretManagerConfig.protoPath,
        }
      }
    ]),
  ],
  controllers: [AppController],
  providers: [AppService],
})

export class AppModule {}
```

3. Consume the gRPC service

```typescript
// app.service.ts (or any other service)

import { Injectable, Inject } from '@nestjs/common';
import { ClientGrpc } from '@nestjs/microservices';

// types for gRPC client
import { SecretManager } from '@coinpanel/grpc/types';

@Injectable()
export class AppService {
  private secretService: SecretManager.SecretService;

  constructor(@Inject('SECRET_MANAGER') private client: ClientGrpc) {}

  onModuleInit() {
    // extracting particular gRPC service
    this.secretService = this.client
      .getService<SecretManager.SecretService>(SecretManager.SecretService.name);
  }

  // consuming gRPC service
  getSecret(): Promise<SecretManager.ISecret> {
    return this.secretService.findOne({ id: 1 });
  }
}

```
