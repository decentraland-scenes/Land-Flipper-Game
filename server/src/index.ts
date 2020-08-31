import * as WebSocket from 'ws'
import {
  roomDictionary,
  MessageType,
  roomData,
  tileColor,
  Player,
} from './types'

const wss = new WebSocket.Server({ port: 13370 })

let gameDuration: number = 60

var rooms = {} as roomDictionary

interface customWs extends WebSocket {
  room: string
}

var CLIENTS: customWs[] = []

wss.once('listening', () => {
  console.log('Listening on port 13370')
})

wss.on('connection', (clientWs, request) => {
  const ws = clientWs as customWs
  ws.room = request.url || ''

  let id = Math.random()
  console.log('connection is established : ' + id)
  CLIENTS[id] = ws
  CLIENTS.push(ws)

  ws.on('message', function incoming(message) {
    const msg = JSON.parse(message.toString())
    console.log(msg)

    if (!rooms[ws.room]) {
      rooms[ws.room] = new roomData()
    }

    let room = rooms[ws.room]

    let incomingMessageType = msg.type

    switch (incomingMessageType) {
      // PLAYER JOIN
      case MessageType.JOIN:
        if (room.gameActive == true) {
          console.log('Player denied, game in progress')
          ws.send(
            JSON.stringify({
              type: MessageType.MESSAGE,
              data: {
                text: 'Game in progress',
              },
            })
          )
          return
        } else if (checkAlredyInTeams(id, ws.room) == true) {
          console.log(
            'Player denied, already playing: ',
            msg.data.sender,
            ' existing in teams: ',
            room.blueTeam,
            room.redTeam
          )
          ws.send(
            JSON.stringify({
              type: MessageType.MESSAGE,
              data: { text: 'You are already on a team' },
            })
          )
          return
        } else {
          playerJoin(id, msg, room, ws.room)
        }
        break
      // TILE CHANGE
      case 'Board-singleChange':
        if (room.gameActive) {
          room.tiles[msg.data.position.i][msg.data.position.j] = msg.data.color
          sendAll(message, ws.room)
          //console.log('Board changed ', room.tiles)
        } else {
          console.log('no change bc room inactive')
        }
        break
      // REQUEST SYNC
      case 'Board-fullStateReq':
        ws.send(
          JSON.stringify({
            type: 'Board-fullStateRes',
            data: {
              active: room.gameActive,
              tiles: room.tiles,
              timeleft: 60,
            },
          })
          // TODO add timeLeft  & maybe blue & red score
        )
        break
    }
    ws.on('close', function () {
      console.log('user ' + id + ' left game')
      delete CLIENTS[id]
      removeFromTeams(id, room)
    })
  })
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

export async function sendAllOthers(
  message: WebSocket.Data,
  room: string,
  socketId: number
) {
  wss.clients.forEach(function each(client) {
    const cWs = client as customWs
    if (CLIENTS[socketId] !== cWs) {
      try {
        if (cWs.readyState === WebSocket.OPEN && cWs.room === room) {
          cWs.send(message)
        }
      } catch {
        console.log("couldn't send to a user")
      }
    }
  })
}

export async function newGame(room: string) {
  sendAll(
    JSON.stringify({
      type: MessageType.MESSAGE,
      data: { text: 'Game Starts in...' },
    }),
    room
  )
  setTimeout(function () {
    sendAll(
      JSON.stringify({ type: MessageType.MESSAGE, data: { text: '3' } }),
      room
    )
  }, 2000)
  setTimeout(function () {
    sendAll(
      JSON.stringify({ type: MessageType.MESSAGE, data: { text: '2' } }),
      room
    )
  }, 4000)
  setTimeout(function () {
    sendAll(
      JSON.stringify({ type: MessageType.MESSAGE, data: { text: '1' } }),
      room
    )
  }, 6000)
  setTimeout(function () {
    sendAll(
      JSON.stringify({ type: MessageType.MESSAGE, data: { text: 'GO' } }),
      room
    )
  }, 8000)

  setTimeout(function () {
    rooms[room].gameActive = true
    sendAll(
      JSON.stringify({
        type: MessageType.NEWGAME,
        data: { duration: gameDuration },
      }),
      room
    )

    setTimeout(function () {
      endGame(room)
    }, gameDuration * 1000)
  }, 8000)
}

export async function endGame(room: string) {
  rooms[room].gameActive = false
  rooms[room].blueTeam = []
  rooms[room].redTeam = []
  let blueScore = 0
  let redScore = 0

  console.log('FINAL RESULT ', rooms[room].tiles)

  for (let i = 0; i < rooms[room].tiles.length; i++) {
    for (let j = 0; j < rooms[room].tiles[i].length; j++) {
      if (rooms[room].tiles[i][j] == tileColor.BLUE) {
        blueScore += 1
      } else if (rooms[room].tiles[i][j] == tileColor.RED) {
        redScore += 1
      }
    }
  }
  sendAll(
    JSON.stringify({
      type: MessageType.END,
      data: { blue: blueScore, red: redScore },
    }),
    room
  )
  rooms[room].tiles = new Array(14 * 14).fill(null)

  console.log(
    'FINISHED GAME in room ',
    room,
    ' Blue: ',
    blueScore,
    ' Red ',
    redScore
  )
}

export async function resetGame(room: string) {
  rooms[room].gameActive = false
  rooms[room].blueTeam = []
  rooms[room].redTeam = []
}

export async function playerJoin(
  id: number,
  msg: any,
  room: roomData,
  roomName: string
) {
  let newPlayer = new Player(id, msg.data.team)
  if (msg.data.team == tileColor.BLUE) {
    room.blueTeam.push(newPlayer)
    console.log(msg.data.sender, ' joined the blue team')
  } else {
    room.redTeam.push(newPlayer)
    console.log(msg.data.sender, ' joined the red team')
  }

  // with players on both teams, start new game
  if (room.blueTeam.length > 0 && room.redTeam.length > 0) {
    newGame(roomName)
    console.log('New game starting! with ', room.blueTeam, room.redTeam)
  } else {
    JSON.stringify({
      type: MessageType.MESSAGE,
      data: {
        text: 'Waiting for an opponent',
      },
    })
  }
}

export function checkAlredyInTeams(player: number, room: string) {
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

export function removeFromTeams(player: number, room: roomData) {
  for (let i = 0; i < room.blueTeam.length; i++) {
    if (room.blueTeam[i].id == player) {
      room.blueTeam = room.blueTeam.splice(i, 1)
    }
  }
  for (let i = 0; i < room.redTeam.length; i++) {
    if (room.redTeam[i].id == player) {
      room.redTeam = room.redTeam.splice(i, 1)
    }
  }
}
