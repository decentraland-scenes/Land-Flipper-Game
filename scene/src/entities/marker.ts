import { tileColor } from './Tile'

const blueColor: Color3 = new Color3(0, 0, 0.6) // Orange glow
const redColor: Color3 = new Color3(0.6, 0, 0) // Pale red

let blueMaterial = new Material()
blueMaterial.albedoColor = blueColor
blueMaterial.metallic = 0.0
blueMaterial.roughness = 1.0

let redMaterial = new Material()
redMaterial.albedoColor = redColor
redMaterial.metallic = 0.0
redMaterial.roughness = 1.0

const shape: ConeShape = new ConeShape()

export class PlayerMarker extends Entity {
  cone: Entity
  label: Entity

  constructor(parent: string, color: tileColor) {
    super()
    engine.addEntity(this)
    this.addComponentOrReplace(
      new AttachToAvatar({
        avatarId: parent,
        anchorPointId: AttachToAvatarAnchorPointId.NameTag,
      })
    )

    this.cone = new Entity()

    this.cone.addComponent(shape)
    engine.addEntity(this.cone)

    this.cone.addComponent(
      new Transform({
        rotation: Quaternion.Euler(0, 0, 180),
        scale: new Vector3(0.2, 0.2, 0.2),
        position: new Vector3(0, 0.4, 0),
      })
    )
    this.cone.setParent(this)

    if (color === tileColor.BLUE) {
      this.cone.addComponent(blueMaterial)
    } else if (color === tileColor.RED) {
      this.cone.addComponent(redMaterial)
    }
  }
  public remove(): void {
    engine.removeEntity(this)
  }
  public hide() {
    this.cone.getComponent(ConeShape).visible = false
  }
  public show() {
    this.cone.getComponent(ConeShape).visible = true
  }
}
