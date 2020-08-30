import { setTimeout } from '../Utils'
import { getCurrentRealm } from '@decentraland/EnvironmentAPI'

export let socket: WebSocket

export type MessageAction = { tag: string; action: (data) => void }

export let messageActions: MessageAction[] = []

export async function joinSocketsServer() {
  // Fetch realm data to keep players in different realms separate
  let realm = await getCurrentRealm()
  log('You are in the realm: ', realm.displayName)
  // Connect to ws server
  socket = await new WebSocket(server + '/' + realm.displayName)
  return
}

export async function startSocketListeners() {
  // Listen for incoming ws messages
  socket.onmessage = function (event) {
    try {
      const msg = JSON.parse(event.data)
      log(msg)

      for (let action of messageActions) {
        //log('checking match with ', action.tag, ' msg.type is: ', msg.type)
        if (msg.type == action.tag) {
          log('WSMESSAGE ', msg.type, ' : ', msg.data)
          action.action(msg.data)
        }
      }
    } catch (error) {
      log(error)
    }
  }
  return
}

export abstract class MultiplayerEntity<
  SingleChange,
  FullState
> extends Entity {
  private initialized: boolean = false

  constructor(private readonly entityType: string) {
    super()

    let change: MessageAction = {
      tag: this.generateMessageId(SINGLE_CHANGE_EVENT),
      action: (data) => {
        this.reactToSingleChanges(data)
      },
    }

    messageActions.push(change)
  }

  /** Request the full state from server, and load it */
  public start() {
    // Load the full state

    let getStateResponse: MessageAction = {
      tag: this.generateMessageId(FULL_STATE_RESPONSE),
      action: (data) => {
        if (!this.initialized) {
          this.initialized = true
          this.loadFullState(data)
        }
      },
    }

    messageActions.push(getStateResponse)

    // Request full state
    this.requestFullState()

    this.initialized = true
  }

  public propagateChange(change: SingleChange) {
    // Letting every else know
    socket.send(
      JSON.stringify({
        type: this.generateMessageId(SINGLE_CHANGE_EVENT),
        data: change,
      })
    )
  }

  private generateMessageId(messageName: string) {
    return `${this.entityType}-${messageName}`
  }

  private requestFullState() {
    if (!this.initialized) {
      socket.send(
        JSON.stringify({
          type: this.generateMessageId(FULL_STATE_REQUEST),
          data: null,
        })
      )

      //   setTimeout(1000, () => {
      //     this.requestFullState()
      //   })
    }
  }

  protected abstract reactToSingleChanges(change: SingleChange): void
  protected abstract loadFullState(fullState: FullState): void
}

const FULL_STATE_REQUEST = 'fullStateReq'
const FULL_STATE_RESPONSE = 'fullStateRes'
const SINGLE_CHANGE_EVENT = 'singleChange'
