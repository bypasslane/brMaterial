angular
  .module('brMaterial')
  .directive('brIcon', brIconDirective);



/**
  * @name brIcon
  * @module brIcon
  *
  *
  * @description
  * <br-icon> will dispaly svg and font iconService
  * you can add more font icons by using icomoon.io and creating a font
  *
  * list of included font icons:
  *
  *
  * @param {any} [br-size] - the size in pixels
  * @param {any} [br-color] - the color
  * @param {any} [br-font-icon] - the name of the icon to use
  *
  * alarm
  * schedule
  * account_box
  * add
  * add_a_photo
  * alarm_add
  * add_alert
  * add_box
  * add_circle
  * add_location
  * add_shopping_cart
  * alarm_off
  * announcement
  * arrow_back
  * arrow_downward
  * arrow_forward
  * arrow_upward
  * close
  * poll
  * assignment
  * assignment_late
  * assignment_turned_in
  * flag
  * attach_file
  * attach_money
  * autorenew
  * cloud_upload
  * battery_alert
  * battery_charging_full
  * battery_std
  * battery_unknown
  * block
  * turned_in
  * phone
  * cancel
  * chat
  * chat_bubble
  * check
  * cloud_download
  * photo_library
  * mode_edit
  * payment
  * crop
  * crop_rotate
  * dehaze
  * not_interested
  * done_all
  * error
  * insert_invitation
  * event_available
  * event_busy
  * event_note
  * favorite
  * favorite_border
  * get_app
  * file_upload
  * filter_list
  * question_answer
  * forward
  * help
  * photo
  * keyboard_arrow_down
  * keyboard_arrow_left
  * keyboard_arrow_right
  * keyboard_arrow_up
  * linear_scale
  * local_bar
  * local_cafe
  * restaurant_menu
  * local_drink
  * shopping_cart
  * local_offer
  * location_off
  * room
  * more_horiz
  * more_vert
  * notifications
  * notifications_active
  * notifications_none
  * notifications_off
  * notifications_paused
  * pause
  * play_arrow
  * playlist_add
  * playlist_add_check
  * polymer
  * power_settings_new
  * priority_high
  * refresh
  * remove_shopping_cart
  * search
  * settings
  * sort_by_alpha
  * swap_horiz
  * swap_vert
  * vpn_key
  * work
  * wrap_text
  * zoom_in
  * zoom_out
  * zoom_out_map
  *
  * @example
  * <br-icon br-size="32" br-color="#666" br-font-icon="image"></br-icon>
  *
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
