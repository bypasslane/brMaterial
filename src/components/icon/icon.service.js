angular
  .module('brMaterial')
  .factory('iconService', iconService);


iconService.$inject = ['$document'];
function iconService ($document) {
  var inited = false;
  var classNames;
  var classNamesLower;

  var service = {
    getClassName: getClassName
  };
  return service;


  function getClassName (name) {
    if (inited === false) {
      getIconClassNames();
    }

    var lowercaseName = name.toLowerCase();

    for (var i = 0; i < classNames.length; i++) {
      if (classNamesLower[i] === 'br-icon-' + lowercaseName) {
        return classNames[i];
      }
    }

    return name;
  }


  function getIconClassNames () {
    classNames = [];
    classNamesLower = [];

    var i;
    var j;
    var length;
    var rules;
    var className;
    var sheets = $document[0].styleSheets;

    for (i = 0; i < sheets.length; i++) {
      rules = sheets[i].rules || sheets[i].cssRules;
      length = rules.length;

      for (j = 0; j < length; j++) {
        if (rules[j].selectorText !== undefined && rules[j].selectorText.indexOf('br-icon-') > -1 && rules[j].selectorText.indexOf('=') === -1) {
          className = rules[j].selectorText.toString().replace(':before', '').replace(':', '').replace('.', '');
          classNames.push(className);
          classNamesLower.push(className.toLowerCase());
        }
      }
    }

    inited = true;
  }
}
