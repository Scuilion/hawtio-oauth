/// <reference path="osOAuthGlobals.ts"/>
namespace OSOAuth {

  const OS_TOKEN_STORAGE_KEY = 'osAuthCreds';

  export function currentTimeSeconds() {
    return Math.floor(new Date().getTime() / 1000);
  }

  export function authenticatedHttpRequest(options, userDetails) {
    return $.ajax(_.extend(options, {
      beforeSend: (request) => {
        if (userDetails.token) {
          request.setRequestHeader('Authorization', 'Bearer ' + userDetails.token);
        }
      }
    }));
  }

  export function doLogout(config = window['OSOAuthConfig'], userDetails = OSOAuth.userProfile) {
    const openShiftConfig = window['OPENSHIFT_CONFIG'];
    const currentURI = new URI(window.location.href);
    const uri = new URI(openShiftConfig.master_uri);
    uri.segment(`/apis/oauth.openshift.io/v1/oauthaccesstokens/${userDetails.token}`);
    // The following request returns 403 when delegated authentication with an OAuthClient is used, as possible scopes do not grant permissions to access the OAuth API:
    // See https://github.com/openshift/origin/issues/7011
    authenticatedHttpRequest({
      type: 'DELETE',
      url : uri.toString(),
    }, userDetails).always(() => {
      clearTokenStorage();
      doLogin(OSOAuthConfig, {
        uri: currentURI.toString(),
      });
    });
  }

  export function doLogin(config, options) {
    const clientId  = config.oauth_client_id;
    const targetURI = config.oauth_authorize_uri;
    const uri       = new URI(targetURI);
    uri.query({
      client_id    : clientId,
      response_type: 'token',
      state        : options.uri,
      redirect_uri : options.uri,
      scope        : config.scope
    });
    const target = uri.toString();
    log.debug("Redirecting to URI: ", target);
    window.location.href = target;
  }

  export function extractToken(uri) {
    const query = uri.query(true);
    log.debug("Query: ", query);
    const fragmentParams: any = new URI("?" + uri.fragment()).query(true);
    log.debug("FragmentParams: ", fragmentParams);
    if (fragmentParams.access_token && (fragmentParams.token_type === "bearer") || fragmentParams.token_type === "Bearer") {
      log.debug("Got token");
      const localStorage          = Core.getLocalStorage();
      const creds                 = {
        token_type  : fragmentParams.token_type,
        access_token: fragmentParams.access_token,
        expires_in  : fragmentParams.expires_in,
        obtainedAt  : currentTimeSeconds()
      };
      localStorage[OS_TOKEN_STORAGE_KEY] = angular.toJson(creds);
      delete fragmentParams.token_type;
      delete fragmentParams.access_token;
      delete fragmentParams.expires_in;
      delete fragmentParams.scope;
      uri.fragment("").query(query);
      const target = uri.toString();
      log.debug("redirecting to: ", target);
      window.location.href = target;
      return creds;
    } else {
      log.debug("No token in URI");
      return undefined;
    }
  }

  export function clearTokenStorage() {
    const localStorage = Core.getLocalStorage();
    delete localStorage[OS_TOKEN_STORAGE_KEY];
  }

  export function checkToken(uri):any {
    const localStorage = Core.getLocalStorage();
    let answer         = undefined;
    if (OS_TOKEN_STORAGE_KEY in localStorage) {
      try {
        answer = angular.fromJson(localStorage[OS_TOKEN_STORAGE_KEY]);
      } catch (e) {
        clearTokenStorage();
        // must be broken...
        log.debug("Error extracting osAuthCreds value: ", e);
      }
    }
    if (!answer) {
      answer = extractToken(uri);
    }
    log.debug("Using creds: ", answer);
    return answer;
  }
}
