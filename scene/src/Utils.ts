import utils from "../node_modules/decentraland-ecs-utils/index"

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