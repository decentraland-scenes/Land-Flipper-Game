import { tileColor } from "./tiles"
import { setUIMessage } from "./ui"
import { getUserData } from "@decentraland/Identity"
import { messageType } from "./messaging"

export let playerTeam: tileColor

export let playerId: string = ""

export async function getUserId() {
  let userData = await getUserData()
  return userData.displayName
}

export async function joinTeam(team: tileColor, socket: WebSocket) {
  if (playerId == "") {
    playerId = await getUserId()
  }

  playerTeam = team

  if (team == tileColor.NEUTRAL) return
  if (team == tileColor.BLUE) {
    setUIMessage("Joined Blue Team", 2000, Color4.FromInts(0, 150, 200, 255))
  } else if (team == tileColor.RED) {
    setUIMessage("Joined Red Team", 2000, Color4.FromInts(250, 75, 90, 255))
  }

  socket.send(
    JSON.stringify({
      type: messageType.JOIN,
      id: playerId,
      team: team,
    })
  )
}
