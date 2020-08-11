import { activate, tileColor, TileColor, addTiles } from "./tiles"
import { updateUI, setUIMessage } from "./ui"
import { joinTeam } from "./team"
import { messageType } from "./messaging"
import { getCurrentRealm } from "@decentraland/EnvironmentAPI"
import { addBases, basesVisible } from "./bases"

let socket: WebSocket

// List of all cubes
let tiles: Entity[] = []

const gridX = 14
const gridY = 14

let blueScore = 0
let redScore = 0

let game: GameLoop

export async function joinSocketsServer() {
  // Fetch realm data to keep players in different realms separate
  let realm = await getCurrentRealm()
  log("You are in the realm: ", realm.displayName)
  // Connect to ws server
  socket = new WebSocket(
    "ws://localhost:13370" //wss://64-225-45-232.nip.io/broadcast/' + realm.displayName
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
          setUIMessage(msg.text)
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
      updateUI(this.timer, tiles[0], tiles[1])
      blueScore = tiles[0]
      redScore = tiles[1]
    }
  }
  constructor(updateInterval: number, matchLength: number) {
    this.updateInterval = updateInterval
    this.timer = matchLength
  }
  startGame(gameDuration) {
    this.active = true
    this.timer = gameDuration
    blueScore = 0
    redScore = 0
    basesVisible(false)

    resetAllTiles()

    updateUI(this.timer, 0, 0)
  }
  endGame(blue: number, red: number) {
    this.timer = 0
    joinTeam(tileColor.NEUTRAL, socket)
    this.active = false
    basesVisible(true)

    updateUI(0, blue, red)

    if (blue > red) {
      setUIMessage("Blue team wins!", 2000, Color4.FromInts(0, 150, 200, 255))
    } else if (blue < red) {
      setUIMessage("Red team wins!", 2000, Color4.FromInts(250, 75, 90, 255))
    } else {
      setUIMessage("It's a tie!")
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
baseGrid.addComponent(new GLTFShape("models/baseGrid.glb"))
baseGrid.addComponent(new Transform())
engine.addEntity(baseGrid)

// Ask for current game state
socket.send(JSON.stringify({ type: messageType.SYNC }))
