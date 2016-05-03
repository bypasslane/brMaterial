var PALETTES = {};

// Default Pallette
PALETTES['default'] = {
	font: '333333',
	primary: '3a7eea',
	accent: '5dbf56',
	warn: 'd0021b',
	foreground: 'f5f5f5',
	background: '000000',
	overlay: 'rgba(0,0,0,0)',
	dialogBackground: 'f5f5f5'
};




angular
	.module('brMaterial')
	.provider('$brTheme', ThemingProvider)
	.run(generateTheme);



function ThemingProvider () {
	var defaultTheme = 'default';
	var _dialogMobileFill = false;
	var isNoShadow = false;

  var provider = {
		setDefaultTheme: setDefaultTheme,
		definePalette: definePalette,
		dialogMobileFill: dialogMobileFill,
		noShadow: noShadow,
		$get: ['$rootScope', '$brMobile', ThemingService]
  };
  return provider;


	// --- Public ----------------------

	function setDefaultTheme (theme) {
		defaultTheme = theme;
	}

	function definePalette (name, map) {
		map = map || {};

		PALETTES[name] = {
			font: map.font || '333333',
			primary: map.primary || '3a7eea',
			accent: map.accent || '5dbf56',
			warn: map.warn || 'd0021b',
			foreground: map.foreground || 'f5f5f5',
			background: map.background || '000000',
			overlay: map.overlay || 'rgba(0,0,0,0)',
			dialogBackground: map.dialogBackground || 'f5f5f5'
		};
	}

	function dialogMobileFill () {
		_dialogMobileFill = true;
	}

	function noShadow () {
		isNoShadow = true;
	}





	// ---- Service --------------------


	function ThemingService ($rootScope, $brMobile) {
		applyTheme.inherit = function(el, parent) {
			var ctrl = parent.controller('brTheme');
			var theme = ctrl && crtl.$brTheme || el.attr('br-theme') || defaultTheme;
			changeTheme(theme);

			function changeTheme(theme) {
				var oldTheme = el.data('$brThemeName');
				if(oldTheme) el.removeClass('br-' + oldTheme +'-theme');
				el.addClass('br-' + theme + '-theme');
				el.data('$brThemeName', theme);

				if ($brMobile.isMobile === true) { el.addClass('br-mobile'); }
				if (isNoShadow) { el.addClass('br-no-shadow'); }
			}
		};

		applyTheme.defaultTheme = function () { return defaultTheme; };

		if (_dialogMobileFill) { applyTheme.dialogMobileFill = _dialogMobileFill; }



		return applyTheme;

		function applyTheme(scope, el){
			if (el === undefined) {
				el = scope;
				scope = undefined;
			}
			if (scope === undefined) {
				scope = $rootScope;
			}

			applyTheme.inherit(el, el);
		}
	}

}


