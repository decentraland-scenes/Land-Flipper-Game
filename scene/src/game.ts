import { getCurrentRealm } from '@decentraland/EnvironmentAPI'
import { activate, tileColor } from './switchMaterial'
import utils from '../node_modules/decentraland-ecs-utils/index'
import { updateUI, setUIMessage } from './ui'

export enum messageType {
  JOIN,
  TILEFLIP,
  NEWGAME,
  END,
  MESSAGE,
  SYNC,
}

let socket

joinSocketsServer()

export async function joinSocketsServer() {
  // fetch realm data to keep players in different realms separate
  let realm = await getCurrentRealm()
  log(`You are in the realm: `, realm.displayName)
  // connect to ws server
  socket = new WebSocket(
    'ws://localhost:13370' //wss://64-225-45-232.nip.io/broadcast/' + realm.displayName
  )
  // listen for incoming ws messages
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
          // TODO: set everything up from server response
          break
      }
    } catch (error) {
      log(error)
    }
  }

  // ask for current game state
  socket.send(JSON.stringify({ type: messageType.SYNC }))
}

// list of all cubes
let tiles: Entity[] = []

const gridX = 14
const gridY = 14

let blueScore = 0
let redScore = 0

let playerTeam: tileColor

let triggerBox = new utils.TriggerBoxShape(
  new Vector3((46 / gridX) * 0.9, 4, (46 / gridY) * 0.9),
  Vector3.Zero()
)

@Component('tileColor')
export class TileColor {
  color: tileColor
}

// add tiles
for (let i = 0; i < gridX; i++) {
  for (let j = 0; j < gridY; j++) {
    let tile = new Entity()
    tile.addComponent(
      new Transform({
        position: new Vector3(
          (i * 42) / gridX + 2.5,
          0.17,
          (j * 42) / gridY + 2.5
        ),
        rotation: Quaternion.Euler(90, 0, 0),
        scale: new Vector3(42 / gridX, 42 / gridY, 42 / gridY),
      })
    )
    tile.addComponent(new PlaneShape())
    tile.addComponent(new TileColor())
    engine.addEntity(tile)

    tile.addComponent(
      new utils.TriggerComponent(triggerBox, 0, null, null, null, () => {
        socket.send(
          JSON.stringify({
            type: messageType.TILEFLIP,
            tile: i * gridY + j,
            color: playerTeam,
          })
        )
      })
    )

    tiles.push(tile)
  }
}

/// Blue base

let blueMaterial = new Material()
blueMaterial.albedoColor = Color3.Blue()

let blueBase = new Entity()
blueBase.addComponent(
  new Transform({
    position: new Vector3(45.4, 0.17, 3),
    rotation: Quaternion.Euler(90, 0, 0),
    scale: new Vector3(
      (42 / gridX) * 1.6,
      (42 / gridY) * 1.6,
      (42 / gridY) * 1.6
    ),
  })
)
blueBase.addComponent(new PlaneShape())
blueBase.addComponent(blueMaterial)
engine.addEntity(blueBase)

blueBase.addComponent(
  new utils.TriggerComponent(triggerBox, 0, null, null, null, () => {
    if (playerTeam == tileColor.BLUE) return
    playerTeam = tileColor.BLUE
    // TODO: get player ID
    setUIMessage('Joined Blue Team', 2000, Color4.Blue())
    socket.send(
      JSON.stringify({
        type: messageType.JOIN,
        id: 1,
        team: tileColor.BLUE,
      })
    )
  })
)

let blueArrow = new Entity()
blueArrow.addComponent(new GLTFShape('models/BlueArrow.glb'))
blueArrow.setParent(blueBase)
blueArrow.addComponent(
  new Transform({
    position: new Vector3(0, 0, -0.7),
    rotation: Quaternion.Euler(-90, 0, 0),
  })
)

let blueSign = new Entity()
blueSign.addComponent(new TextShape('Join Blue Team'))
blueSign.getComponent(TextShape).fontSize = 2
blueSign.getComponent(TextShape).color = Color3.Blue()
blueSign.setParent(blueBase)
blueSign.addComponent(
  new Transform({
    position: new Vector3(0, 0, -0.7),
    rotation: Quaternion.Euler(-90, 180, 0),
  })
)

/// Red base

let redMaterial = new Material()
redMaterial.albedoColor = Color3.Red()

let redBase = new Entity()
redBase.addComponent(
  new Transform({
    position: new Vector3(3, 0.17, 45.4),
    rotation: Quaternion.Euler(90, 0, 0),
    scale: new Vector3(
      (42 / gridX) * 1.6,
      (42 / gridY) * 1.6,
      (42 / gridY) * 1.6
    ),
  })
)
redBase.addComponent(new PlaneShape())
redBase.addComponent(redMaterial)
engine.addEntity(redBase)

redBase.addComponent(
  new utils.TriggerComponent(triggerBox, 0, null, null, null, () => {
    if (playerTeam == tileColor.RED) return
    playerTeam = tileColor.RED
    // TODO: get player ID
    setUIMessage('Joined Red Team', 2000, Color4.Red())
    socket.send(
      JSON.stringify({
        type: messageType.JOIN,
        id: 1,
        team: tileColor.RED,
      })
    )
  })
)

let redArrow = new Entity()
redArrow.addComponent(new GLTFShape('models/RedArrow.glb'))
redArrow.setParent(redBase)
redArrow.addComponent(
  new Transform({
    position: new Vector3(0, 0, -0.7),
    rotation: Quaternion.Euler(-90, 90, 0),
  })
)

let redSign = new Entity()
redSign.addComponent(new TextShape('Join Red Team'))
redSign.getComponent(TextShape).fontSize = 2
redSign.getComponent(TextShape).color = Color3.Red()
redSign.setParent(redBase)
redSign.addComponent(
  new Transform({
    position: new Vector3(0, 0, -0.7),
    rotation: Quaternion.Euler(-90, 270, 0),
  })
)

export function basesVisible(state: boolean) {
  redBase.getComponent(PlaneShape).visible = state
  redArrow.getComponent(GLTFShape).visible = state
  redSign.getComponent(TextShape).value = state ? 'Join Red Team' : ''
  blueBase.getComponent(PlaneShape).visible = state
  blueArrow.getComponent(GLTFShape).visible = state
  blueSign.getComponent(TextShape).value = state ? 'Join Blue Team' : ''
}

export class GameLoop {
  active: boolean = false
  timer: number = 0
  updateTimer: number = 0
  updateInterval: number
  update(dt: number) {
    if (!this.active || !playerTeam) {
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
    playerTeam = null
    this.active = false
    basesVisible(true)

    updateUI(0, blue, red)

    if (blue > red) {
      setUIMessage('Blue team wins!', 2000, Color4.Blue())
    } else if (blue < red) {
      setUIMessage('Red team wins!', 2000, Color4.Red())
    } else {
      setUIMessage("It's a tie!")
    }
  }
}

let game = new GameLoop(1, 60)
engine.addSystem(game)

export function resetAllTiles() {
  for (let tile of tiles) {
    tile.getComponent(TileColor).color = tileColor.NEUTRAL
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

//  floor
const baseScene: Entity = new Entity()
baseScene.addComponent(new GLTFShape('models/baseScene.glb'))
baseScene.addComponent(
  new Transform({
    scale: new Vector3(1.5, 1.5, 1.5),
  })
)
engine.addEntity(baseScene)
