import { joinMatch, sendToTable } from '@juxhouse/tardi-core/hand'
import { mountHand } from './shared/game-ui.js'

var state = null, playerId = null
var update = mountHand(document.body, action)
update(null, null)

joinMatch({ onStateChange: function (envelope) {
  playerId = envelope.playerId; state = envelope.messageFromTable; update(state, playerId)
} })

function action(message) {
  if (!state) return
  if (message.type === 'start' && state.phase === 'lobby') sendToTable({ start: true })
  else if (message.type === 'restart' && state.phase === 'finished') sendToTable({ restart: true })
  else if (message.type === 'ready' && state.phase === 'discussion') sendToTable({ ready: true })
  else if (message.type === 'target') sendToTable({ targetId: message.targetId })
}
