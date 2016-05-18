angular
  .module('brMaterial')
  .factory('$brExpansionCard', exapnsionCardService);




exapnsionCardService.$inject = ['$rootScope', '$compile', '$q', '$controller', '$brComponentRegistry', '$templateCache', '$templateRequest', '$timeout'];
function exapnsionCardService($rootScope, $compile, $q, $controller, $brComponentRegistry, $templateCache, $templateRequest, $timeout) {
  var handler = function (handle) {
    handle = handle || '';
    var errorMsg = "SideNav '" + handle + "' is not available!";
    var instance = $brComponentRegistry.get(handle);
    if(!instance) {
      $brComponentRegistry.notFoundError(handle);
    }

    var service = {
      remove: remove,
      expand: expand,
      collapse: collapse,
      then: then
    };
    return service;



    /**
     * @name remove
     * @function
     *
     * @description
     * remove card
     */
    function remove() {
      return instance && instance.$remove();
    }


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
     * @name collapse
     * @function
     *
     * @description
     * collapse card
     */
    function collapse() {
      return instance && instance.collapse();
    }

    /**
     * @name then
     * @function
     *
     * @description
     * Function called post operation
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



  handler.add = add;

  return handler;




  /**
   * @name add
   * @function
   *
   * @description
   * add card to specified parent element
   *
   * @param {element} options.parent - parent element to append to
   * @param {string} [options.template] - html string template
   * @param {string} [options.templateUrl] - path to html template
   * @param {object} [options.scope] - scope variables
   * @param {string} [options.controller] - controller
   * @param {string} [options.controllerAs] - controller as name
   */
  function add(options) {
    options = options || {};
    var deferred = $q.defer();

    // if none of these exist then a dialog box cannot be created
    if (!options.template && !options.templateUrl) {
      throw Error('$exapnsionCardService.add() : Is missing required paramters to create. Required One of the following: template, templateUrl');
    }

    if (!options.parent) {
      throw Error('$exapnsionCardService.add() : Must provide a parent element');
    }


    var scope = $rootScope.$new();
    angular.extend(scope, options.scope);

    getTemplate(options, function (template) {
      var element = angular.element(template);

      // valid correct html exists
      if (element[0].nodeName !== 'BR-EXPANSION-CARD') {
        throw Error('$brExpansionCard.add(): Invalid HTML. Must provide <br-expansion-card>');
      }
      if (element.find('br-expanded-content').length === 0) {
        throw Error('$brExpansionCard.add(): Invalid HTML. Must provide <br-expanded-content>');
      }
      if (element.find('br-collapsed-content').length === 0) {
        throw Error('$brExpansionCard.add(): Invalid HTML. Must provide <br-collapsed-content>');
      }


      var linkFunc = $compile(element);

      if (options.controller) {
        options.locals = options.locals || {};
        options.locals.$scope = scope;
        var invokeCtrl = $controller(options.controller, options.locals, true);
        var ctrl = invokeCtrl();
        element.data('$ngControllerController', ctrl);
        element.children().data('$ngControllerController', ctrl);
        if (options.controllerAs) {
          scope[options.controllerAs] = ctrl;
        }
      }

      // link after the element is added so we can find card manager directive
      angular.element(options.parent).append(element);
      linkFunc(scope);

      var componentId = element.attr('br-component-id');
      if (componentId !== undefined) {
        deferred.resolve(handler(componentId));
      } else {
        deferred.resolve();
      }
    });

    return deferred.promise;
  }


  function getTemplate(options, callback) {
    var template;

    if (options.templateUrl !== undefined) {
      template = $templateCache.get(options.templateUrl);
      if (template === undefined) {
        $templateRequest(options.templateUrl).then(function (_template) {
          callback(_template);
        });
      } else {
        callback(template);
      }
    } else {
      callback(options.template);
    }
  }
}
