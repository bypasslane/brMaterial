angular
  .module('brMaterial')
  .factory('$brExpansionPanel', brExpansionPanelService);


brExpansionPanelService.$inject = ['$brComponentRegistry'];
function brExpansionPanelService($brComponentRegistry) {
  var handler = function (handle) {
    var instance;


    var service = {
      expand: expand,
      contract: contract,
      on: on,
      off: off,
      postMessage: postMessage
    };


    return $brComponentRegistry
        .when(handle)
        .then(function (it) {
          instance = it;
          return service;
        });




    /**
     * @name expand
     * @function
     *
     * @description
     * expand card
     */
    function expand() {
      return instance.expand();
    }


    /**
     * @name contract
     * @function
     *
     * @description
     * contract card
     */
    function contract() {
      return instance.contract();
    }

    /**
     * @name on
     * @function
     *
     * @description
     * listen for messages
     */
    function on(event, callback) {
      return instance.on(event, callback);
    }

    /**
     * @name off
     * @function
     *
     * @description
     * remvoe listener
     */
    function off(event, callback) {
      return instance.off(event, callback);
    }

    /**
     * @name postMessage
     * @function
     *
     * @description
     * postMessage to card
     */
    function postMessage(event, value) {
      return instance.postMessage(event, value);
    }
  };

  return handler;
}
