/**
 * @fileoverview Description of this file.
 * @author sharvil.nanavati@gmail.com (Sharvil Nanavati)
 */

goog.provide('dotprod.Application');

goog.require('goog.debug.Console');
goog.require('goog.dom');
goog.require('dotprod.Game');
goog.require('dotprod.GameConfig');
goog.require('dotprod.Protocol');
goog.require('dotprod.ResourceManager');
goog.require('dotprod.views.LoadingView');
goog.require('dotprod.views.LoginView');

/**
 * @constructor
 */
dotprod.Application = function() {
  // Make sure all logging output goes to console.
  new goog.debug.Console().setCapturing(true);

  /**
   * @type {!dotprod.Protocol}
   * @private
   */
  this.protocol_ = new dotprod.Protocol('ws://dev.nanavati.net:8000/dotproduct');

  /**
   * @type {!dotprod.ResourceManager}
   * @private
   */
  this.resourceManager_ = new dotprod.ResourceManager();

  /**
   * @type {!dotprod.views.LoginView}
   * @private
   */
  this.loginView_ = new dotprod.views.LoginView(this.protocol_, goog.bind(this.startGame_, this));
  this.loginView_.renderDom(/** @type {!HTMLDivElement} */ (goog.dom.$('login')));

  this.loadingView_ = new dotprod.views.LoadingView(this.resourceManager_, goog.bind(this.onLoadComplete_, this));
  this.loadingView_.renderDom(/** @type {!HTMLDivElement} */ (goog.dom.$('loading')));
  this.loadingView_.hide();

  /**
   * @type {dotprod.GameConfig}
   * @private
   */
  this.gameConfig_;

  /**
   * @type {dotprod.Game}
   * @private
   */
  this.game_;
};

/**
 * @param {!dotprod.GameConfig} gameConfig
 */
dotprod.Application.prototype.startGame_ = function(gameConfig) {
  this.gameConfig_ = gameConfig;

  this.loginView_.hide();
  this.loadingView_.show();
  this.loadingView_.load(gameConfig.getResources());
};

dotprod.Application.prototype.onLoadComplete_ = function() {
  this.loadingView_.hide();

  if (this.game_) {
    this.game_.stop();
    this.game_.dispose();
  }

  this.game_ = new dotprod.Game(this.protocol_, this.resourceManager_, this.gameConfig_);
  this.game_.renderDom(/** @type {!HTMLDivElement} */ (goog.dom.$('game')));
  this.game_.start();
};

var _main = function() {
  new dotprod.Application();
};
