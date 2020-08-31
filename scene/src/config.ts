// use server in localhost or on the web
const local: boolean = false

const server = local
  ? 'ws://localhost:8080'
  : 'wss://165-232-67-9.nip.io/broadcast/'

const GRIDX = 14
const GRIDZ = 14

const TILE_SIZE = 42 / GRIDX
const GAP_BETWEEN_TILES = 0

const xOffset = 2.5
const zOffset = 2.5