generateTheme.$inject = ['$injector'];
function generateTheme ($injector) {
	var themeName;
	var type;
	var contrast;
	var themeCss;
	var regExp;
	var shade;
	var style;
	var head;
	var tempPalette = {};

	for (themeName in PALETTES) {
		themeCss = $injector.has('$BR_THEME_CSS') ? $injector.get('$BR_THEME_CSS') : '';
		themeCss = themeCss.replace(/THEME_NAME/g, themeName);

		tempPalette[themeName] = {};


		for (type in PALETTES[themeName]) {
			if (type !== 'overlay') {
				if (!tempPalette[themeName][type]) {
					if(type === 'background') {
						tempPalette[themeName][type] = getBackgroundShades(PALETTES[themeName][type]);
					}else if (type === 'font') {
						tempPalette[themeName][type] = getFontShades(PALETTES[themeName][type]);
					} else {
						tempPalette[themeName][type] = getShades(PALETTES[themeName][type]);
					}
				}

				regExp = new RegExp('\'{{'+type+'-default}}\'', 'g');
				themeCss = themeCss.replace(regExp, tempPalette[themeName][type].default);

				for (contrast in tempPalette[themeName][type]) {
					if(type === 'background') {
						regExp = new RegExp('\'{{'+type+'-'+contrast+'}}\'', 'g');
						themeCss = themeCss.replace(regExp, tempPalette[themeName][type][contrast]);
					} else if(contrast !== 'default') {
						for (shade in tempPalette[themeName][type][contrast]) {
							regExp = new RegExp('\'{{'+type+'-'+contrast+'-'+shade+'}}\'', 'g');
							themeCss = themeCss.replace(regExp, tempPalette[themeName][type][contrast][shade]);
						}
					}
				}
			} else {
				tempPalette[themeName][type] = PALETTES[themeName][type];
				regExp = new RegExp('\'{{'+type+'}}\'', 'g');
				themeCss = themeCss.replace(regExp, tempPalette[themeName][type]);
			}
		}


		style = document.createElement('style');
		style.innerHTML = themeCss;
		head = document.getElementsByTagName('head')[0];
		head.insertBefore(style, head.lastElementChild);
	}




	//--- get shades from hex -------------

	function getShades (hex, isFont) {
		var luminosity = 0.1;
		var shadesLength = 6;
		var lumInc = 1 / shadesLength;
		var i, j, c, diff, newColor, darkColors = [], lightColors = [];

		hex = cleanHex(hex);
		if(lumInc > 0.08) { lumInc = 0.08; }

		for(i = 0; i < shadesLength; ++i){
			newColor = '';
			for(j = 0; j < 3; ++j) {
				c = parseInt(hex.substr(j *2,2), 16);
				diff = c;
				c = Math.round(Math.min(Math.max(0, c - (luminosity * diff)), 255)).toString(16);
				newColor += ("00"+c).substr(c.length);
			}

			darkColors[(4-i)] = '#'+newColor;
			luminosity += lumInc;
		}


		luminosity = 0.1;
		lumInc = 1 / shadesLength;

		for(i = 0; i < shadesLength; ++i){
			newColor = '';
			for(j = 0; j < 3; ++j) {
				c = parseInt(hex.substr(j*2,2), 16);
				diff = 255 - c;
				c = Math.round(Math.min(Math.max(0, c + (luminosity * diff)), 255)).toString(16);
				newColor += ("00"+c).substr(c.length);
			}

			if(isFont && i === (shadesLength-1)) newColor = 'FFFFFF';
			lightColors[(i+1)] = '#'+newColor;
			luminosity += lumInc;
		}

		return {default: '#'+hex, dark: darkColors, light: lightColors};
	}



	//--- get background shades with alpha -----

	function getBackgroundShades (hex) {
		var rgb = hexToRgb(hex);
		var rgbString = rgb.r + ',' + rgb.g + ',' + rgb.b + ',';
		var shadesLength = 6;
		var alpha = 0.12;
		var colors = [];
		var i = 0;

		for(i; i < shadesLength; ++i) {
			if(i === 0) { colors.default = 'rgba(' + rgbString + alpha.toString() + ')'; }
			else { colors[i] = 'rgba(' + rgbString + alpha.toString() + ')'; }
			alpha += 0.14;
		}

		return colors;
	}


	function hexToRgb (hex) {
		var result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
		return result ? {
			r: parseInt(result[1], 16),
			g: parseInt(result[2], 16),
			b: parseInt(result[3], 16)
		} : null;
	}



	//--- get background shades with alpha -----

	function getFontShades (hex, isFont) {
		var luminosity = 0.1;
		var shadesLength = 8;
		var lumInc = 1 / shadesLength;
		var i, j, c, diff, newColor, darkColors = [], lightColors = [];

		hex = cleanHex(hex);
		if(lumInc > 0.08) { lumInc = 0.08; }

		for(i = 0; i < shadesLength; ++i){
			newColor = '';
			for(j = 0; j < 3; ++j) {
				c = parseInt(hex.substr(j *2,2), 16);
				diff = c;
				c = Math.round(Math.min(Math.max(0, c - (luminosity * diff)), 255)).toString(16);
				newColor += ("00"+c).substr(c.length);
			}

			darkColors[(4-i)] = '#'+newColor;
			luminosity += lumInc;
		}


		luminosity = 0.1;
		lumInc = 1 / shadesLength;

		for(i = 0; i < shadesLength; ++i){
			newColor = '';
			for(j = 0; j < 3; ++j) {
				c = parseInt(hex.substr(j*2,2), 16);
				diff = 255 - c;
				c = Math.round(Math.min(Math.max(0, c + (luminosity * diff)), 255)).toString(16);
				newColor += ("00"+c).substr(c.length);
			}

			if(i === (shadesLength-1)) newColor = 'FFFFFF';
			lightColors[(i+1)] = '#'+newColor;
			luminosity += lumInc;
		}

		return {default: '#'+hex, dark: darkColors, light: lightColors};
	}



	//--- Clean Hex --------

	function cleanHex (hex){
		hex = String(hex).replace(/[^0-9a-f]/gi, '');
		if (hex.length < 6) {
			hex = hex[0]+hex[0]+hex[1]+hex[1]+hex[2]+hex[2];
		}

		return hex;
	}
}
