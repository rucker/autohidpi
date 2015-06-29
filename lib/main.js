var simple_prefs = require('sdk/simple-prefs');
var preferences = require('sdk/preferences/service');
var windows = require('sdk/windows').browserWindows;
var window_utils = require('sdk/window/utils');

var devPixelsPerPx = 1;
var refresh = function() {
  var window = window_utils.getFocusedWindow();
  // when we change devPixelsPerPx it also affects availWidth so we fix it
  // sometimes it calculates the width a bit off so lets add a small slack to prevent false triggers
  var width = Math.ceil(window.screen.availWidth * devPixelsPerPx) + 128;

  if (width >= simple_prefs.prefs.screenWidth) {
    devPixelsPerPx = parseFloat(simple_prefs.prefs.pixelRatioStr);
  } else {
    devPixelsPerPx = 1;
  }

  if (devPixelsPerPx && devPixelsPerPx <= 3) {
    preferences.set('layout.css.devPixelsPerPx', devPixelsPerPx + '');
  }
};

windows.on('activate', refresh);
simple_prefs.on('', refresh);
refresh();
