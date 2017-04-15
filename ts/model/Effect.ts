import Vector from 'math/Vector';
import ModelObject from 'model/ModelObject';
import Animation from 'graphics/Animation';
import Drawable from 'graphics/Drawable';
import { Layer } from 'graphics/Layer';
import Game from 'ui/Game';
import Viewport from 'Viewport';

export default class Effect extends ModelObject implements Drawable {
  private game_ : Game;
  private animation_ : Animation;
  private position_ : Vector;
  private velocity_ : Vector;

  constructor(game : Game, animation : Animation, position : Vector, velocity : Vector, layer? : Layer) {
    super(game.getSimulation());

    this.game_ = game;
    this.animation_ = animation;
    this.position_ = position;
    this.velocity_ = velocity;

    game.getPainter().registerDrawable(layer !== undefined ? layer : Layer.EFFECTS, this);
  }

  public advanceTime() {
    this.animation_.update();
    this.position_ = this.position_.add(this.velocity_);
    if (!this.animation_.isRunning()) {
      this.invalidate();
    }
  }

  public render(viewport : Viewport) {
    var context = viewport.getContext();
    var dimensions = viewport.getDimensions();

    var x = Math.floor(this.position_.x - dimensions.left - this.animation_.getWidth() / 2);
    var y = Math.floor(this.position_.y - dimensions.top - this.animation_.getHeight() / 2);

    this.animation_.render(context, x, y);
  }

  protected onInvalidate_() {
    super.onInvalidate_();
    this.game_.getPainter().unregisterDrawable(Layer.EFFECTS, this);
  }
}