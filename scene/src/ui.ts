import utils from "../node_modules/decentraland-ecs-utils/index"

const canvas = new UICanvas()

const message = new UIText(canvas)
message.vAlign = "center"
message.hAlign = "center"
message.hTextAlign = "center"
message.positionY = 100
message.adaptWidth = true
message.fontSize = 60
message.color = Color4.FromHexString(`#BB2528FF`) // new Color4(0, 0, 0, 1)
message.visible = false

const timeRemaining = new UIText(canvas)
timeRemaining.vAlign = "bottom"
timeRemaining.hAlign = "right"
timeRemaining.hTextAlign = "center"
timeRemaining.adaptWidth = true
timeRemaining.fontSize = 20
timeRemaining.color = Color4.FromInts(0, 200, 0, 255)
timeRemaining.positionY = 80
timeRemaining.paddingRight = 30
timeRemaining.visible = false

const blueScore = new UIText(canvas)
blueScore.vAlign = "bottom"
blueScore.hAlign = "right"
blueScore.hTextAlign = "center"
blueScore.adaptWidth = true
blueScore.fontSize = 20
blueScore.color = Color4.FromInts(0, 150, 200, 255)
blueScore.paddingRight = 30
blueScore.positionY = 50
blueScore.visible = false

const redScore = new UIText(canvas)
redScore.vAlign = "bottom"
redScore.hAlign = "right"
redScore.hTextAlign = "center"
redScore.adaptWidth = true
redScore.fontSize = 20
redScore.color = Color4.FromInts(250, 75, 90, 255)
redScore.paddingRight = 30
redScore.positionY = 20
redScore.visible = false

export function setUIMessage(value: string, duration?: number, color?: Color4) {
  message.visible = true
  message.value = value

  if (color) {
    message.color = color
  } else {
    message.color = Color4.FromInts(75, 75, 75, 255)
  }

  let dummyEntity = new Entity()
  engine.addEntity(dummyEntity)

  dummyEntity.addComponent(
    new utils.Delay(duration ? duration : 1500, () => {
      message.visible = false
    })
  )
}

export function updateUI(time: number, blue: number, red: number) {
  timeRemaining.visible = true
  timeRemaining.value = "Time Remaining " + Math.floor(time).toString()
  blueScore.visible = true
  blueScore.value = "Blue " + blue.toString()
  redScore.visible = true
  redScore.value = "Red " + red.toString()
}
