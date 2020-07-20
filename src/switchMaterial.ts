// reusable materials

import { TileColor } from './game'

export enum tileColor {
  NEUTRAL,
  BLUE,
  RED,
}

let neutralMaterial = new Material()
neutralMaterial.albedoColor = Color4.Gray()

let blueMaterial = new Material()
blueMaterial.albedoColor = Color3.Blue()
// blueMaterial.emissiveColor = Color3.Blue()
// blueMaterial.metallic = 1
// blueMaterial.emissiveIntensity = 5
// blueMaterial.roughness = 1

let redMaterial = new Material()
redMaterial.albedoColor = Color3.Red()
//redMaterial.emissiveColor = Color3.Red()

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
