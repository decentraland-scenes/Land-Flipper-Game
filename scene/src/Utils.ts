import * as utils from '@dcl/ecs-scene-utils'

export function setTimeout(delay: number, callback: () => void) {
  const entity = new Entity()
  entity.addComponent(
    new utils.Delay(delay, () => {
      callback()
      engine.removeEntity(entity)
    })
  )

  // add entity to scene
  engine.addEntity(entity)
}
