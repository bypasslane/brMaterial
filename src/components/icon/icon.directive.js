/**
 * @ngdoc module
 * @name icon
 */

angular
  .module('brMaterial')
  .directive('brIcon', brIconDirective);



/**
  * @ngdoc directive
  * @name brIcon
  * @module icon
  *
  * @description
  * `<br-icon>` will dispaly font icons.
  * You can add more font icons by using icomoon.io and creating a font icon set
  *
  * @param {pixels=} br-size - The size in pixels
  * @param {HEX=} br-color - The color. If you place icons in button they will inherit the buttons color
  * @param {string} br-font-icon - The values you can use
  *
  * - organization
  * - account
  * - add
  * - announcement
  * - poll
  * - flag
  * - money
  * - block
  * - turned_in
  * - chat_bubble
  * - close
  * - photo_library
  * - edit
  * - payment
  * - delete
  * - done
  * - dashboard
  * - events
  * - seat
  * - download
  * - filter_list
  * - star
  * - labor
  * - help_outline
  * - home
  * - photo
  * - info
  * - info_outline
  * - keyboard_arrow_down
  * - keyboard_arrow_left
  * - keyboard_arrow_right
  * - keyboard_arrow_up
  * - bucks
  * - local_cafe
  * - menu
  * - drink
  * - alcohol
  * - shopping_cart
  * - local_library
  * - local_offer
  * - venue
  * - room
  * - lock_open
  * - lock_outline
  * - more_vert
  * - notifications
  * - person_outline
  * - person
  * - person_add
  * - refresh
  * - save
  * - search
  * - settings
  * - sort_by_alpha
  * - suite
  * - location
  * - swap_horiz
  * - swap_vert
  * - tablet_mac
  * - view_list
  * - gateway
  * - dehaze
  * - arrow_back
  * - arrow_forward
  * - arrow_upward
  * - arrow_downward
  *
  * @usage
  * <hljs lang="html">
  *   <br-icon br-size="32" br-color="#666" br-font-icon="image"></br-icon>
  * </hljs>
  */
brIconDirective.$inject = ['iconService', '$brTheme'];
function brIconDirective (iconService, $brTheme) {
  var directive = {
    restrict: 'E',
    link: link
  };
  return directive;



  function link (scope, element, attr) {
    $brTheme(element);

    element.addClass('br-icon');

    var size = '22px';

    // font icon
    if (attr.brFontIcon !== undefined && attr.brFontIcon !== '') {
      element.addClass(iconService.getClassName(attr.brFontIcon));

      if (attr.brColor !== undefined && attr.brColor !== '') {
        element.css('color', attr.brColor);
      }

      if (attr.brSize !== undefined && attr.brSize !== '') {
        size = attr.brSize.replace('px','') + 'px';
      }

      element.css('font-size', size);
      element.css('width', size);
      element.css('height', size);
    }


    // TODO : add svg srce
    // move this to service

  //   function loadByURL(url) {
  //    return $http
  //      .get(url, { cache: $templateCache })
  //      .then(function(response) {
  //        return angular.element('<div>').append(response.data).find('svg')[0];
  //      }).catch(announceNotFound);
  //  }
  }
}
