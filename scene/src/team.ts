import * as ui from '@dcl/ui-scene-utils'
import { tileColor } from './entities/Tile'
import { Room } from 'colyseus.js'

export let playerTeam: tileColor

export async function joinTeam(team: tileColor, room: Room) {
  playerTeam = team

  if (team == tileColor.NEUTRAL) return

  if (room.state.active) return

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

  room.send('join-team', {
    team: team,
  })

  // TODO:  add proper READY button

  let readyButton = new ui.MediumIcon('images/ready.png', -50, 200, 160, 84, {
    sourceHeight: 168,
    sourceWidth: 320,
  })
  readyButton.image.onClick = new OnClick(() => {
    room.send('ready')

    readyButton.hide()
  })
}
