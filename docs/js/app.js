angular
  .module('docsApp', ['ngRoute', 'ngMessages', 'brMaterial'])
  .config(configApp)
  .controller('DemoCtrl', DemoCtrl);




configApp.$inject = ['$locationProvider', '$routeProvider', 'DEMOS', 'COMPONENTS'];
function configApp($locationProvider, $routeProvider, DEMOS, COMPONENTS) {
  // $locationProvider.html5Mode(true);

  $routeProvider
    .when('/', {
      templateUrl: 'partials/home.tmpl.html'
    })
    .when('/demo/', {
      redirectTo: DEMOS[0].url
    });


  DEMOS.forEach(function(componentDemos) {
    var demoComponent;

    COMPONENTS.forEach(function(component) {
      if (componentDemos.moduleName === component.name) {
        demoComponent = component;
        component.demoUrl = componentDemos.url;
      }
    });

    demoComponent = demoComponent || angular.extend({}, componentDemos);
    $routeProvider.when('/' + componentDemos.url, {
      templateUrl: 'partials/demo.tmpl.html',
      controller: 'DemoCtrl',
      resolve: {
        component: function() { return demoComponent; },
        demos: function() { return componentDemos.demos; }
      }
    });
  });

  $routeProvider.otherwise('/');
}





function DemoCtrl($rootScope, $scope, component, demos, $http, $templateCache) {
  $rootScope.currentComponent = component;
  $rootScope.currentDoc = null;

  $scope.demos = [];

  angular.forEach(demos, function(demo) {
    // Get displayed contents (un-minified)
    var files = [demo.index]
      .concat(demo.js || [])
      .concat(demo.css || [])
      .concat(demo.html || []);
    files.forEach(function(file) {
      file.httpPromise =$http.get(file.outputPath, {cache: $templateCache})
        .then(function(response) {
          file.contents = response.data
            .replace('<head/>', '');
          return file.contents;
        });
    });
    demo.$files = files;
    $scope.demos.push(demo);
  });

  $scope.demos = $scope.demos.sort(function(a,b) {
    return a.name > b.name ? 1 : -1;
  });
}
