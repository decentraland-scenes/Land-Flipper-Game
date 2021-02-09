import { getUserData } from '@decentraland/Identity'
import { MessageType } from './messaging'
import * as ui from '@dcl/ui-scene-utils'
import { tileColor } from './entities/Tile'

export let playerTeam: tileColor

export async function joinTeam(team: tileColor, socket: WebSocket) {
  playerTeam = team

  if (team == tileColor.NEUTRAL) return
  if (team == tileColor.BLUE) {
    ui.displayAnnouncement(
      'Joined Blue Team',
      2,
      Color4.FromInts(0, 150, 200, 255)
    )
  } else if (team == tileColor.RED) {
    ui.displayAnnouncement(
      'Joined Red Team',
      2,
      Color4.FromInts(250, 75, 90, 255)
    )
  }

  socket.send(
    JSON.stringify({
      type: MessageType.JOIN,
      data: {
        team: team,
      },
    })
  )
}
