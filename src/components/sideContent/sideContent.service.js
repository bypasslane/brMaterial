angular
  .module('brMaterial')
  .factory('$brSideContent', brSideContentService);



/**
  * @ngdoc service
  * @name $brSideContent
  * @module sideContent
  *
  *
  * @description
  * `$brSideContent` controls the `<br-side-content>` element
  *
  *
  * @usage
  * <hljs lang="js">
  * angular.controller('MyCtrl', function ($brSideContent) {
  *   $brSideContent('theComponentId').open();
  *   $brSideContent('theComponentId').isOpen();
  *   $brSideContent('theComponentId').isLockedOpen();
  *   $brSideContent('theComponentId').close();
  *   $brSideContent('theComponentId').addBackdrop();
  *   $brSideContent('theComponentId').removeBackdrop();
  * });
  * </hljs>
  *
  * <hljs lang="html">
  *   <br-side-content br-component-id="theComponentId" br-is-locked-open="$brMedia('md')" br-width="400">
  *     // content does here
  *    </br-side-content>
  * </hljs>
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
     * @ngdoc method
     * @name $brSideContent#isOpen
     * @function
     *
     * @description
     * Returns boolean telling if the side content is currently opened
     *
     * @return {boolean}
     */
    function isOpen() {
      return instance && instance.isOpen();
    }


    /**
     * @ngdoc method
     * @name $brSideContent#isLockedOpen
     * @function
     *
     * @description
     * Returns boolean telling if the side content is currently locked open
     *
     * @return {boolean}
     */
    function isLockedOpen() {
      return instance && instance.isLockedOpen();
    }


    /**
     * @ngdoc method
     * @name $brSideContent#toggle
     * @function
     *
     * @description
     * Toggles open closed state. This will only close if the locked open state is false
     *
     * @return {promise}
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
     * @ngdoc method
     * @name $brSideContent#close
     * @function
     *
     * @description
     * Toggles closed state. This will only close if the locked open state is false
     *
     * @return {promise}
     */
    function close() {
      return instance ? instance.close() : $q.reject(errorMsg);
    }


    /**
     * @ngdoc method
     * @name $brSideContent#then
     * @function
     *
     * @description
     * Function called post operation
     *
     * @return {promise}
     */
    function then(callbackFn) {
      var promise = instance ? $q.when(instance) : waitForInstance();
      return promise.then( callbackFn || angular.noop );
    }


    /**
     * @ngdoc method
     * @name $brSideContent#addBackdrop
     * @function
     *
     * @description
     * adds a backdrop behind the side content to prevent clicking
     *
     * @return {promise}
     */
    function addBackdrop(clickCallback) {
      return instance ? instance.addBackdrop(clickCallback) : $q.reject(errorMsg);
    }


    /**
     * @ngdoc method
     * @name $brSideContent#removeBackdrop
     * @function
     *
     * @description
     * removes backdrop from behind the side content
     *
     * @return {promise}
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
