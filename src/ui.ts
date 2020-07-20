import decentralandEcsUtils from '../node_modules/decentraland-ecs-utils/index'
import utils from '../node_modules/decentraland-ecs-utils/index'

const canvas = new UICanvas()

export const message = new UIText(canvas)
message.vAlign = 'center'
message.hAlign = 'center'
message.hTextAlign = 'center'
message.adaptWidth = true
message.fontSize = 60
message.color = Color4.FromHexString(`#BB2528FF`) // new Color4(0, 0, 0, 1)
message.visible = false

export const timeRemaining = new UIText(canvas)
timeRemaining.vAlign = 'bottom'
timeRemaining.hAlign = 'left'
timeRemaining.hTextAlign = 'center'
timeRemaining.adaptWidth = true
timeRemaining.fontSize = 20
timeRemaining.color = Color4.Black()
timeRemaining.positionY = 80
timeRemaining.visible = false

export const blueScore = new UIText(canvas)
blueScore.vAlign = 'bottom'
blueScore.hAlign = 'left'
blueScore.hTextAlign = 'center'
blueScore.adaptWidth = true
blueScore.fontSize = 20
blueScore.color = Color4.Blue()
blueScore.positionY = 50
blueScore.visible = false

export const redScore = new UIText(canvas)
redScore.vAlign = 'bottom'
redScore.hAlign = 'left'
redScore.hTextAlign = 'center'
redScore.adaptWidth = true
redScore.fontSize = 20
redScore.color = Color4.FromHexString(`#BB2528FF`)
redScore.positionY = 20
redScore.visible = false

export function setUIMessage(value: string, duration?: number) {
  message.visible = true
  message.value = value

  let dummyEnty = new Entity()
  engine.addEntity(dummyEnty)

  dummyEnty.addComponent(
    new utils.Delay(duration ? duration : 1000, () => {
      message.visible = false
    })
  )
}

export function updateUI(time: number, blue: number, red: number) {
  timeRemaining.visible = true
  timeRemaining.value = 'Time Remaining ' + Math.floor(time).toString()
  blueScore.visible = true
  blueScore.value = 'Blue ' + blue.toString()
  redScore.visible = true
  redScore.value = 'Red ' + red.toString()
}
