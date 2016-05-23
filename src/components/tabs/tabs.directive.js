angular
  .module('brMaterial')
  .directive('brTabs', tabsDirective);


tabsDirective.$inject = ['$brTheme'];
function tabsDirective($brTheme) {
  var directive = {
    restrict: 'E',
    scope:            {
      selectedIndex: '=?brSelected'
    },
    template: getTemplate,
    link: link,
    controller: ['$scope', '$element', '$attrs', '$compile', controller],
    controllerAs: '$brTabsCtrl',
    bindToController: true
  };
  return directive;


  function link(scope, element, attrs) {
    $brTheme(element);
  }

  function controller($scope, $element,  $attrs, $compile) {
    /* jshint validthis: true */
    var $brTabsCtrl = this;

    var indexCounter = 0;


    $brTabsCtrl.tabs = [];
    $brTabsCtrl.addTab = addTab;

    compileTemplate();


    function addTab(tab) {
      tab.index = indexCounter++;
      $brTabsCtrl.tabs.push(tab);
      console.log($brTabsCtrl.tabs);
    }



    function compileTemplate() {
      var template = $attrs.$brTabsTemplate;
      var element  = angular.element($element[0].querySelector('br-tab-data'));
      
      element.html(template);
      $compile(element.contents())($scope.$parent);
      delete $attrs.$brTabsTemplate;
    }
  }




  function getTemplate(tElement, tAttrs) {
    tAttrs['$brTabsTemplate'] = tElement.html();

    return '<br-tab-data></br-tab-data>'+
    '<div class="br-tab-buttons-container" layout="row">'+
      '<br-button ng-repeat="tab in $brTabsCtrl.tabs" role="tab">'+
        '{{tab.label}}'+
      '</br-button>'+
    '</div>';
  }
}
