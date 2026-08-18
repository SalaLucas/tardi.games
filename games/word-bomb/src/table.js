import { startMatch, sendToAllHands, endMatch } from '@juxhouse/tardi-core/table'
import { isValidWord, nextPair, normalizeWord } from './shared/word-rules.js'
import { mountTable } from './shared/word-ui.js'

var players = []
var state = initialState()
var update = mountTable(document.body)
var timeout = null

startMatch({ onMessage: onMessage, onPlayersChange: onPlayersChange })
// Show the lobby immediately. The development harness sends its player list
// just after the iframe loads, but the table should never appear blank while
// that handshake is still in flight.
publish()

function initialState() { return { phase: 'lobby', lives: {}, turnIndex: 0, pair: '', usedWords: [], message: '' } }

function onPlayersChange(info) {
  players = info.players
  syncLives()
  if (state.phase === 'playing' && alivePlayers().length < 2) finishGame()
  else publish()
}

function onMessage(envelope) {
  var message = envelope.messageFromHand || {}
  if (!playerById(envelope.playerId)) return
  if (state.phase === 'lobby' && message.start) { startGame(); return }
  if (state.phase === 'finished' && message.restart) { clearTimers(); state = initialState(); syncLives(); publish(); return }
  if (state.phase !== 'playing' || currentPlayerId() !== envelope.playerId || !message.word) return
  submitWord(envelope.playerId, message.word)
}

function startGame() {
  if (players.length < 2) return
  clearTimers()
  state = initialState()
  syncLives()
  state.phase = 'playing'
  state.turnIndex = 0
  beginTurn('')
}

function beginTurn(message) {
  clearTimeout(timeout)
  state.pair = nextPair()
  state.message = message
  state.deadline = Date.now() + 10000
  publish()
  timeout = setTimeout(function () { loseLife('Tempo esgotado!') }, 10020)
}

function submitWord(playerId, rawWord) {
  var word = normalizeWord(rawWord)
  if (word.indexOf(state.pair) === -1) { state.message = 'A palavra precisa conter “' + state.pair.toUpperCase() + '”.'; publish(); return }
  if (!isValidWord(word)) { state.message = 'Essa palavra não está no dicionário.'; publish(); return }
  if (state.usedWords.indexOf(word) !== -1) { state.message = 'Essa palavra já foi usada.'; publish(); return }
  state.usedWords.push(word)
  advanceTurn((playerById(playerId).nick || 'Jogador') + ' encontrou “' + rawWord.trim() + '”!')
}

function loseLife(message) {
  if (state.phase !== 'playing') return
  var id = currentPlayerId()
  state.lives[id] = Math.max(0, state.lives[id] - 1)
  if (alivePlayers().length <= 1) { finishGame(message); return }
  advanceTurn((playerById(id).nick || 'Jogador') + ' perdeu uma vida — ' + message)
}

function advanceTurn(message) {
  var current = currentPlayerId(), next = nextAliveIndex(current)
  state.turnIndex = next
  beginTurn(message)
}

function finishGame(message) {
  clearTimers()
  state.phase = 'finished'
  state.message = message || 'Fim de jogo!'
  state.winnerId = alivePlayers().length === 1 ? alivePlayers()[0].playerId : null
  publish()
  setTimeout(function () { endMatch({ victor: state.winnerId }) }, 7000)
}

function syncLives() { for (var i = 0; i < players.length; i++) if (state.lives[players[i].playerId] === undefined) state.lives[players[i].playerId] = 3 }
function alivePlayers() { return players.filter(function (player) { return state.lives[player.playerId] > 0 }) }
function currentPlayerId() { return players[state.turnIndex] && players[state.turnIndex].playerId }
function nextAliveIndex(currentId) { var start = 0, i; for (i = 0; i < players.length; i++) if (players[i].playerId === currentId) start = i; for (i = 1; i <= players.length; i++) { var index = (start + i) % players.length; if (state.lives[players[index].playerId] > 0) return index } return start }
function playerById(id) { return players.filter(function (player) { return player.playerId === id })[0] }
function clearTimers() { clearTimeout(timeout); timeout = null }
function publish() { state.players = players; state.secondsLeft = state.deadline ? Math.max(0, Math.ceil((state.deadline - Date.now()) / 1000)) : null; update(state); sendToAllHands(state) }
