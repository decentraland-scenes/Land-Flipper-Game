# Land Flipper Game

A multiplayer game with websockets, where the game logic is carried out server-side.

![demo](https://github.com/decentraland-scenes/Land-Flipper-Game/blob/master/screenshots/land-flipper-game.gif)

This scene shows you:

- How to establish a websockets connection
- How to set up a websockets server with its own logic
- How to handle different types of websockets messages between players and server
- How to fetch a player's realm
- How to keep track of the game's state in the server, keeping each realm separate
- How to handle team formation, scoring and time limits from a websockets server


The server takes care of organizing players into teams and only starting a match when there are players on both sides.

Each scene runs its own calculations of the current remaining time and the scores of each team, but so does the server. In the end, the server has the final word about when the match is over and what is the final result.

## Try it out

**Install the CLI**

Download and install the Decentraland CLI by running the following command:

```
$ npm i -g decentraland
```

**Run the server locally**

```
$ cd server
$ npm start
```
NOTE: If this is your first time running the scene then you need to run `npm install` before `npm start`

**Run the scene**

Keep the server running, run the scene on a separate command line window:

```
$ cd scene
$ dcl start
```

**Scene Usage**


Open two separate browser windows, and direct one player to the Blue tile and another to the Red tile, so that there are players in both teams.

> Note: Because of a known issue with the scene preview, both players might end up with the same ID, and in that case the server will reject the second one's attempt to join a team, claiming that it is already joined. To prevent this, make sure you keep the loading of both instances of the game a couple of minutes apart, that seems to ensure they don't use the same ID.


Learn more about how to build your own scenes in our [documentation](https://docs.decentraland.org/) site.

If something doesn’t work, please [file an issue](https://github.com/decentraland-scenes/Awesome-Repository/issues/new).

## Copyright info

This scene is protected with a standard Apache 2 licence. See the terms and conditions in the [LICENSE](/LICENSE) file.