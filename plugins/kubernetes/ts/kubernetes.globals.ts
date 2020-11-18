/// <reference path="../../oauth.globals.ts"/>
namespace KubernetesToken {
  export const pluginName = 'hawtio-kubernetes-token';
  export const log: Logging.Logger = Logger.get(pluginName);

  export type KubernetesConfig = {
    token: string;
  }
  export let config: KubernetesConfig = null;

  export let userProfile: any = null;

}
