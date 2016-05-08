angular
  .module('brMaterial')
  .factory('$brExpander', brExpanderService);



/**
  * @name $brExapnder
  * @module $brExapnder
  *
  *
  * @description
  * $brExapnder controls the <br-expander> element
  *
  * @example
  * $brExapnder('theComponentId').open();
  * $brExapnder('theComponentId').isOpen();
  * $brExapnder('theComponentId').toggle();
  * $brExapnder('theComponentId').close();
  */
brExpanderService.$inject = ['$brComponentRegistry', '$q'];
function brExpanderService($brComponentRegistry, $q) {
  return function (handle) {
    var errorMsg = "Expander '" + handle + "' is not available!";
    var instance = $brComponentRegistry.get(handle);

    if(!instance) {
      $brComponentRegistry.notFoundError(handle);
    }

    var service = {
      isOpen: isOpen,
      toggle: toggle,
      open: open,
      close: close,
      then: then
    };
    return service;


    /**
     * @name isOpen
     * @function
     *
     * @description
     * Returns boolean telling if the side content is currently opened
     *
     * @return {boolean}
     *
     */
    function isOpen() {
      return instance && instance.isOpen();
    }


    /**
     * @name toggle
     * @function
     *
     * @description
     * Toggles open closed state. This will only close if the locked open state is false
     *
     */
    function toggle() {
      return instance ? instance.toggle() : $q.reject(errorMsg);
    }



    /**
     * @name open
     * @function
     *
     * @description
     * Toggles content open state
     *
     */
    function open() {
      return instance ? instance.open() : $q.reject(errorMsg);
    }


    /**
     * @name close
     * @function
     *
     * @description
     * Toggles closed state. This will only close if the locked open state is false
     *
     */
    function close() {
      return instance ? instance.close() : $q.reject(errorMsg);
    }


    /**
     * @name then
     * @function
     *
     * @description
     * Function called post operation
     *
     */
    function then(callbackFn) {
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
}
