"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.MyRoom = void 0;
const colyseus_1 = require("colyseus");
const MyRoomState_1 = require("./MyRoomState");
const ROUND_DURATION = 60;
// const ROUND_DURATION = 30;
// const MAX_BLOCK_HEIGHT = 5;
class MyRoom extends colyseus_1.Room {
    constructor() {
        super(...arguments);
        this.currentHeight = 0;
        this.isFinished = false;
    }
    onCreate(options) {
        this.setState(new MyRoomState_1.MyRoomState());
        // this.setPatchRate(33)  > 30 fps   (default 20 fps)
        console.log('The board has ', this.state.tiles.length, ' tiles');
        // set-up the game!
        this.reset();
        this.onMessage('join', (client, atIndex) => {
            // set player new position
            const player = this.state.players.get(client.sessionId);
        });
        this.onMessage('flip-tile', (client, data) => {
            let isPlayerIn = false;
            let color = MyRoomState_1.tileColor.NEUTRAL;
            this.state.players.forEach((player) => {
                if (player.name == this.state.players.get(client.sessionId).name) {
                    color = player.team;
                    isPlayerIn = true;
                }
            });
            if (isPlayerIn == false) {
                console.log('player ', this.state.players.get(client.sessionId).name, ' not playing ');
                return;
            }
            this.state.tiles.forEach((tile) => {
                if (tile.x == data.position.i && tile.y == data.position.j) {
                    tile.assign({ color: color });
                    //tile.color = color
                    console.log('flipping tile ', data.position.i, data.position.j, ' to ', color);
                }
            });
            // this.broadcast("flip-tile", {pos:atPosition , color: color});
        });
        this.onMessage('join-team', (client, data) => {
            const player = this.state.players.get(client.sessionId);
            if (player.team == data.team) {
                return;
            }
            player.team = data.team;
            console.log(player.name, 'joined team! => ', data.team);
        });
        this.onMessage('ready', (client) => {
            const player = this.state.players.get(client.sessionId);
            player.ready = true;
            let bluePlayers = 0;
            let redPlayers = 0;
            let readyPlayers = 0;
            this.state.players.forEach((player) => {
                if (player.team == MyRoomState_1.tileColor.RED) {
                    redPlayers += 1;
                }
                else if (player.team == MyRoomState_1.tileColor.BLUE) {
                    bluePlayers += 1;
                }
                if (player.ready) {
                    readyPlayers += 1;
                }
                else {
                    client.send('msg', { text: 'Please set yourself as READY' });
                }
            });
            console.log('BLUE PLAYERS: ', bluePlayers, ' RED PLAYERS: ', redPlayers);
            if (bluePlayers > 0 &&
                redPlayers > 0 &&
                readyPlayers >= bluePlayers + redPlayers) {
                this.setUp();
                console.log('New game starting! ');
            }
            else {
                this.broadcast('msg', { text: 'Waiting for an opponent' });
            }
        });
    }
    setUp() {
        for (let tile of this.state.tiles) {
            tile.color = MyRoomState_1.tileColor.NEUTRAL;
        }
        this.isFinished = false;
        this.broadcast('msg', { text: 'Game starts in ...' });
        this.state.countdown = 3;
        // make sure we clear previous interval
        this.clock.clear();
        this.clock.setTimeout(() => {
            this.broadcast('msg', { text: '3' });
        }, 2000);
        this.clock.setTimeout(() => {
            this.broadcast('msg', { text: '2' });
        }, 4000);
        this.clock.setTimeout(() => {
            this.broadcast('msg', { text: '1' });
        }, 6000);
        this.clock.setTimeout(() => {
            this.startGame();
        }, 8000);
    }
    startGame() {
        this.broadcast('new', { duration: ROUND_DURATION });
        this.state.active = true;
        // setup round countdown
        this.state.countdown = ROUND_DURATION;
        // make sure we clear previous interval
        this.clock.clear();
        this.clock.setInterval(() => {
            if (this.state.countdown > 0) {
                if (!this.isFinished) {
                    this.state.countdown--;
                }
            }
            else {
                // countdown reached zero! end the game!
                this.end();
                this.clock.clear();
            }
        }, 1000);
    }
    end() {
        this.state.active = false;
        this.isFinished = true;
        let blueScore = 0;
        let redScore = 0;
        for (let tile of this.state.tiles) {
            if (tile.color == MyRoomState_1.tileColor.BLUE) {
                blueScore += 1;
            }
            else if (tile.color == MyRoomState_1.tileColor.RED) {
                redScore += 1;
            }
        }
        this.state.players.forEach((player) => {
            player.team = MyRoomState_1.tileColor.NEUTRAL;
            player.ready = false;
        });
        console.log('FINISHED GAME in room ', this.roomName, ' Blue: ', blueScore, ' Red ', redScore, 'FINAL RESULT '
        //this.state.tiles
        );
        this.broadcast('end', { blue: blueScore, red: redScore });
        // reset after 10 seconds
        this.clock.setTimeout(() => {
            this.reset();
            this.broadcast('reset');
        }, 10000);
    }
    reset() {
        this.state.active = false;
        this.state.players.forEach((player) => {
            player.team = MyRoomState_1.tileColor.NEUTRAL;
            player.ready = false;
        });
        this.state.players.clear();
        this.state.tiles.forEach((tile) => {
            tile.color = MyRoomState_1.tileColor.NEUTRAL;
        });
    }
    onJoin(client, options) {
        const newPlayer = new MyRoomState_1.Player(options.userData.userId, options.userData.displayName || 'Anonymous');
        this.state.players.set(client.sessionId, newPlayer);
        console.log(newPlayer.name, 'joined! => ', options.userData);
    }
    onLeave(client, consented) {
        const player = this.state.players.get(client.sessionId);
        console.log(player.name, 'left!');
        this.state.players.delete(client.sessionId);
    }
    onDispose() {
        console.log('Disposing room...');
    }
}
exports.MyRoom = MyRoom;
