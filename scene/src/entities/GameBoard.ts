import { Tile, tileColor, TilePosition } from './Tile'
import { Room } from 'colyseus.js'

export class Board extends Entity {
  public tiles: Tile[]
  public active: boolean = false
  public room: Room

  constructor(room: Room) {
    super('Board')
    engine.addEntity(this)
    this.room = room

    this.tiles = []
    for (let i = 0; i < GRIDX; i++) {
      for (let j = 0; j < GRIDZ; j++) {
        const position: TilePosition = { i, j }
        const tile = new Tile(position, (position, color) =>
          room.send('flip-tile', { position: position, color: color })
        )
        tile.setParent(this)
        this.tiles.push(tile)
      }
    }
  }

  // protected reactToSingleChanges(change: TileChange): void {
  //   const { position, color } = change
  //   this.tiles[position.i][position.j].activate(color)
  // }

  // protected loadFullState(fullState: FullState): void {
  //   this.active = fullState.active
  //   if (fullState.active == true) {
  //     game.startGame(fullState.timeLeft)
  //   } else {
  //     game.defaultBoard()
  //   }
  //   for (let i = 0; i < GRIDX; i++) {
  //     for (let j = 0; j < GRIDX; j++) {
  //       this.tiles[i][j].activate(fullState.tiles[i][j])
  //     }
  //   }
  // }

  resetAllTiles(): void {
    for (let i = 0; i < this.tiles.length; i++) {
      this.tiles[i].activate(tileColor.NEUTRAL)
    }
  }

  countTiles(): number[] {
    let tileCount = [0, 0]
    for (let i = 0; i < this.room.state.tiles.length; i++) {
      if (this.room.state.tiles[i].color == tileColor.BLUE) {
        tileCount[0] += 1
      } else if (this.room.state.tiles[i].color == tileColor.RED) {
        tileCount[1] += 1
      }
    }

    return tileCount
  }
}
