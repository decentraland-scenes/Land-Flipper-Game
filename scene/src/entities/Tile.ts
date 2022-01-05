import { playerTeam } from '../team'
import * as utils from '@dcl/ecs-scene-utils'
import { game } from 'src/game'

export enum tileColor {
  NEUTRAL,
  BLUE,
  RED,
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

let soundPlayer = new AudioSource(new AudioClip('sounds/flip.mp3'))

export class Tile extends Entity {
  private color: tileColor = tileColor.NEUTRAL

  constructor(
    position: TilePosition,
    changeListener: (position: TilePosition, color: tileColor) => void
  ) {
    super()
    const xPosition = position.j * (TILE_SIZE + GAP_BETWEEN_TILES) + xOffset
    const zPosition = position.i * (TILE_SIZE + GAP_BETWEEN_TILES) + zOffset
    const transform = new Transform({
      position: new Vector3(xPosition, 0.17, zPosition),
      rotation: Quaternion.Euler(90, 0, 0),
      scale: new Vector3(TILE_SIZE, TILE_SIZE, 0.125),
    })
    this.addComponent(transform)
    this.addComponent(new PlaneShape())
    this.addComponentOrReplace(neutralMaterial)

    let triggerBox = new utils.TriggerBoxShape(
      new Vector3(TILE_SIZE * 0.9, 4, TILE_SIZE * 0.9),
      Vector3.Zero()
    )

    this.addComponent(
      new utils.TriggerComponent(triggerBox, {
        onCameraEnter: () => {
          if (game.board.active && playerTeam) {
            changeListener(position, playerTeam)

            // play sound
            if (this.getColor() != playerTeam) {
              this.addComponentOrReplace(soundPlayer)
              this.getComponent(AudioSource).playOnce()
            }
          }
        },
      })
    )

    engine.addEntity(this)
  }

  activate(color: tileColor) {
    this.color = color
    switch (color) {
      case tileColor.NEUTRAL:
        this.addComponentOrReplace(neutralMaterial)
        break
      case tileColor.BLUE:
        this.addComponentOrReplace(blueMaterial)
        break
      case tileColor.RED:
        this.addComponentOrReplace(redMaterial)
        break
    }
  }

  public getColor(): tileColor {
    return this.color
  }
}

export type TilePosition = { i: number; j: number }
