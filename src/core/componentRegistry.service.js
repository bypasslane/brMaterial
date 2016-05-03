angular
  .module('brMaterial')
  .factory('$brComponentRegistry', brComponentRegistry);



brComponentRegistry.$inject = ['$q'];
function brComponentRegistry($q) {
  var instances = [];
  var pendings = {};


  var service = {
    register: register,
    get: get,
    when: when,
    notFoundError: notFoundError
  };
  return service;



  function notFoundError(handle) {
    console.log('$brComponentRegistry: No instance found for handle', handle);
  }

  function register(instance, handle) {
    if (!handle) { return angular.noop; }

    instance.$$brHandle = handle;
    instances.push(instance);
    resolveWhen();

    return deregister;



    function deregister() {
      var index = instances.indexOf(instance);
      if (index !== -1) {
        instances.splice(index, 1);
      }
    }

    function resolveWhen() {
      var dfd = pendings[handle];
      if (dfd) {
        dfd.resolve(instance);
        delete pendings[handle];
      }
    }
  }


  function get(handle) {
    if (isValidID(handle) === false) { return null; }

    var i = 0;
    var length = instances.length;
    var instance;

    while (i < length) {
      instance = instances[i];
      i++;

      if (instance.$$brHandle === handle) {
        return instance;
      }
    }

    return null;
  }


  function when(handle) {
    if (isValidID(handle) === true) {
      var deferred = $q.defer();
      var instance = get(handle);

      if (instance) {
        deferred.resolve(instance);
      } else {
        pendings[handle] = deferred;
      }

      return deferred.promise;
    }

    return $q.reject("Invalid `br-component-id` value");
  }



  function isValidID(handle) {
    return handle && (handle !== '');
  }
}
