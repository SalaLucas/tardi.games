# Tardi.games Software Development Kit (SDK)

#### Project Files

```
game.json               # Describes your game. See below
package.json            # depends on @tardi/sdk and @tardi/build
assets/thumbnail.png    # 512x512 pixels.
src/                    # Your game source files go here.
  table.js              # Your Table entry point (required)
  hand.js               # Your Hand  entry point (required)
hand.js                 # Generated on build time.
table.js                # Generated on build time.
```

#### Running in Dev Mode

Run `npm run dev` and open your game in your browser.

#### Releasing

Run `npm run build`

It will read the sources and convert them to old Javascript, compatible with most old TV Browsers.

The files required by Tardi will be generated:
```
hand.js
table.js
```
Commit them to your `main` branch and push to Github. Every couple of minute, Tardi automatically detects commits to all public Github repos called `tardi.games` and releases them on https://tardi.games


#### game.json example

```
{
  "title": "My Special Game",
  "description": "A game of mystery and adventure for many players.",
  "players": {
    "min": 2,
    "max": 8
  },
}
```


## Responsiveness

Your game Table and Hand will run in their own iframe and must be 100% responsive.

- The Table will have landscape orientation, and must adapt to different iframe sizes.
- The Hand can have portrait or landscape orientation, and can also have different sizes.
- Font sizes, spacing, and game element sizes must adapt automatically.
- Do not assume a fixed viewport size, fixed aspect ratio, or a specific phone model.
- Make sure important game elements never end up off-screen or crammed.


#### Writing and building your game

`src/table.js` and `src/hand.js` are your entry points. Write them in modern
JavaScript — `import`, classes, arrow functions — and put any rules or UI that
both sides need in `src/shared/`.

`npm run build` bundles each entry into a single `hand.js` / `table.js` that
runs on old TV browsers. You write modern code; the build makes it compatible.

Import the SDK from your entry points (no globals are injected):

```js
// src/table.js
import { startMatch, sendToAllHands, endMatch } from '@tardi/sdk/table'

// src/hand.js
import { joinMatch, sendToTable } from '@tardi/sdk/hand'
```

Test locally with `npm run dev`: it serves one table and two hands wired
together like the platform, with no extra setup.


## Coding the Game Table

#### Starting the Match (Table)

Your Table starts the match passing the `onMessage` and `onPlayersChange` callback functions:

`startMatch({onMessage, onPlayersChange});`


#### Receiving Player Info (Table)

The `onPlayersChange` function, passed above, will receive:

```js
{
  players: [  // An array of the players that are in this match. Not null.
    {playerId: 42, nick: "Happy Otter"},  // All keys are not null.
    {playerId: 43, nick: "Crazy Monkey"}
    ]
}
```


#### Receiving Messages (Table)

The `onMessage` function, passed above, will receive:

```js
{
  playerId: 42            // The player holding the Hand that sent the message.
  messageFromHand: {...}  // Not null
}
```

On receiving a message from a Hand, your Table will typically calculate the new game state and broadcast it to all Hands.


#### Broadcasting Game State

Your Table can broadcast the same message (typically the entire game state) to all Hands like this:

```js
sendToAllHands(message)  // Send any JS object you want.
```



## Coding the Game Hand

#### Joining the Match (Hand)

Your Hand joins the match by calling:

```js
joinMatch({onStateChange});
```


#### Receiving Game State

Your Hand's `onStateChange` function, above, will receive:

```js
{
  playerId: 42  // The id of the player holding this Hand. Not null.
  players: [    // An array of the players in this match. Not null.
    {playerId: 42, nick: "Happy Otter"},  // All keys are not null.
    {playerId: 43, nick: "Crazy Monkey"}
    ]
  messageFromTable: {...}  // The last message sent by the Table (typically the entire game state).
                           // Can be null if the Table has not yet sent any state or if the Table sent null.
}
```

That should be enough for your Hand to render its player's view. That means your Hand can be stateless, if you like. 😉

The Hand must consider the game started only after it receives the first message from the Table.


#### Sending Player Actions

Your Hand can send messages (typically its player's actions) to the Table:

```js
sendToTable(message)  // Send any object you want.
```

Your Hand can send messages only after it has received the first Table state, above. Any message sent before that will be ignored.


## Ending the Match

The Table ends the match:

```js
endMatch({
  victor: 42  // The playerId of the winning player. Null means it was a draw
});
```


## Consistency Guarantees

In case you're curious:

- The Table is guaranteed to receive ALL messages sent by a Hand after the game has started, in correct order and without duplicates, even if they get temporarily disconnected.

- A Hand might not receive some messages sent by the Table, but it is guaranteed to receive the MOST RECENT one.

- A Hand only receives messages that were produced by the Table AFTER the Table has received ALL messages sent by that Hand.
