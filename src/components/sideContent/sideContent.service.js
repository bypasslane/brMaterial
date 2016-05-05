angular
  .module('brMaterial')
  .factory('$brSideContent', brSideContentService);



/**
  * @name $brSideContent
  * @module $brSideContent
  *
  *
  * @description
  * $brSideContent controls the <br-side-content> element
  *
  * @example
  * $brSideContent('theComponentId').open();
  * $brSideContent('theComponentId').isOpen();
  * $brSideContent('theComponentId').isLockedOpen();
  * $brSideContent('theComponentId').close();
  * $brSideContent('theComponentId').addBackdrop();
  * $brSideContent('theComponentId').removeBackdrop();
  *
  */
brSideContentService.$inject = ['$brComponentRegistry', '$q'];
function brSideContentService($brComponentRegistry, $q) {
  return function (handle) {
    var errorMsg = "SideNav '" + handle + "' is not available!";
    var instance = $brComponentRegistry.get(handle);

    if(!instance) {
      $brComponentRegistry.notFoundError(handle);
    }

    var service = {
      isOpen: isOpen,
      isLockedOpen: isLockedOpen,
      toggle: toggle,
      open: open,
      close: close,
      then: then,
      addBackdrop: addBackdrop,
      removeBackdrop: removeBackdrop
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
     * @name isLockedOpen
     * @function
     *
     * @description
     * Returns boolean telling if the side content is currently locked open
     *
     * @return {boolean}
     *
     */
    function isLockedOpen() {
      return instance && instance.isLockedOpen();
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


    /**
     * @name addBackdrop
     * @function
     *
     * @description
     * adds a backdrop behind the side content to prevent clicking
     *
     */
    function addBackdrop(clickCallback) {
      return instance ? instance.addBackdrop(clickCallback) : $q.reject(errorMsg);
    }


    /**
     * @name removeBackdrop
     * @function
     *
     * @description
     * removes backdrop from behind the side content
     *
     */
    function removeBackdrop() {
      return instance ? instance.removeBackdrop() : $q.reject(errorMsg);
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
