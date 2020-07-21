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

// TODO: separate state & players for each room
let gameActive: boolean = false
let blueTeam: Player[] = []
let redTeam: Player[] = []
let tiles: number[] = new Array(14 * 14).fill(null)

wss.on('connection', (clientWs, request) => {
  const ws = clientWs as customWs
  ws.room = request.url || ''

  ws.on('message', function incoming(message) {
    const msg = JSON.parse(message.toString())
    console.log(msg)

    if (msg.type == messageType.JOIN) {
      if (gameActive == true) return
      // TODO check if ID already in team
      let newPlayer = new Player(msg.id, msg.team)
      if (msg.team == tileColor.BLUE) {
        blueTeam.push(newPlayer)
      } else {
        redTeam.push(newPlayer)
      }

      if (blueTeam.length > 0 && redTeam.length > 0) {
        newGame(ws.room)
      } else {
        JSON.stringify({
          type: messageType.MESSAGE,
          text: 'Waiting for an opponent',
        })
      }
    } else if (msg.type == messageType.TILEFLIP) {
      if (gameActive) {
        tiles[msg.tile] = msg.color
        sendAll(message, ws.room)
      }
    }
  })
})

wss.once('listening', () => {
  console.log('Listening on port 13370')
})

export async function sendAll(message: WebSocket.Data, room: string) {
  wss.clients.forEach(function each(client) {
    const cWs = client as customWs

    if (cWs.readyState === WebSocket.OPEN && cWs.room === room) {
      cWs.send(message)
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
  }, 1000)
  setTimeout(function () {
    sendAll(
      JSON.stringify({ type: messageType.MESSAGE, text: 'New Game in 1' }),
      room
    )
  }, 2000)

  setTimeout(function () {
    gameActive = true
    sendAll(
      JSON.stringify({ type: messageType.NEWGAME, duration: gameDuration }),
      room
    )

    setTimeout(function () {
      endGame(room)
    }, gameDuration * 1000)
  }, 3000)
}

export async function endGame(room: string) {
  gameActive = false
  blueTeam = []
  redTeam = []
  tiles = new Array(14 * 14).fill(null)
  let blueScore = 0
  let redScore = 0

  for (let i = 0; i < tiles.length; i++) {
    if (tiles[i] == tileColor.BLUE) {
      blueScore += 1
    } else if (tiles[i] == tileColor.RED) {
      redScore += 1
    }
  }
  sendAll(
    JSON.stringify({ type: messageType.END, blue: blueScore, red: redScore }),
    room
  )
}
