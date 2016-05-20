angular
  .module('brMaterial')
  .factory('$brExpansionCardManager', expansionCardManagerService);




expansionCardManagerService.$inject = ['$rootScope', '$q', '$brComponentRegistry', '$brExpansionCard'];
function expansionCardManagerService($rootScope, $q, $brComponentRegistry, $brExpansionCard) {
  var registries = {};

  var handler = function (handle, wait) {
    var instance = $brComponentRegistry.get(handle);

    if (handle === undefined) {
      return {
        waitFor: waitForInstance
      };
    } else if(!instance && wait !== true) {
      $brComponentRegistry.notFoundError(handle);
    }

    return !instance && wait ? waitForInstance(handle) : service;


    function waitForInstance(handle) {
      return $brComponentRegistry
        .when(handle)
        .then(function (it) {
          instance = it;
          return it;
        });
    }
  };


  return handler;
}
