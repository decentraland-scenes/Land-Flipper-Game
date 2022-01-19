"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.MyRoomState = exports.Tile = exports.tileColor = exports.Player = void 0;
const schema_1 = require("@colyseus/schema");
class Player extends schema_1.Schema {
    constructor(playerId, name) {
        super();
        this.playerId = playerId;
        this.name = name;
    }
}
__decorate([
    schema_1.type('string')
], Player.prototype, "playerId", void 0);
__decorate([
    schema_1.type('string')
], Player.prototype, "name", void 0);
__decorate([
    schema_1.type('number')
], Player.prototype, "team", void 0);
__decorate([
    schema_1.type('boolean')
], Player.prototype, "ready", void 0);
exports.Player = Player;
var tileColor;
(function (tileColor) {
    tileColor[tileColor["NEUTRAL"] = 0] = "NEUTRAL";
    tileColor[tileColor["BLUE"] = 1] = "BLUE";
    tileColor[tileColor["RED"] = 2] = "RED";
})(tileColor = exports.tileColor || (exports.tileColor = {}));
class Tile extends schema_1.Schema {
}
__decorate([
    schema_1.type('number')
], Tile.prototype, "id", void 0);
__decorate([
    schema_1.type('number')
], Tile.prototype, "x", void 0);
__decorate([
    schema_1.type('number')
], Tile.prototype, "y", void 0);
__decorate([
    schema_1.type('number')
], Tile.prototype, "color", void 0);
exports.Tile = Tile;
class MyRoomState extends schema_1.Schema {
    constructor(rows = 14, cols = 14) {
        super();
        this.tiles = new schema_1.ArraySchema();
        this.players = new schema_1.MapSchema();
        this.active = false;
        for (let i = 0; i < rows; i++) {
            for (let j = 0; j < cols; j++) {
                this.tiles.push(new Tile().assign({
                    id: i * cols + j,
                    x: i,
                    y: j,
                    color: tileColor.NEUTRAL,
                }));
            }
        }
    }
}
__decorate([
    schema_1.type('boolean')
], MyRoomState.prototype, "active", void 0);
__decorate([
    schema_1.type('number')
], MyRoomState.prototype, "countdown", void 0);
__decorate([
    schema_1.type([Tile])
], MyRoomState.prototype, "tiles", void 0);
__decorate([
    schema_1.type({ map: Player })
], MyRoomState.prototype, "players", void 0);
exports.MyRoomState = MyRoomState;
