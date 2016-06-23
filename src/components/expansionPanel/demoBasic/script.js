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


    $scope.title = "initial title";
    $timeout(function () {
      $scope.title = "changed title";
    }, 2000);
  });
