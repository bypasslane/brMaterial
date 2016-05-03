angular
  .module('brMaterial')
  .factory('$brMobile', brMobileService);




/**
 * @name brButton
 * @module brButton
 *
 *
 * @description
 * $brMobile has variables to let you know if the device is android, ios, or mobile
 *
 *
 * @example
 * $brMobile.isMobile;
 * $brMobile.isAndroid;
 * $brMobile.isIos;
 *
 */


function brMobileService () {
  var userAgent = navigator.userAgent || navigator.vendor || window.opera;

  var isIos = userAgent.match(/ipad|iphone|ipod/i);
	var isAndroid = userAgent.match(/android/i);
  var isOther = userAgent.match(/windows phone|iemobile|opera mini/i);
  var isMobile = isIos !== null || isAndroid !== null || isOther !== null || false;


  /**
   * @namespace
   * @property {boolean}  isIos
   * @property {objebooleanct}  isAndroid
   * @property {boolean}  isMobile
   */
  var service = {
    isIos: isIos,
    isAndroid: isAndroid,
    isMobile: isMobile
  };
  return service;

}
