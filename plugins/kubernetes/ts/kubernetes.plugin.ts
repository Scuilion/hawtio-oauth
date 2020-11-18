/// <reference path="kubernetes.helpers.ts"/>
namespace KubernetesToken {

  HawtioOAuth.oauthPlugins.push('KubernetesToken');
  angular.module(pluginName, []);
  hawtioPluginLoader
    .addModule(pluginName)
    .registerPreBootstrapTask({
      name: 'KeycloakToken',
      task: (next) => loadToken(next),
    })

  function loadToken(callback: () => void): void {
    if (!config) {
      log.debug("kubernetes token disabled");
      callback();
      return;
    }
    userProfile = {};
    userProfile.token = config.token;
    callback();
    return;
  }
}
