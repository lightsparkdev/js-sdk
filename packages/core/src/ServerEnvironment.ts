enum ServerEnvironment {
  PRODUCTION = "production",
  DEV = "dev",
}

export const apiDomainForEnvironment = (
  environment: ServerEnvironment,
): string => {
  switch (environment) {
    case ServerEnvironment.DEV:
      return "api.dev.dev.sparkinfra.net";
    case ServerEnvironment.PRODUCTION:
      return "api.lightspark.com";
  }
};

export default ServerEnvironment;
