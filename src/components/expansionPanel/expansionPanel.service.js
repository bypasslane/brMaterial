angular
  .module('brMaterial')
  .factory('$brExpansionPanel', brExpansionPanelService);


brExpansionPanelService.$inject = ['$brComponentRegistry'];
function brExpansionPanelService($brComponentRegistry) {
  var handler = function (handle) {
    handle = handle || '';
    var errorMsg = "$brExpansionCard '" + handle + "' is not available!";
    var instance = $brComponentRegistry.get(handle);
    if(!instance) {
      $brComponentRegistry.notFoundError(handle);
    }


    var service = {
      expand: expand,
      contract: contract,
      then: then
    };
    return service;




    /**
     * @name expand
     * @function
     *
     * @description
     * expand card
     */
    function expand() {
      return instance && instance.expand();
    }


    /**
     * @name contract
     * @function
     *
     * @description
     * contract card
     */
    function contract() {
      return instance && instance.contract();
    }

    /**
     * @name then
     * @function
     *
     * @description
     * Function called post operation
     */
    function then(callbackFn) {
      // resolve then with $card so the then does not resolve to the controller
      var promise = instance ? $q.when(instance) : waitForInstance();
      return promise.then( callbackFn || angular.noop );
    }



    function waitForInstance() {
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
