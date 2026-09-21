import { startMatch, sendToAllHands } from '@juxhouse/tardi-core/table'
import { mountTable } from './shared/attention-ui.js'

var ITEMS = ['🍋', '🍓', '🍇', '🍒', '⭐', '💎', '🎈', '🟣']
var players = []
var state = { phase: 'lobby', round: 0, scores: {}, submissions: {}, difficulty: null }
var update = mountTable(document.body)
var timer = null

startMatch({ onMessage: onMessage, onPlayersChange: onPlayersChange })

function onPlayersChange(info) { players = info.players; syncScores(); publish() }

function onMessage(envelope) {
  var message = envelope.messageFromHand || {}
  if (!playerById(envelope.playerId)) return
  if (state.phase === 'lobby' && validDifficulty(message.difficulty)) {
    state.difficulty = message.difficulty; state.round = 0; state.scores = {}; syncScores(); startRound(); return
  }
  if (state.phase === 'leaderboard' && message.goToLobby) {
    clearTimeout(timer)
    state = { phase: 'lobby', round: 0, scores: {}, submissions: {}, difficulty: null }
    syncScores(); publish(); return
  }
  var answer = message.answer
  if (state.phase !== 'answer' || typeof answer !== 'number') return
  if (answer < 0 || answer > 99 || Math.floor(answer) !== answer) return
  if (state.submissions[envelope.playerId] !== undefined) return
  state.submissions[envelope.playerId] = answer
  publish()
  if (allAnswered()) showResults()
}

function startRound() {
  clearTimeout(timer)
  state.round += 1; state.target = ITEMS[Math.floor(Math.random() * ITEMS.length)]
  state.targetCount = 4 + Math.floor(Math.random() * 6); state.scene = makeScene(state.target, state.targetCount)
  state.submissions = {}; state.phase = 'reveal'; publish()
  timer = setTimeout(function () {
    state.phase = 'observe'; publish()
    timer = setTimeout(function () { state.phase = 'answer'; publish(); timer = setTimeout(showResults, 12000) }, 9000)
  }, 3000)
}

function showResults() {
  if (state.phase !== 'answer') return
  clearTimeout(timer)
  for (var i = 0; i < players.length; i++) {
    var id = players[i].playerId
    if (state.submissions[id] === state.targetCount) state.scores[id] += 1
  }
  state.phase = 'results'; publish()
  timer = setTimeout(state.round >= 5 ? showLeaderboard : startRound, 5500)
}

function showLeaderboard() { state.phase = 'leaderboard'; publish() }

function makeScene(target, targetCount) {
  var total = 48 + Math.floor(Math.random() * 13), scene = [], i
  for (i = 0; i < targetCount; i++) scene.push(makeItem(target))
  for (; i < total; i++) { var icon = ITEMS[Math.floor(Math.random() * ITEMS.length)]; while (icon === target) icon = ITEMS[Math.floor(Math.random() * ITEMS.length)]; scene.push(makeItem(icon)) }
  return scene
}

function makeItem(icon) {
  var speed = speedFor(state.difficulty)
  return { icon: icon, x: 4 + Math.random() * 88, y: 5 + Math.random() * 82,
    vx: (Math.random() < .5 ? -1 : 1) * (speed.xMin + Math.random() * speed.xRange),
    vy: (Math.random() < .5 ? -1 : 1) * (speed.yMin + Math.random() * speed.yRange),
    size: 3.4 + Math.random() * 3.1, spin: Math.random() * 360 }
}

function speedFor(difficulty) {
  if (difficulty === 'easy') return { xMin: .07, xRange: .18, yMin: .06, yRange: .16 }
  if (difficulty === 'hard') return { xMin: .28, xRange: .66, yMin: .24, yRange: .58 }
  return { xMin: .14, xRange: .36, yMin: .12, yRange: .32 }
}

function publish() {
  // The table renderer needs player names to build the final leaderboard.
  state.players = players
  update(state, players)
  sendToAllHands({ phase: state.phase, round: state.round, difficulty: state.difficulty, target: state.target,
    targetCount: state.targetCount, scores: state.scores, submissions: state.submissions, players: players })
}
function syncScores() { for (var i = 0; i < players.length; i++) if (state.scores[players[i].playerId] === undefined) state.scores[players[i].playerId] = 0 }
function allAnswered() { return players.length > 0 && Object.keys(state.submissions).length >= players.length }
function playerById(id) { for (var i = 0; i < players.length; i++) if (players[i].playerId === id) return players[i]; return null }
function validDifficulty(value) { return value === 'easy' || value === 'medium' || value === 'hard' }
