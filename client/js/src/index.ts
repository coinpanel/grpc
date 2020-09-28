import path from 'path';

export enum SERVICE { SecretManager }

interface ServiceConfig {
  protoPath: string,
  package: string,
}

interface ServicesConfig {
  [key: number]: ServiceConfig
}

const servicesConfig: ServicesConfig = {
  [SERVICE.SecretManager]: {
    protoPath: 'SecretManager/root.proto',
    package: 'SecretManager',
  },
};

export const getServiceConfig = (serviceName: SERVICE) => {
  if (!servicesConfig[serviceName]) {
    throw new Error(`There's no protofile registered for the service ${serviceName}`);
  }

  const config = servicesConfig[serviceName];
  const protoPath = path.join(__dirname, './proto', config.protoPath);

  return {
    ...config,
    protoPath,
  };
};
