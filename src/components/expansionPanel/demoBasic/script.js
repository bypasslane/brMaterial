angular
  .module('expansionPanelDemo1', ['brMaterial'])
  .controller('AppCtrl', function ($scope, $brExpansionPanel, $timeout) {

    // $timeout(function () {
    //   $brExpansionPanel('expansionPanelId').expand();
    // }, 100);
    //
    //
    // $timeout(function () {
    //   $brExpansionPanel('expansionPanelId').contract();
    // }, 2000);
  });
