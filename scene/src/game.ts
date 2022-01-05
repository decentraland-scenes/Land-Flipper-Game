import { addBases, basesVisible } from './bases'
import * as ui from '@dcl/ui-scene-utils'
import { Board } from './entities/GameBoard'
import { timeRemaining, blueCounter, redCounter } from './ui'
import { connect } from './connection'
import { PlayerMarker } from './entities/marker'
import { tileColor } from './entities/Tile'
import { GameLoop } from './gameLoop'

export let game: GameLoop

//
// Connect to Colyseus server!
// Set up the scene after connection has been established.
//
connect('my_room').then((room) => {
  log('Connected!')

  addBases(GRIDX, GRIDZ, room)

  let board = new Board(room)
  game = new GameLoop(board, 1, 60)
  engine.addSystem(game)

  log('CURRENT ROOM STATE: ', room.state.active)

  room.onMessage('msg', (data) => {
    ui.displayAnnouncement(data.text)
  })

  room.onMessage('new', (data) => {
    game.startGame(data.duration)
  })

  room.onMessage('end', (data) => {
    game.endGame(data.blue, data.red)
  })

  room.onMessage('reset', (data) => {
    game.defaultBoard()
  })

  room.state.listen('active', (state) => {
    if (state.value) {
      log('GAME WAS ALREADY ON')
      basesVisible(false)
      board.active = true
      game.timer = room.state.countdown
    }
  })

  room.state.tiles.onAdd = (tile) => {
    // log("Added tile => ", tile.id)
    tile.listen('color', (value) => {
      log('color is now ', value, ' for tile ', tile.id)
      board.tiles[tile.id].activate(value)

      let scores: number[] = board.countTiles()
      blueCounter.set(scores[0])
      redCounter.set(scores[1])
    })
  }

  room.state.players.onAdd = (player) => {
    log('player joined: ', player.name)
    let marker: PlayerMarker | null = null
    player.listen('team', (value) => {
      log('player is now in team ', value)

      if (marker) {
        marker.remove()
      }
      if (value !== tileColor.NEUTRAL) {
        marker = new PlayerMarker(player.playerId, value)
      }
    })
  }
})

//  Base
const baseGrid: Entity = new Entity()
baseGrid.addComponent(new GLTFShape('models/baseGrid.glb'))
baseGrid.addComponent(new Transform())
engine.addEntity(baseGrid)
