import type { Env } from "@env-entity";

type EnvironmentServiceProxy = Readonly<Env>;
type EnvObject = {
  env?: Env;
};

const createProxy = (): EnvironmentServiceProxy => {
  const service: EnvObject = { env: undefined };

  const handler: ProxyHandler<EnvObject> = {
    get(target, prop) {
      if (!target.env) throw new Error("Environment is not initialized.");
      if (prop in target.env) {
        return target.env[prop as keyof Env];
      }
      throw new Error(
        `Property "${String(prop)}" is not defined in environment.`,
      );
    },
  };

  return new Proxy(service, handler) as EnvironmentServiceProxy;
};

export const ENV = createProxy();
export const setEnv = (env: Env): void => {
  (ENV as unknown as { env: Env }).env = env;
};
