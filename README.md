# grpc-client-action

This is a GitHub action that builds gRPC client for JS and publishes it to the private npm registry.

## Action inputs

  - `proto-path`  
    Path to directory with .proto files   
    required: true
  - `root-proto-filename`  
    Name of the root proto file inside the proto-path  
    required: false  
    default: `root.proto`
  - `proto-package-name`  
    Package of the root proto file  
    required: true
  - `npm-package-name`  
    Package name on the npm registry  
    required: true
  - `npm-package-version`  
    Version of the npm package  
    required: true
  - `npm-auth-token`  
    Auth token to the npm registry  
    required: true

## Action outputs
  - `published-versions-number`  
    Number of already published versions that are available in registry

## Example usage
```yml
name: CI

on:
  push:
    branches:
      - 'master'

jobs:
  publish_js_client:
    runs-on: ubuntu-latest

    strategy:
      matrix:
        node-version: [14.x]

    steps:
      - uses: actions/checkout@v2
      # A new tag may be created (used for versioning npm package)
      # When using first time a version tag must be created before running the action
      - name: Bump version
        id: bump_version
        uses: zwaldowski/semver-release-action@v1
        with:
          bump: patch
          github_token: ${{ secrets.GITHUB_TOKEN }}
      - id: js_client
        name: Publish new JS client
        uses: coinpanel/grpc-client-action
        with:
          proto-path: ./pb # path to the directory that stores proto files (it will be copied to the client)
          proto-package-name: SecretManager # package name from proto files
          npm-package-name: '@coinpanel/${{ github.event.repository.name }}' # name upon which the package is published
          npm-package-version: ${{ steps.bump_version.outputs.version }} # version upon which the package is published
          npm-auth-token: ${{ secrets.GITHUB_TOKEN }} # token for npm registry authentication
      # Old version can be deleted to free some space
      - name: Delete old packages
        uses: actions/delete-package-versions@v1
        if: steps.js_client.outputs.published-versions-number > 2
        with:
          package-name: ${{ github.event.repository.name }}

```

## JS client

The JS client provides all proto files along with TypeScript types of the gRPC services.

### Login to the npm registry
1. Generate personal access token for the account in github settings
2. npm login: `npm login --registry=https://npm.pkg.github.com --scope=@coinpanel`
3. Provide GH username, token from point 1. as a password and email

### Install a client package
`yarn add {{npm-package-name}}`, e.g. `yarn add @coinpanel/grpc`

### Update a client package
`yarn add {{npm-package-name}}`, e.g. `yarn add @coinpanel/grpc`

### Usage with Nest

1. Install a client package

2. Register GRPC client:

```typescript
// app.module.ts

import { Module } from '@nestjs/common';
import { ClientsModule, Transport } from '@nestjs/microservices';
import { AppController } from './app.controller';
import { AppService } from './app.service';

import { getServiceConfig } from '@coinpanel/grpc'; // module name equals "npm-package-name" action input

// get proto configuration for a particular service
const SecretManagerConfig = getServiceConfig();

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
