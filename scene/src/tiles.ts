import utils from '../node_modules/decentraland-ecs-utils/index'
import { messageType } from './messaging'
import { playerTeam } from './team'
export enum tileColor {
  NEUTRAL,
  BLUE,
  RED,
}

@Component('tileColor')
export class TileColor {
  color: tileColor
}

// reusable materials

export let neutralMaterial = new Material()
neutralMaterial.albedoColor = Color4.Gray()

let blueMaterial = new Material()
blueMaterial.albedoColor = Color3.Blue()
blueMaterial.emissiveIntensity = 1
blueMaterial.emissiveColor = Color3.Blue()
blueMaterial.metallic = 0.4
blueMaterial.roughness = 1

let redMaterial = new Material()
redMaterial.albedoColor = Color3.Red()
redMaterial.emissiveIntensity = 1
redMaterial.emissiveColor = Color3.Red()
redMaterial.metallic = 0.4
redMaterial.roughness = 1

export function activate(entity: Entity, color: tileColor) {
  entity.getComponent(TileColor).color = color
  switch (color) {
    case tileColor.NEUTRAL:
      entity.addComponentOrReplace(neutralMaterial)
      break
    case tileColor.BLUE:
      entity.addComponentOrReplace(blueMaterial)
      break
    case tileColor.RED:
      entity.addComponentOrReplace(redMaterial)
      break
  }
}

export function addTiles(
  tiles: Entity[],
  gridX: number,
  gridY: number,
  socket: WebSocket
) {
  let triggerBox = new utils.TriggerBoxShape(
    new Vector3((46 / gridX) * 0.9, 4, (46 / gridY) * 0.9),
    Vector3.Zero()
  )

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
}
