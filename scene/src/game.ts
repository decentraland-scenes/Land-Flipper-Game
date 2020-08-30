import { joinTeam } from './team'
import { MessageType } from './messaging'
import { addBases, basesVisible } from './bases'
import * as ui from '../node_modules/@dcl/ui-utils/index'
//import { getCurrentRealm } from '@decentraland/EnvironmentAPI'
import {
  MessageAction,
  joinSocketsServer,
  messageActions,
  startSocketListeners,
  socket,
} from './entities/MultiplayerEntity'
import { Board } from './entities/gameBoard'
import { tileColor } from './entities/Tile'
import { timeRemaining, blueCounter, redCounter } from './ui'

export let board: Board
export let game: GameLoop

async function setUpGame() {
  await joinSocketsServer()

  let newGame: MessageAction = {
    tag: MessageType.NEWGAME,
    action: (data) => {
      game.startGame(data.duration)
    },
  }
  let endGame: MessageAction = {
    tag: MessageType.END,
    action: (data) => {
      game.endGame(data.blue, data.red)
    },
  }
  let message: MessageAction = {
    tag: MessageType.MESSAGE,
    action: (data) => {
      ui.displayAnnouncement(data.text, 3, false, Color4.Black())
    },
  }

  messageActions.push(newGame)
  messageActions.push(endGame)
  messageActions.push(message)
  board = await new Board()

  await startSocketListeners()
  socket.onopen = function (event) {
    board.start()
  }

  addBases(GRIDX, GRIDZ, socket)

  game = new GameLoop(1, 60)
  engine.addSystem(game)
  //game.defaultBoard()
}

setUpGame()

// Local game logic running client side
export class GameLoop {
  timer: number = 0
  updateTimer: number = 0
  updateInterval: number
  update(dt: number) {
    if (!board.active) {
      return
    }
    this.timer -= dt
    this.updateTimer += dt
    if (this.updateTimer > this.updateInterval) {
      this.updateTimer = 0
      let tiles: number[] = board.countTiles()
      timeRemaining.set(Math.floor(this.timer))
      blueCounter.set(tiles[0])
      redCounter.set(tiles[1])
    }
  }
  constructor(updateInterval: number, matchLength: number) {
    this.updateInterval = updateInterval
    this.timer = matchLength
  }
  defaultBoard() {
    board.active = false
    this.timer = 0
    basesVisible(true)
    board.resetAllTiles()
    timeRemaining.set(this.timer)
    blueCounter.set(0)
    redCounter.set(0)
  }
  startGame(gameDuration) {
    board.active = true
    this.timer = gameDuration
    basesVisible(false)

    board.resetAllTiles()

    timeRemaining.set(this.timer)
    blueCounter.set(0)
    redCounter.set(0)
  }
  endGame(blue: number, red: number) {
    this.timer = 0
    joinTeam(tileColor.NEUTRAL, socket)
    board.active = false
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

// export function syncScene(gameActive: boolean, tilesServer: tileColor[]) {
//   if (gameActive == true) {
//     game.startGame(60) // TODO use remaining time
//   }

//   for (let i = 0; i < tiles.length; i++) {
//     if (tiles[i].getComponent(TileColor).color !== tilesServer[i]) {
//       activate(tiles[i], tilesServer[i])
//     }

//     switch (tilesServer[i]) {
//       case tileColor.NEUTRAL:
//     }
//   }
//}

// Ask for current game state
// socket.send(JSON.stringify({ type: messageType.SYNC }))

//  Base
const baseGrid: Entity = new Entity()
baseGrid.addComponent(new GLTFShape('models/baseGrid.glb'))
baseGrid.addComponent(new Transform())
engine.addEntity(baseGrid)
