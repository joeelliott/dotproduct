import Viewport from 'Viewport';
import Drawable from 'graphics/Drawable';
import Animation from 'graphics/Animation';
import Image from 'graphics/Image';
import { Layer } from 'graphics/Layer';
import Map from 'model/Map';
import ModelObject from 'model/ModelObject';
import ResourceManager from 'ResourceManager';
import { TileType } from 'types';
import Game from 'ui/Game';

export default class MapLayer extends ModelObject implements Drawable {
  private resourceManager_ : ResourceManager;
  private map_ : Map;
  private animations_ : Array<Animation>;
  private tileset_ : Image;

  constructor(game : Game) {
    super(game.getSimulation()),

    this.resourceManager_ = game.getResourceManager();
    this.map_ = game.getMap();
    this.animations_ = [];
    this.tileset_ = this.resourceManager_.getImage('tileset');

    game.getPainter().registerDrawable(Layer.MAP, this);
  }

  public advanceTime() {
    for (var i = 0; i < this.animations_.length; ++i) {
      if (this.animations_[i]) {
        this.animations_[i].update();
      }
    }
  }

  protected onInvalidate_() {
    assert(false, 'Map should never be invalidated.');
  }

  public render(viewport : Viewport) {
    var map = this.map_;
    var dimensions = viewport.getDimensions();
    var context = viewport.getContext();

    var tileWidth = this.tileset_.getTileWidth();
    var tileHeight = this.tileset_.getTileHeight();

    context.save();
    var halfWidth = Math.floor(dimensions.width / 2);
    var halfHeight = Math.floor(dimensions.height / 2);

    // Render one extra tile around the top and left in case we have a large
    // rock that's only partially protruding into the viewport.
    var leftTile = Math.floor((dimensions.x - halfWidth) / tileWidth) - 1;
    var topTile = Math.floor((dimensions.y - halfHeight) / tileHeight) - 1;
    var numHorizTiles = Math.ceil(dimensions.width / tileWidth) + 1;
    var numVertTiles = Math.ceil(dimensions.height / tileHeight) + 1;

    // Don't render tiles before 0th index.
    topTile = Math.max(topTile, 0);
    leftTile = Math.max(leftTile, 0);

    // Don't draw tiles past the map width/height.
    if (topTile + numVertTiles >= map.getHeight()) {
      numVertTiles = map.getHeight() - topTile - 1;
    }

    if (leftTile + numHorizTiles >= map.getWidth()) {
      numHorizTiles = map.getWidth() - leftTile - 1;
    }

    for (var y = topTile; y <= topTile + numVertTiles; ++y) {
      for (var x = leftTile; x <= leftTile + numHorizTiles; ++x) {
        var tileNum = map.getTile(x, y);
        if (tileNum == TileType.NONE) {
          continue;
        }

        var tileProperties = map.getTileProperties(tileNum);
        var index = tileProperties['index'];
        if (!tileProperties['animated']) {
          if (index <= this.tileset_.getNumTiles()) {
            this.tileset_.render(context,
              x * tileWidth - dimensions.x + halfWidth,
              y * tileHeight - dimensions.y + halfHeight,
              index);
          }
        } else {
          // Animated tile.
          if (!this.animations_[index]) {
            this.animations_[index] = this.resourceManager_.getSpriteSheet('anim' + index).getAnimation(0);
            this.animations_[index].setRepeatCount(-1);
          }
          this.animations_[index].render(context,
            x * tileWidth - dimensions.x + halfWidth,
            y * tileHeight - dimensions.y + halfHeight);
        }
      }
    }

    context.restore();
  }
}