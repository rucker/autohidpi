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

var setMinWidthMode = function(width, devPixelsPerPx) {
  var window = window_utils.getFocusedWindow();
  // when we change devPixelsPerPx it also affects availWidth so we fix it
  // sometimes it calculates the width a bit off so lets add a small slack to prevent false triggers
  width = Math.ceil(width * devPixelsPerPx) + 128;
  if (width < simple_prefs.prefs.screenWidth) {
    devPixelsPerPx = 1;
  }
  return devPixelsPerPx;
}

var setDevPixelsPerPx = function(devPixelsPerPx) {
  if (devPixelsPerPx && devPixelsPerPx <= 3) {
    preferences.set('layout.css.devPixelsPerPx', devPixelsPerPx + '');
  }
};

var devPixelsPerPx = 1;
var refresh = function() {
  var window = window_utils.getFocusedWindow();

  if (simple_prefs.prefs.mode == 'minWidth') {
    devPixelsPerPx = setMinWidthMode(window.screen.availWidth, parseFloat(simple_prefs.prefs.pixelRatioStr));
  }
  else {
    var exactScreenSize = simple_prefs.prefs.exactScreenSize;
    if (exactScreenSize) {
      if (!width) {
	width = window.screen.width;
      }
      if (!height) {
	height = window.screen.height;
      }
      var dimensions = exactScreenSize.trim().split(/(X|x)/);
      if (dimensions.length == 3 &&
	  dimensions[0] == width * devPixelsPerPx &&
	  dimensions[2] == height * devPixelsPerPx) {
	  devPixelsPerPx = parseFloat(simple_prefs.prefs.pixelRatioStr);
      }
      else {
	devPixelsPerPx = 1;
      }
    }
  }

  setDevPixelsPerPx(devPixelsPerPx);
};

var optionsDisplayedObserver = {
  observe: function(aSubject, aTopic, aData) {
    if (aTopic == "addon-options-displayed") {
      stylesheet_utils.loadSheet(window_utils.getFocusedWindow(), self.data.url('style.css'),'author');
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
exports['setDevPixelsPerPx'] = setDevPixelsPerPx;
