
import { addBases, basesVisible } from './bases'
import * as ui from '@dcl/ui-scene-utils'
import { Board } from './entities/GameBoard'
import { timeRemaining, blueCounter, redCounter } from './ui'
import { connect } from './connection'


export let board: Board
export let game: GameLoop


//TODO :  room name = realm

//
// Connect to Colyseus server! 
// Set up the scene after connection has been established.
//
connect("my_room").then((room) => {
  log("Connected!");


  board = new Board(room)

  addBases(GRIDX, GRIDZ, room)

  game = new GameLoop(1, 60)
  engine.addSystem(game)


   // TODO if game in progress, update from server!!!!!!!!!!!
  if(room.state.active){
    basesVisible(false)
    //syncTiles()
  } else {

    game.defaultBoard()
  }

  room.onMessage("msg", (data)=>{
    ui.displayAnnouncement(data.text)
  })

  room.onMessage("new", (data)=>{
    game.startGame(data.duration)
  })

  room.onMessage("end", (data)=>{
    game.endGame(data.blue, data.red)
  })

  room.onMessage("reset", (data)=>{
    game.defaultBoard()
  })

  // room.onMessage("flip-tile", (data)=>{
    
  // })

  // room.onStateChange( (newState) =>{

  // })


  room.state.tiles.forEach((tile) => {
    tile.onChange = (changes) =>{
      changes.forEach(
        change => {
          log( "CHANGE: ", change.field)
          log(change.value)
          log(change.previousValue)
        }

      )
    }
  })


})


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
    // joinTeam(tileColor.NEUTRAL, socket)
    board.active = false
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


// export function syncTiles(tilesServer: tileColor[]) {

//   for (let i = 0; i < tiles.length; i++) {
//     if (tiles[i].getComponent(TileColor).color !== tilesServer[i]) {
//       activate(tiles[i], tilesServer[i])
//     }

//     switch (tilesServer[i]) {
//       case tileColor.NEUTRAL:
//     }
//   }

//  timeRemaining.set(0)
//   blueCounter.set(blue)
//   redCounter.set(red)
//}

//  Base
const baseGrid: Entity = new Entity()
baseGrid.addComponent(new GLTFShape('models/baseGrid.glb'))
baseGrid.addComponent(new Transform())
engine.addEntity(baseGrid)
