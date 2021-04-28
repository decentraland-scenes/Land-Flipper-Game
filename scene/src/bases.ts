import * as utils from '@dcl/ecs-scene-utils'
import { joinTeam } from './team'
import { tileColor } from './entities/Tile'
import { Room } from 'colyseus.js'

// Blue base
export let blueMaterial = new Material()
blueMaterial.roughness = 1
blueMaterial.albedoColor = Color3.FromInts(0, 300, 400)

let blueBase = new Entity()
let blueArrow = new Entity()
let redBase = new Entity()
let redArrow = new Entity()

export function addBases(gridX, gridY, room: Room) {
  let redTriggerBox = new utils.TriggerBoxShape(
    new Vector3((42 / gridX) * 2.0, 4, (42 / gridY) * 1.6),
    Vector3.Zero()
  )
  let blueTriggerBox = new utils.TriggerBoxShape(
    new Vector3((42 / gridX) * 1.6, 4, (42 / gridY) * 2.0),
    Vector3.Zero()
  )

  blueBase.addComponent(
    new Transform({
      position: new Vector3(45.35, 0.17, 4),
      rotation: Quaternion.Euler(90, 0, 0),
      scale: new Vector3(
        (42 / gridX) * 1.5,
        (42 / gridY) * 1.934,
        (42 / gridY) * 1.5
      ),
    })
  )
  blueBase.addComponent(new PlaneShape())
  blueBase.addComponent(blueMaterial)
  engine.addEntity(blueBase)

  blueBase.addComponent(
    new utils.TriggerComponent(blueTriggerBox, {
      onCameraEnter: async () => {
        await joinTeam(tileColor.BLUE, room)
      },
    })
  )

  blueArrow.addComponent(new GLTFShape('models/blueTeamArrow.glb'))
  blueArrow.addComponent(
    new Transform({ position: new Vector3(48.027, 3.5, 3.9) })
  )
  engine.addEntity(blueArrow)

  // Red base
  let redMaterial = new Material()
  redMaterial.roughness = 1
  redMaterial.albedoColor = Color3.FromInts(500, 150, 180)

  redBase.addComponent(
    new Transform({
      position: new Vector3(4, 0.17, 45.35),
      rotation: Quaternion.Euler(90, 0, 0),
      scale: new Vector3(
        (42 / gridX) * 1.934,
        (42 / gridY) * 1.5,
        (42 / gridY) * 1.5
      ),
    })
  )
  redBase.addComponent(new PlaneShape())
  redBase.addComponent(redMaterial)
  engine.addEntity(redBase)

  redBase.addComponent(
    new utils.TriggerComponent(redTriggerBox, {
      onCameraEnter: async () => {
        joinTeam(tileColor.RED, room)
      },
    })
  )

  redArrow.addComponent(new GLTFShape('models/redTeamArrow.glb'))
  redArrow.addComponent(
    new Transform({ position: new Vector3(6.516, 3.5, 45.25) })
  )
  engine.addEntity(redArrow)
}

export function basesVisible(state: boolean) {
  blueBase.getComponent(PlaneShape).visible = state
  blueArrow.getComponent(GLTFShape).visible = state
  redBase.getComponent(PlaneShape).visible = state
  redArrow.getComponent(GLTFShape).visible = state
}
