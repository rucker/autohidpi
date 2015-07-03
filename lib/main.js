var simple_prefs = require('sdk/simple-prefs');
var preferences = require('sdk/preferences/service');
var windows = require('sdk/windows').browserWindows;
var window_utils = require('sdk/window/utils');
var stylesheet_utils = require('sdk/stylesheet/utils');
var self = require('sdk/self');
const {Cu} = require('chrome');
const services = Cu.import('resource://gre/modules/Services.jsm');

var onModeChange = function(prefName) {
  if (simple_prefs.prefs.mode == 'mwidth') {
    var enablePrefElem = 'screenWidth';
    var disablePrefElem = 'exactScreenSize';
  }
  else {
    var enablePrefElem = 'exactScreenSize';
    var disablePrefElem = 'screenWidth';
  }
  var scriptString =
      "document.querySelector('[pref-name=" + disablePrefElem + "]').setAttribute('disabled', true);" +
    "document.querySelector('[pref-name=" + enablePrefElem + "]').removeAttribute('disabled');";
  require("sdk/tabs").activeTab.attach({
    contentScript: scriptString
  });
};

var setMinWidthMode = function(width, pixelRatioStr) {
  // when we change devPixelsPerPx it also affects availWidth so we fix it
  // sometimes it calculates the width a bit off so lets add a small slack to prevent false triggers
  width = Math.ceil(width * pixelRatioStr) + 128;
  if (width < simple_prefs.prefs.screenWidth) {
    return 1;
  }
  return pixelRatioStr;
};

var setExactScreenSizeMode = function(width, height, pixelRatioStr) {
  var exactScreenSize = simple_prefs.prefs.exactScreenSize;
  var existingDevPixelsPerPx = preferences.get('layout.css.devPixelsPerPx');
  if (exactScreenSize) {
    var dimensions = exactScreenSize.trim().split(/(X|x)/);
    if (dimensions.length != 3 ||
	dimensions[0] != width * existingDevPixelsPerPx ||
	dimensions[2] != height * existingDevPixelsPerPx) {
      return 1;
    }
  }
  return pixelRatioStr;
};

var setDevPixelsPerPx = function(pixelRatioStr) {
  if (pixelRatioStr && pixelRatioStr <= 3) {
    preferences.set('layout.css.devPixelsPerPx', pixelRatioStr + '');
  }
};

var refresh = function() {
  var window = window_utils.getFocusedWindow();

  if (simple_prefs.prefs.mode == 'minWidth') {
    setDevPixelsPerPx(setMinWidthMode(window.screen.availWidth,
      parseFloat(simple_prefs.prefs.pixelRatioStr)));
  }
  else {
    setDevPixelsPerPx(setExactScreenSizeMode(window.screen.availWidth,
      window.screen.availHeight, parseFloat(simple_prefs.prefs.pixelRatioStr)));
  }
};

var optionsDisplayedObserver = {
  observe: function(aSubject, aTopic, aData) {
    if (aTopic == "addon-options-displayed") {
      stylesheet_utils.loadSheet(window_utils.getFocusedWindow(),
       self.data.url('style.css'),'author');
      onModeChange('mode');
    }
  }
};

Services.obs.addObserver(optionsDisplayedObserver, "addon-options-displayed", false);

windows.on('activate', refresh);
simple_prefs.on('', refresh);
simple_prefs.on('mode', onModeChange);
refresh();

exports['setMinWidthMode'] = setMinWidthMode;
exports['setExactScreenSizeMode'] = setExactScreenSizeMode;
exports['setDevPixelsPerPx'] = setDevPixelsPerPx;
