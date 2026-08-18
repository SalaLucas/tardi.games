# 🎲 Creating a Tardi Game 👾

Hi! You can create your own Tardi games!

If you haven't played some games on [tardi.games](tardi.games) yet, go there now and play a few. Your life as a Tardi game developer will be much easier. 😉


## Basic Concepts

A Tardi game is a turn-based or light-action game. Avoid heavy action, for a better player experience.

- **Tardi** - The tardi.games platform, where your game will run.
- **Table** - The part of your game that runs on a big TV or similar device, visible to everyone in the room. The "Table" is a view-only display. Users do not interact with it.
- **Hand** - The part of your game that runs on a player's handheld device, like a phone or tablet. The "Hand" is the player's game controller.

Tardi makes it easy for the Table and Hand parts of your game to send messages to each other (see below).


## Creating a Game

#### 1) Fork this repo

[Fork this repo](https://github.com/juxhouse/tardi.games/fork) to your account.

> [!IMPORTANT]
> Do not rename the repo. It must be called `{your-account}/tardi.games`.

Clone it locally.


#### 2) Rename the example game

Inside `games`, rename the `tic-tac-toe` folder to the name of your game. Use only lowercase a-z, digits and dashes.


#### 3) Build It!

Just tell your coding agent how you want your game.

To play it in dev mode:

`npm run dev`

![Game example in dev mode](example.png)

Dev mode will open your game Table with 2 Hands already connected.


#### 4) Play with your friends

The Tardi platform will automatically detect changes and deploy the games in the `main` branch of your `tardi.games` repo. This takes a couple of minutes.

When choosing a game to play on https://tardi.games you can search for your github account and/or game name.

Call your friends! Have fun!
