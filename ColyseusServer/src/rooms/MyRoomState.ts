import { Schema, Context, ArraySchema, MapSchema, type } from '@colyseus/schema'

export class Player extends Schema {
  @type('string') playerId: string
  @type('string') name: string
  @type('number') team: tileColor
  @type('boolean') ready: boolean
  constructor(playerId: string, name: string) {
    super()
    this.playerId = playerId
    this.name = name
  }
}

export enum tileColor {
  NEUTRAL,
  BLUE,
  RED,
}

export class Tile extends Schema {
  @type('number') id: number
  @type('number') x: number
  @type('number') y: number
  @type('number') color: tileColor
}

export class MyRoomState extends Schema {
  @type('boolean') active: boolean
  @type('number') countdown: number
  @type([Tile]) tiles = new ArraySchema<Tile>()
  @type({ map: Player }) players = new MapSchema<Player>()

  constructor(rows: number = 14, cols: number = 14) {
    super()
    this.active = false
    for (let i = 0; i < rows; i++) {
      for (let j = 0; j < cols; j++) {
        this.tiles.push(
          new Tile().assign({
            id: i * cols + j,
            x: i,
            y: j,
            color: tileColor.NEUTRAL,
          })
        )
      }
    }
  }
}
