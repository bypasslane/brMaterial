angular
  .module('brMaterial')
  .directive('brTab', tabDirective);


tabDirective.$inject = ['$brUtil'];
function tabDirective($brUtil) {
  var directive = {
    restrict: 'E',
    require: '^brTabs',
    terminal: true,
    compile: compile
  };
  return directive;


  function compile(element, attr) {
    var label = [];//firstChild(element, 'br-tab-label');
    var body  = [];//firstChild(element, 'br-tab-body');

      if (label.length == 0) {
        label = angular.element('<br-tab-label></br-tab-label>');
        if (attr.label) label.text(attr.label);
        else label.append(element.contents());

        if (body.length == 0) {
          var contents = element.contents().detach();
          body = angular.element('<br-tab-body></br-tab-body>');
          body.append(contents);
        }
      }

      element.append(label);
      if (body.html()) element.append(body);

    return postLink;
  }
  function postLink(scope, element, attrs, tabsCtrl) {
    console.log('ok');
    var id = $brUtil.nextUid();
    var tabObj = {
      label: attrs.label,
      id: id
    };


    tabsCtrl.addTab(tabObj);
  }
}
