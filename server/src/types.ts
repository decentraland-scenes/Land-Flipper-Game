export enum MessageType {
  JOIN = 'join',
  NEWGAME = 'new',
  END = 'end',
  MESSAGE = 'msg',
}

export enum tileColor {
  NEUTRAL,
  BLUE,
  RED,
}

export type TilePosition = { i: number; j: number }

type TileChange = {
  position: TilePosition
  color: tileColor
  sender?: string
}

export type FullState = {
  active: boolean
  tiles: tileColor[][]
  timeLeft?: number
  blue?: number
  red?: number
}

export class Player extends Object {
  id: number
  team: tileColor
  constructor(id: number, team: tileColor) {
    super()
    ;(this.id = id), (this.team = team)
  }
}

// data per each room
export class roomData {
  gameActive: boolean = false
  blueTeam: Player[] = []
  redTeam: Player[] = []
  tiles: tileColor[][] = new Array(14)
    .fill(null)
    .map(() => new Array(14).fill(null))
  // TODO add time remaining
}

export interface roomDictionary {
  [index: string]: roomData
}
