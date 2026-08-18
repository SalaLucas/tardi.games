import { joinMatch, sendToTable } from '@juxhouse/tardi-core/hand'
import { mountHand } from './shared/word-ui.js'

var state = null
var playerId = null
var update = mountHand(document.body, action)

// Keep a useful screen visible before the first state reaches this controller.
update(null, null)

joinMatch({ onStateChange: function (envelope) {
  playerId = envelope.playerId
  state = envelope.messageFromTable
  update(state, playerId)
} })

function action(message) {
  if (!state) return
  if (message.type === 'start' && state.phase === 'lobby') sendToTable({ start: true })
  if (message.type === 'restart' && state.phase === 'finished') sendToTable({ restart: true })
  if (message.type === 'word' && state.phase === 'playing' && state.players[state.turnIndex].playerId === playerId) sendToTable({ word: message.word })
}
