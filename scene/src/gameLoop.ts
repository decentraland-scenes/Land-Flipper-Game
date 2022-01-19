import { basesVisible } from './bases'
import { Board } from './entities/GameBoard'
import { blueCounter, redCounter, timeRemaining } from './ui'
import * as ui from '@dcl/ui-scene-utils'

// Local game logic running client side
export class GameLoop {
  timer: number = 0
  updateTimer: number = 0
  updateInterval: number
  board: Board
  update(dt: number) {
    if (!this.board.active) {
      return
    }
    this.timer -= dt
    this.updateTimer += dt
    if (this.updateTimer > this.updateInterval) {
      this.updateTimer = 0
      timeRemaining.set(Math.floor(this.timer))
    }
  }
  constructor(board: Board, updateInterval: number, matchLength: number) {
    this.board = board
    this.updateInterval = updateInterval
    this.timer = matchLength
  }
  defaultBoard() {
    this.board.active = false
    this.timer = 0
    basesVisible(true)
    this.board.resetAllTiles()
    timeRemaining.set(this.timer)
    blueCounter.set(0)
    redCounter.set(0)
  }
  startGame(gameDuration) {
    this.board.active = true
    this.timer = gameDuration
    basesVisible(false)

    this.board.resetAllTiles()

    timeRemaining.set(this.timer)
    blueCounter.set(0)
    redCounter.set(0)
  }
  endGame(blue: number, red: number) {
    this.timer = 0
    this.board.active = false
    basesVisible(true)

    timeRemaining.set(0)
    blueCounter.set(blue)
    redCounter.set(red)

    if (blue > red) {
      ui.displayAnnouncement(
        'Blue team wins!',
        3,
        Color4.FromInts(0, 150, 200, 255)
      )
    } else if (blue < red) {
      ui.displayAnnouncement(
        'Red team wins!',
        3,
        Color4.FromInts(250, 75, 90, 255)
      )
    } else {
      ui.displayAnnouncement("It's a tie!", 3, Color4.Black())
    }
  }
}
