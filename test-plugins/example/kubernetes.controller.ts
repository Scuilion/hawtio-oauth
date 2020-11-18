namespace Example {

  export function page3Controller($scope, userDetails: Core.AuthService): void {
    'ngInject';
    log.debug("userDetails:", userDetails);
    $scope.userDetails = angular.toJson({
      username: userDetails.username,
      password: '********',
      token: userDetails.token
    }, true);
  }

}
