var simple_prefs = require('sdk/simple-prefs');
var preferences = require('sdk/preferences/service');
var windows = require('sdk/windows').browserWindows;
var window_utils = require('sdk/window/utils');
var stylesheet_utils = require('sdk/stylesheet/utils');
var self = require('sdk/self');
const {Cu} = require('chrome');
const services = Cu.import('resource://gre/modules/Services.jsm');

var onModeChange = function(prefName) {
  if (simple_prefs.prefs.mode == 'minWidth') {
    var enablePrefElem = 'screenWidth';
    var disablePrefElem = 'exactScreenResolution';
  }
  else {
    var enablePrefElem = 'exactScreenResolution';
    var disablePrefElem = 'screenWidth';
  }
  var scriptString =
      "document.querySelector('[pref-name=" + disablePrefElem + "]').setAttribute('disabled', true);" +
    "document.querySelector('[pref-name=" + enablePrefElem + "]').removeAttribute('disabled');";
  require("sdk/tabs").activeTab.attach({
    contentScript: scriptString
  });
};

var calculateSlack = function(availWidth, multiplier) {
  // when we change devPixelsPerPx it also affects availWidth so we fix it
  // sometimes it calculates the width a bit off so lets add a small slack to prevent false triggers
  return Math.ceil(availWidth * multiplier) + 128;
}

var setMinWidthMode = function(availWidth, devPixelsPerPx, pixelRatioStr) {
  if (devPixelsPerPx == '-1') {
    availWidth = calculateSlack(availWidth, 1);
  }
  else {
    availWidth = calculateSlack(availWidth, pixelRatioStr);
  }
  if (availWidth < simple_prefs.prefs.screenWidth) {
    pixelRatioStr = '-1';
  }
  return pixelRatioStr;
};

var setExactScreenResolutionMode = function(availWidth, availHeight, devPixelsPerPx, pixelRatioStr) {
  var exactScreenResolution = simple_prefs.prefs.exactScreenResolution;
  if (exactScreenResolution) {
    if (devPixelsPerPx == '-1') {
      devPixelsPerPx = '1';
    }
    var dimensions = exactScreenResolution.trim().split(/(X|x)/);
    if (dimensions.length != 3 ||
	dimensions[0] * devPixelsPerPx != availWidth ||
	dimensions[2] * devPixelsPerPx != availHeight) {
      pixelRatioStr = '-1';
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
  var devPixelsPerPx = preferences.get('layout.css.devPixelsPerPx');
  var pixelRatioStr = parseFloat(simple_prefs.prefs.pixelRatioStr);

  if (simple_prefs.prefs.mode == 'minWidth') {
      setDevPixelsPerPx(setMinWidthMode(window.screen.availWidth, devPixelsPerPx, pixelRatioStr));
  }
  else {
    setDevPixelsPerPx(setExactScreenResolutionMode(window.screen.availWidth,
      window.screen.availHeight, devPixelsPerPx, pixelRatioStr));
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
exports['setExactScreenResolutionMode'] = setExactScreenResolutionMode;
exports['setDevPixelsPerPx'] = setDevPixelsPerPx;
