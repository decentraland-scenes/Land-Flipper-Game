import * as ui from '@dcl/ui-scene-utils'

export const timeRemainingLabel = new ui.CornerLabel(
  'Time Remaining',
  -135,
  80,
  Color4.FromInts(0, 200, 0, 255),
  20
)
export const timeRemaining = new ui.UICounter(
  60,
  -30,
  80,
  Color4.FromInts(0, 200, 0, 255),
  20
)

export const blueLabel = new ui.CornerLabel(
  'Blue',
  -80,
  50,
  Color4.FromInts(0, 150, 200, 255),
  20
)
export const blueCounter = new ui.UICounter(
  0,
  -30,
  50,
  Color4.FromInts(0, 150, 200, 255),
  20
)

export const redLabel = new ui.CornerLabel(
  'Red',
  -80,
  20,
  Color4.FromInts(250, 75, 90, 255),
  20
)
export const redCounter = new ui.UICounter(
  0,
  -30,
  20,
  Color4.FromInts(250, 75, 90, 255),
  20
)
