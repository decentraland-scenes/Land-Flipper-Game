import { getCurrentRealm } from '@decentraland/EnvironmentAPI'
import { activate, tileColor } from './switchMaterial'
import utils from '../node_modules/decentraland-ecs-utils/index'
import { message, updateUI, setUIMessage } from './ui'

let socket

joinSocketsServer()

export async function joinSocketsServer() {
  // fetch realm data to keep players in different realms separate
  let realm = await getCurrentRealm()
  log(`You are in the realm: `, realm.displayName)
  // connect to ws server
  socket = new WebSocket(
    'wss://64-225-45-232.nip.io/broadcast/' + realm.displayName
  )
  // listen for incoming ws messages
  socket.onmessage = function (event) {
    try {
      const parsed = JSON.parse(event.data)
      log(parsed)
      // activate cube referenced in message
      activate(tiles[parsed.tile], parsed.color)
    } catch (error) {
      log(error)
    }
  }
}

// list of all cubes
let tiles: Entity[] = []

const gridX = 14
const gridY = 14
const gameDuration = 60

let playerTeam: tileColor

let triggerBox = new utils.TriggerBoxShape(
  new Vector3((46 / gridX) * 0.9, 4, (46 / gridY) * 0.9),
  Vector3.Zero()
)

@Component('tileColor')
export class TileColor {
  color: tileColor
}

// add cubes
for (let i = 0; i < gridX; i++) {
  for (let j = 0; j < gridY; j++) {
    let tile = new Entity()
    tile.addComponent(
      new Transform({
        position: new Vector3(
          (i * 42) / gridX + 1.5,
          0,
          (j * 42) / gridY + 1.5
        ),
        rotation: Quaternion.Euler(90, 0, 0),
        scale: new Vector3(42 / gridX, 42 / gridY, 42 / gridY),
      })
    )
    tile.addComponent(new PlaneShape())
    tile.addComponent(
      new OnPointerDown(
        (e) => {
          // send ws message when clicked
          socket.send(
            JSON.stringify({
              tile: i,
              color: playerTeam,
            })
          )
        },
        { button: ActionButton.POINTER, hoverText: 'Activate' }
      )
    )
    tile.addComponent(new TileColor())
    engine.addEntity(tile)

    tile.addComponent(
      new utils.TriggerComponent(triggerBox, 0, null, null, null, () => {
        socket.send(
          JSON.stringify({
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
    position: new Vector3(45, 0, 3),
    rotation: Quaternion.Euler(90, 0, 0),
    scale: new Vector3((42 / gridX) * 2, (42 / gridY) * 2, (42 / gridY) * 2),
  })
)
blueBase.addComponent(new PlaneShape())
blueBase.addComponent(blueMaterial)
engine.addEntity(blueBase)

blueBase.addComponent(
  new utils.TriggerComponent(triggerBox, 0, null, null, null, () => {
    playerTeam = tileColor.BLUE
    game.active = true
    game.timer = gameDuration
    setUIMessage('Joined Blue Team')
    socket.send(
      JSON.stringify({
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
    position: new Vector3(3, 0, 45),
    rotation: Quaternion.Euler(90, 0, 0),
    scale: new Vector3((42 / gridX) * 2, (42 / gridY) * 2, (42 / gridY) * 2),
  })
)
redBase.addComponent(new PlaneShape())
redBase.addComponent(redMaterial)
engine.addEntity(redBase)

redBase.addComponent(
  new utils.TriggerComponent(triggerBox, 0, null, null, null, () => {
    playerTeam = tileColor.RED
    game.active = true
    game.timer = gameDuration
    setUIMessage('Joined Red Team')
    socket.send(
      JSON.stringify({
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
    }
    if (this.timer < 0) {
      this.timer = 0
      let tiles: number[] = countTiles()
      updateUI(this.timer, tiles[0], tiles[1])
      playerTeam = null
      this.active = false
      if (tiles[0] > tiles[1]) {
        setUIMessage('Blue team wins!')
      } else if (tiles[0] < tiles[1]) {
        setUIMessage('Red team wins!')
      } else {
        setUIMessage("It's a tie!")
      }
    }
  }
  constructor(updateInterval: number, matchLength: number) {
    this.updateInterval = updateInterval
    this.timer = matchLength
  }
}

let game = new GameLoop(1, gameDuration)
engine.addSystem(game)

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
