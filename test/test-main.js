var main = require('./main');
var simple_prefs = require('sdk/simple-prefs');
var preferences = require('sdk/preferences/service');

exports["test when mode is min screen width " +
        "and user sets pixel ratio to 1.2 " +
        "and devPixelsPerPx is set to -1 " +
        "and screen is not greater than specified width " +
        "then devPixelsPerPx is set to -1"] = function(assert) {
  main.setDevPixelsPerPx(main.setMinWidthMode(1920, '-1',  '1.2'));
  assert.equal(preferences.get('layout.css.devPixelsPerPx'), '-1');
};

exports["test when mode is min screen width " +
        "and user sets pixel ratio to 1.2 " +
        "and devPixelsPerPx is set to -1 " +
        "and screen is greater than specified width " +
        "then devPixelsPerPx is set to 1.2"] = function(assert) {
  main.setDevPixelsPerPx(main.setMinWidthMode(2880, '-1',  '1.2'));
  assert.equal(preferences.get('layout.css.devPixelsPerPx'), '1.2');
};

exports["test when mode is min screen width " +
        "and user sets pixel ratio to 1.2 " +
        "and devPixelsPerPx is set to 1.5 " +
        "and screen is not greater than specified width " +
        "then devPixelsPerPx is set to -1"] = function(assert) {
  main.setDevPixelsPerPx(main.setMinWidthMode(1920, '1.5',  '1.2'));
  assert.equal(preferences.get('layout.css.devPixelsPerPx'), '-1');
};

exports["test when mode is exact screen resolution " + 
        "and user sets pixel ratio 1.2 " +
        "and devPixelsPerPx is set to -1 " +
        "and screen matches specified resolution " +
        "then devPixelsPerPx is set to 1.2"] = function(assert) {
  main.setDevPixelsPerPx(main.setExactScreenResolutionMode('1920', '1080', '-1', '1.2'));
  assert.equal(preferences.get('layout.css.devPixelsPerPx'), '1.2');
};

exports["test when mode is exact screen resolution " +
        "and user sets pixel ratio 1.2 " +
        "and devPixelsPerPx is set to -1 " +
        "and screen does not match specified resolution " +
        "then devPixelsPerPx is set to -1"] = function(assert) {
  main.setDevPixelsPerPx(main.setExactScreenResolutionMode('1920', '1200', '-1', '1.2'));
  assert.equal(preferences.get('layout.css.devPixelsPerPx'), '-1');
};

exports["test when mode is exact screen resolution " + 
        "and user sets pixel ratio 1.2 " +
        "and devPixelsPerPx is set to 1.5 " +
        "and screen matches specified resolution " +
        "then devPixelsPerPx is set to 1.2"] = function(assert) {
  main.setDevPixelsPerPx(main.setExactScreenResolutionMode('2880', '1620', '1.5', '1.2'));
  assert.equal(preferences.get('layout.css.devPixelsPerPx'), '1.2');
};

require("sdk/test").run(exports);
