import * as WebSocket from 'ws'

const wss = new WebSocket.Server({ port: 13370 })

interface customWs extends WebSocket {
  room: string
}

export enum messageType {
  JOIN,
  TILEFLIP,
  NEWGAME,
  END,
  MESSAGE,
  SYNC,
}

export enum tileColor {
  NEUTRAL,
  BLUE,
  RED,
}

class Player extends Object {
  id: string
  team: tileColor
  constructor(id: string, team: tileColor) {
    super()
    ;(this.id = id), (this.team = team)
  }
}

let gameDuration: number = 60

// data per each room
export class roomData {
  gameActive: boolean = false
  blueTeam: Player[] = []
  redTeam: Player[] = []
  tiles: number[] = new Array(14 * 14).fill(null)
  // TODO add time remaining
}

interface roomDictionary {
  [index: string]: roomData
}
var rooms = {} as roomDictionary

wss.on('connection', (clientWs, request) => {
  const ws = clientWs as customWs
  ws.room = request.url || ''

  ws.on('message', function incoming(message) {
    const msg = JSON.parse(message.toString())
    console.log(msg)

    if (!rooms[ws.room]) {
      rooms[ws.room] = new roomData()
    }

    let room = rooms[ws.room]

    // player joining a team
    if (msg.type == messageType.JOIN) {
      if (room.gameActive == true) {
        console.log('player denied, game in progress')
        ws.send(
          JSON.stringify({
            type: messageType.MESSAGE,
            text: 'Game already active',
          })
        )
        return
      } else if (checkAlredyInTeams(msg.id, ws.room) == true) {
        console.log(
          'player denied, already playing: ',
          msg.id,
          ' existing in teams: ',
          room.blueTeam,
          room.redTeam
        )
        ws.send(
          JSON.stringify({
            type: messageType.MESSAGE,
            text: 'You already belong to a team',
          })
        )
        return
      } else {
        let newPlayer = new Player(msg.id, msg.team)
        if (msg.team == tileColor.BLUE) {
          room.blueTeam.push(newPlayer)
          console.log(msg.id, ' joined the blue team')
        } else {
          room.redTeam.push(newPlayer)
          console.log(msg.id, ' joined the red team')
        }

        // with players on both teams, start new game
        if (room.blueTeam.length > 0 && room.redTeam.length > 0) {
          newGame(ws.room)
          console.log('new game starting! with ', room.blueTeam, room.redTeam)
        } else {
          JSON.stringify({
            type: messageType.MESSAGE,
            text: 'Waiting for an opponent',
          })
        }
      }
    } else if (msg.type == messageType.TILEFLIP) {
      if (room.gameActive) {
        room.tiles[msg.tile] = msg.color
        sendAll(message, ws.room)
      }
    } else if (msg.type == messageType.SYNC) {
      ws.send(
        JSON.stringify({
          type: messageType.SYNC,
          gameActive: room.gameActive,
          tiles: room.tiles,
        })
      )
    }
  })
})

wss.once('listening', () => {
  console.log('Listening on port 13370')
})

export async function sendAll(message: WebSocket.Data, room: string) {
  wss.clients.forEach(function each(client) {
    const cWs = client as customWs
    try {
      if (cWs.readyState === WebSocket.OPEN && cWs.room === room) {
        cWs.send(message)
      }
    } catch {
      console.log("couldn't send to a user")
    }
  })
}

export async function newGame(room: string) {
  sendAll(
    JSON.stringify({ type: messageType.MESSAGE, text: 'New Game in 3' }),
    room
  )
  setTimeout(function () {
    sendAll(
      JSON.stringify({ type: messageType.MESSAGE, text: 'New Game in 2' }),
      room
    )
  }, 2000)
  setTimeout(function () {
    sendAll(
      JSON.stringify({ type: messageType.MESSAGE, text: 'New Game in 1' }),
      room
    )
  }, 4000)

  setTimeout(function () {
    rooms[room].gameActive = true
    sendAll(
      JSON.stringify({ type: messageType.NEWGAME, duration: gameDuration }),
      room
    )

    setTimeout(function () {
      endGame(room)
    }, gameDuration * 1000)
  }, 6000)
}

export async function endGame(room: string) {
  rooms[room].gameActive = false
  rooms[room].blueTeam = []
  rooms[room].redTeam = []
  let blueScore = 0
  let redScore = 0

  for (let i = 0; i < rooms[room].tiles.length; i++) {
    if (rooms[room].tiles[i] == tileColor.BLUE) {
      blueScore += 1
    } else if (rooms[room].tiles[i] == tileColor.RED) {
      redScore += 1
    }
  }
  sendAll(
    JSON.stringify({ type: messageType.END, blue: blueScore, red: redScore }),
    room
  )
  rooms[room].tiles = new Array(14 * 14).fill(null)
}

export async function resetGame(room: string) {
  rooms[room].gameActive = false
  rooms[room].blueTeam = []
  rooms[room].redTeam = []
}

export function checkAlredyInTeams(player: string, room: string) {
  for (let i = 0; i < rooms[room].blueTeam.length; i++) {
    if (rooms[room].blueTeam[i].id == player) {
      return true
    }
  }
  for (let i = 0; i < rooms[room].redTeam.length; i++) {
    if (rooms[room].redTeam[i].id == player) {
      return true
    }
  }

  return false
}
