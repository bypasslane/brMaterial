angular
  .module('brMaterial')
  .factory('$brExpansionPanelGroup', expansionPanelGroupService);




expansionPanelGroupService.$inject = ['$rootScope', '$q', '$brComponentRegistry', '$brUtil', '$controller', '$compile', '$brExpansionPanel'];
function expansionPanelGroupService($rootScope, $q, $brComponentRegistry, $brUtil, $controller, $compile, $brExpansionPanel) {
  var registries = {};

  var handler = function (handle) {
    var instance;
    var service = {
      add: add,
      remove: remove,
      removeAll: removeAll,
      register: register,
      postMessage: postMessage
    };

    return $brComponentRegistry
        .when(handle)
        .then(function (it) {
          instance = it;
          return service;
        });



    function register(options) {
      validateOptions(options);
      // componentId is used to interact with cards
      if (!options.componentId) {
        throw Error('$brExpansionPanelGroup.registerPanel() : Is missing required paramters to create. "componeneteId" is required');
      }

      instance.registerPanel(options);
      return $q.when();
    }


    function remove(componeneteId) {
      var deferred = $q.defer();

      if (instance.removePanel(componeneteId)) {
        deferred.resolve();
      } else {
        deferred.reject('No active panel with component id "' + componeneteId + '" found');
      }

      return deferred.promise;
    }

    function removeAll() {
      instance.removeAll();
    }

    function postMessage(event, value) {
      instance.postMessage(event, value);
    }


    function add(options, autoOpen) {
      // assume if options is a string then they are calling a registered card by its component id
      if (typeof options === 'string') {
        // call add panel with the stored options
        return add(instance.getRegisteredPanel(options), autoOpen);
      }

      validateOptions(options);
      if (options.componentId && instance.isPanelActive(options.componentId)) {
        return $q.reject('panel with componentId "' + options.componentId + '" is currently active');
      }

      var deferred = $q.defer();
      var scope = $rootScope.$new();
      angular.extend(scope, options.scope);

      getTemplate(options, function (template) {
        var element = angular.element(template);
        validateTemplate(element);
        if (options.componentId) { element.attr('br-component-id', options.componentId); }

        var linkFunc = $compile(element);
        if (options.controller) {
          options.locals = options.locals || {};
          options.locals.$scope = scope;
          options.locals.$panel = options.componentId ? $brExpansionPanel(options.componentId) : $q.reject('no component id set');
          var invokeCtrl = $controller(options.controller, options.locals, true);
          var ctrl = invokeCtrl();
          element.data('$ngControllerController', ctrl);
          element.children().data('$ngControllerController', ctrl);
          if (options.controllerAs) {
            scope[options.controllerAs] = ctrl;
          }
        }

        if ((instance.autoOpen === true && autoOpen !== false) || autoOpen === true) {
          scope.autoOpen = true;
        }

        // link after the element is added so we can find card manager directive
        instance.$element.append(element);
        linkFunc(scope);

        var componentId = element.attr('br-component-id');
        if (componentId !== undefined) {
          deferred.resolve();
        } else {
          deferred.resolve();
        }
      });


      return deferred.promise;
    }


    function validateOptions(options) {
      if (typeof options !== 'object' || options === null) {
        throw Error('$exapnsionPanelGroup.add() : Requires an options object to be passed in');
      }

      // if none of these exist then a dialog box cannot be created
      if (!options.template && !options.templateUrl) {
        throw Error('$exapnsionPanelGroup.add() : Is missing required paramters to create. Required One of the following: template, templateUrl');
      }
    }

    function validateTemplate(element) {
      // valid correct html exists
      if (element[0].nodeName !== 'BR-EXPANSION-PANEL') {
        throw Error('$exapnsionPanelGroup.add(): Invalid HTML. Must provide <br-expansion-panel>');
      }
      if (element.find('br-expansion-panel-header').length === 0) {
        throw Error('$exapnsionPanelGroup.add(): Invalid HTML. Must provide <br-expansion-panel-header>');
      }
      if (element.find('br-expansion-panel-body').length === 0) {
        throw Error('$exapnsionPanelGroup.add(): Invalid HTML. Must provide <br-expansion-panel-body>');
      }
    }


    function getTemplate(options, callback) {
      var template;

      if (options.templateUrl !== undefined) {
        $brUtil.getTemplateFromUrl(options.templateUrl, callback);
      } else {
        callback(options.template);
      }
    }

  };


  return handler;
}
