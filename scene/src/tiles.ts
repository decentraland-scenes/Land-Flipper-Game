import utils from "../node_modules/decentraland-ecs-utils/index"
import { messageType } from "./messaging"
import { playerTeam } from "./team"

export enum tileColor {
  NEUTRAL,
  BLUE,
  RED,
}

@Component("tileColor")
export class TileColor {
  color: tileColor
}

// Reusable materials
export let neutralMaterial = new Material()
neutralMaterial.roughness = 1.0
neutralMaterial.albedoColor = Color3.FromInts(400, 250, 100) // Amber glow

let blueMaterial = new Material()
blueMaterial.roughness = 1
blueMaterial.albedoColor = Color3.FromInts(0, 300, 400) // Blue glow

let redMaterial = new Material()
redMaterial.roughness = 1
redMaterial.albedoColor = Color3.FromInts(500, 150, 180) // Pink glow

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

export function addTiles(tiles: Entity[], gridX: number, gridY: number, socket: WebSocket) {
  let triggerBox = new utils.TriggerBoxShape(new Vector3((46 / gridX) * 0.9, 4, (46 / gridY) * 0.9), Vector3.Zero())

  for (let i = 0; i < gridX; i++) {
    for (let j = 0; j < gridY; j++) {
      let tile = new Entity()
      tile.addComponent(
        new Transform({
          position: new Vector3((i * 42) / gridX + 2.5, 0.17, (j * 42) / gridY + 2.5),
          rotation: Quaternion.Euler(90, 0, 0),
          scale: new Vector3(42 / gridX, 42 / gridY, 42 / gridY),
        })
      )
      tile.addComponent(new PlaneShape())
      tile.addComponent(new TileColor())
      tile.addComponentOrReplace(neutralMaterial)
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
