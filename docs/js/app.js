var DocsApp = angular
  .module('docsApp', ['ngRoute', 'ngMessages', 'brMaterial'])
  .config(configApp);




configApp.$inject = ['$locationProvider', '$routeProvider'];
function configApp($locationProvider, $routeProvider) {
  $locationProvider.html5Mode(true);

  $routeProvider
    .when('/', {
      templateUrl: 'partials/home.tmpl.html'
    });
}
