import utils from '../node_modules/decentraland-ecs-utils/index'
import { tileColor } from './tiles'
import { joinTeam } from './team'

/// Blue base
export let blueMaterial = new Material()
blueMaterial.albedoColor = Color3.Blue()
blueMaterial.emissiveIntensity = 1
blueMaterial.emissiveColor = Color3.Blue()
blueMaterial.metallic = 0.4
blueMaterial.roughness = 1

let blueBase = new Entity()
let blueArrow = new Entity()
let blueSign = new Entity()
let redBase = new Entity()
let redArrow = new Entity()
let redSign = new Entity()

export function addBases(gridX, gridY, socket: WebSocket) {
  let triggerBox = new utils.TriggerBoxShape(
    new Vector3((46 / gridX) * 0.9, 4, (46 / gridY) * 0.9),
    Vector3.Zero()
  )

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
    new utils.TriggerComponent(triggerBox, 0, null, null, null, async () => {
      await joinTeam(tileColor.BLUE, socket)
    })
  )

  blueArrow.addComponent(new GLTFShape('models/BlueArrow.glb'))
  blueArrow.setParent(blueBase)
  blueArrow.addComponent(
    new Transform({
      position: new Vector3(0, 0, -0.7),
      rotation: Quaternion.Euler(-90, 0, 0),
    })
  )

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
  redMaterial.emissiveIntensity = 1
  redMaterial.emissiveColor = Color3.Red()
  redMaterial.metallic = 0.4
  redMaterial.roughness = 1

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
    new utils.TriggerComponent(triggerBox, 0, null, null, null, async () => {
      joinTeam(tileColor.RED, socket)
    })
  )

  redArrow.addComponent(new GLTFShape('models/RedArrow.glb'))
  redArrow.setParent(redBase)
  redArrow.addComponent(
    new Transform({
      position: new Vector3(0, 0, -0.7),
      rotation: Quaternion.Euler(-90, 90, 0),
    })
  )

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
}

export function basesVisible(state: boolean) {
  redBase.getComponent(PlaneShape).visible = state
  redArrow.getComponent(GLTFShape).visible = state
  redSign.getComponent(TextShape).value = state ? 'Join Red Team' : ''
  blueBase.getComponent(PlaneShape).visible = state
  blueArrow.getComponent(GLTFShape).visible = state
  blueSign.getComponent(TextShape).value = state ? 'Join Blue Team' : ''
}
