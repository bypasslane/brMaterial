angular
  .module('Super')
  .directive('navMenu', navMenuDirective)
  .directive('navMenuExpander', navMenuExpanderDirective);

navMenuDirective.$inject = ['navMenuService', '$brSideContent', '$brExpander', '$location'];
function navMenuDirective(navMenuService, $brSideContent, $brExpander, $location) {
  var directive = {
    restrict: 'E',
    controller: ['navMenuService', Controller],
    controllerAs: 'vm',
    link: link
  };
  return directive;


  function link(scope, element, attrs) {
    var lastExpander;
    var lastButton;

    // watch for state changes so we can update the side nav
    scope.$on('$locationChangeStart', watchState);
    function watchState(event, toState, toParams, fromState, fromParams) {
      var stateUrl = toState.url.substr(1);
      console.log(stateUrl);
      return;

      var stateButton = element[0].querySelector('button[ng-href=' + stateUrl + ']');
      if (stateButton === undefined || stateButton === null) { return; }

      // change green borer on active link
      if (lastButton !== undefined) {
        lastButton.removeClass('nav-link-active');
      }
      lastButton = angular.element(stateButton);
      lastButton.addClass('nav-link-active');


      // close the expanded section if you click on a link outside of it
      var expander = getExpander(stateButton);
      expander = !expander ? undefined : angular.element(expander).attr('br-component-id');
      if (lastExpander !== undefined && lastExpander !== expander) {
        $brExpander(lastExpander).close();
      }

      // set new exapnder if link click inside of expaned section
      if (expander !== undefined) {
        lastExpander = expander;
        $brExpander(lastExpander).open();
      } else {
        lastExpander = undefined;
      }

      $brSideContent('navMenuSideContent').close();
      $brSideContent('navMenuSideContent').removeBackdrop();
    }



    function getButton(target) {
      do {
        if (target.nodeName == 'BUTTON' || target.nodeName == 'BR-BUTTON') {
          if (target.hasAttribute('disabled') === true) {
            return undefined;
          }
          return target;
        }

        target = target.parentNode;
      } while (target);

      return undefined;
    }

    function getExpander(target) {
      do {
        if (target.nodeName == 'BR-EXPANDER') {
          return target;
        }

        target = target.parentNode;
      } while (target);

      return undefined;
    }
  }

  function Controller(navMenuService) {
    /* jshint validthis: true */
    var vm = this;
    vm.menu = navMenuService.get();
  }
}




navMenuExpanderDirective.$inject = ['$parse', '$compile'];
function navMenuExpanderDirective($parse, $compile) {
  var directive = {
    restrict: 'E',
    require: '^navMenu',
    terminal: true,
    link: link
  };
  return directive;


  function link(scope, element, attrs, navController) {
    var id = 0;
    var label = $parse(attrs.label)(scope);
    var icon = $parse(attrs.icon)(scope);

    // create the elements needed for br-expander
    var expanderElement = angular.element('<br-expander br-hide="true" class="br-no-shadow" br-open="false" br-component-id="nav-expander-' + (id++) + '">');
    var expanderHeaderElement = angular.element('<br-expander-header class="nav-expander-header"><br-icon br-font-icon="' + icon + '"></br-icon>' + label + '</br-expander-header>');
    var expanderContentElement = angular.element('<br-expander-content>');


    // custom transclude, so i can controll the compiling and avoid the extra span tag
    expanderElement.append(expanderHeaderElement);
    expanderElement.append(expanderContentElement);
    expanderContentElement.append(element.contents());
    element.empty().append($compile(expanderElement)(scope));
  }

}
