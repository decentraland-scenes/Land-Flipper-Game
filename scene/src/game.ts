import { activate, tileColor, TileColor, addTiles } from './tiles'

import { joinTeam } from './team'
import { messageType } from './messaging'
import { addBases, basesVisible } from './bases'
import * as ui from '../node_modules/@dcl/ui-utils/index'
import { getCurrentRealm } from '@decentraland/EnvironmentAPI'

let socket: WebSocket

// List of all cubes
let tiles: Entity[] = []

const gridX = 14
const gridY = 14

let game: GameLoop

// UI

const timeRemainingLabel = new ui.CornerLabel(
  'Time Remaining',
  -135,
  80,
  Color4.FromInts(0, 200, 0, 255),
  20
)
const timeRemaining = new ui.UICounter(
  60,
  -30,
  80,
  Color4.FromInts(0, 200, 0, 255),
  20
)

const blueLabel = new ui.CornerLabel(
  'Blue',
  -80,
  50,
  Color4.FromInts(0, 150, 200, 255),
  20
)
const blueCounter = new ui.UICounter(
  0,
  -30,
  50,
  Color4.FromInts(0, 150, 200, 255),
  20
)

const redLabel = new ui.CornerLabel(
  'Red',
  -80,
  20,
  Color4.FromInts(250, 75, 90, 255),
  20
)
const redCounter = new ui.UICounter(
  0,
  -30,
  20,
  Color4.FromInts(250, 75, 90, 255),
  20
)

// Logic

export async function joinSocketsServer() {
  // Fetch realm data to keep players in different realms separate
  let realm = await getCurrentRealm()
  log('You are in the realm: ', realm.displayName)
  // Connect to ws server
  socket = new WebSocket(
    'wss://165-232-67-9.nip.io/broadcast/' + realm.displayName
  )
  // Listen for incoming ws messages
  socket.onmessage = function (event) {
    try {
      const msg = JSON.parse(event.data)
      log(msg)
      switch (msg.type) {
        case messageType.NEWGAME:
          game.startGame(msg.duration)
          break
        case messageType.TILEFLIP:
          activate(tiles[msg.tile], msg.color)
          break
        case messageType.MESSAGE:
          ui.displayAnnouncement(msg.text, 3, false, Color4.Black())
          break
        case messageType.END:
          game.endGame(msg.blue, msg.red)
          break
        case messageType.SYNC:
          syncScene(msg.gameActive, msg.tiles)
          break
      }
    } catch (error) {
      log(error)
    }
  }
}

async function setUpGame() {
  await joinSocketsServer()
  addTiles(tiles, gridX, gridY, socket)
  addBases(gridX, gridY, socket)

  game = new GameLoop(1, 60)
  engine.addSystem(game)
}

setUpGame()

export class GameLoop {
  active: boolean = false
  timer: number = 0
  updateTimer: number = 0
  updateInterval: number
  update(dt: number) {
    if (!this.active) {
      return
    }
    this.timer -= dt
    this.updateTimer += dt
    if (this.updateTimer > this.updateInterval) {
      this.updateTimer = 0
      let tiles: number[] = countTiles()
      timeRemaining.set(Math.floor(this.timer))
      blueCounter.set(tiles[0])
      redCounter.set(tiles[1])
    }
  }
  constructor(updateInterval: number, matchLength: number) {
    this.updateInterval = updateInterval
    this.timer = matchLength
  }
  startGame(gameDuration) {
    this.active = true
    this.timer = gameDuration
    basesVisible(false)

    resetAllTiles()

    timeRemaining.set(this.timer)
    blueCounter.set(0)
    redCounter.set(0)
  }
  endGame(blue: number, red: number) {
    this.timer = 0
    joinTeam(tileColor.NEUTRAL, socket)
    this.active = false
    basesVisible(true)

    timeRemaining.set(0)
    blueCounter.set(blue)
    redCounter.set(red)

    if (blue > red) {
      ui.displayAnnouncement(
        'Blue team wins!',
        3,
        false,
        Color4.FromInts(0, 150, 200, 255)
      )
    } else if (blue < red) {
      ui.displayAnnouncement(
        'Blue team wins!',
        3,
        false,
        Color4.FromInts(250, 75, 90, 255)
      )
    } else {
      ui.displayAnnouncement("It's a tie!", 3, false, Color4.Black())
    }
  }
}

export function resetAllTiles() {
  for (let tile of tiles) {
    activate(tile, tileColor.NEUTRAL)
  }
}

export function countTiles() {
  let tileCount = [0, 0]
  for (let tile of tiles) {
    if (tile.getComponent(TileColor).color == tileColor.BLUE) {
      tileCount[0] += 1
    } else if (tile.getComponent(TileColor).color == tileColor.RED) {
      tileCount[1] += 1
    }
  }

  return tileCount
}

export function syncScene(gameActive: boolean, tilesServer: tileColor[]) {
  if (gameActive == true) {
    game.startGame(60) // TODO use remaining time
  }

  for (let i = 0; i < tiles.length; i++) {
    if (tiles[i].getComponent(TileColor).color !== tilesServer[i]) {
      activate(tiles[i], tilesServer[i])
    }

    switch (tilesServer[i]) {
      case tileColor.NEUTRAL:
    }
  }
}

//  Base
const baseGrid: Entity = new Entity()
baseGrid.addComponent(new GLTFShape('models/baseGrid.glb'))
baseGrid.addComponent(new Transform())
engine.addEntity(baseGrid)

// Ask for current game state
socket.send(JSON.stringify({ type: messageType.SYNC }))
