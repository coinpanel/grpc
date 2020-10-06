import path from 'path';

interface ServiceConfig {
  protoPath: string,
  package: string,
}

export const getServiceConfig = (): ServiceConfig => {
  const protoPath = path.join(__dirname, './proto', process.env.ROOT_PROTO_FILENAME);

  return {
    package: process.env.PROTO_PACKAGE_NAME,
    protoPath,
  };
};

export default { getServiceConfig };
