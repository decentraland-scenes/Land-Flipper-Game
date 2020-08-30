import { MultiplayerEntity } from './MultiplayerEntity'
import { Tile, tileColor, TilePosition } from './Tile'
import { game } from '../game'

export class Board extends MultiplayerEntity<TileChange, FullState> {
  private tiles: Tile[][]
  public active: boolean = false

  constructor() {
    super('Board')
    engine.addEntity(this)

    this.tiles = []
    for (let i = 0; i < GRIDX; i++) {
      this.tiles[i] = []
      for (let j = 0; j < GRIDZ; j++) {
        const position = { i, j }
        const tile = new Tile(position, (position, color) =>
          this.propagateChange({ position, color })
        )
        tile.setParent(this)
        this.tiles[i][j] = tile
      }
    }
  }

  protected reactToSingleChanges(change: TileChange): void {
    const { position, color } = change
    this.tiles[position.i][position.j].activate(color)
  }

  protected loadFullState(fullState: FullState): void {
    this.active = fullState.active
    if (fullState.active == true) {
      game.startGame(fullState.timeLeft)
    } else {
      game.defaultBoard()
    }
    for (let i = 0; i < GRIDX; i++) {
      for (let j = 0; j < GRIDX; j++) {
        this.tiles[i][j].activate(fullState.tiles[i][j])
      }
    }
  }

  resetAllTiles(): void {
    for (let i = 0; i < GRIDX; i++) {
      for (let j = 0; j < GRIDX; j++) {
        this.tiles[i][j].activate(tileColor.NEUTRAL)
      }
    }
  }

  countTiles(): number[] {
    let tileCount = [0, 0]
    for (let i = 0; i < GRIDX; i++) {
      for (let j = 0; j < GRIDX; j++) {
        if (this.tiles[i][j].getColor() == tileColor.BLUE) {
          tileCount[0] += 1
        } else if (this.tiles[i][j].getColor() == tileColor.RED) {
          tileCount[1] += 1
        }
      }
    }

    return tileCount
  }
}

type TileChange = {
  position: TilePosition
  color: tileColor
  sender?: string
}

type FullState = {
  type: string
  active: boolean
  tiles: tileColor[][]
  timeLeft?: number
  blue?: number
  red?: number
}
