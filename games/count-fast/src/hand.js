import { joinMatch, sendToTable } from '@tardi/sdk/hand'
import { mountHand } from './shared/attention-ui.js'

var state = null, playerId = null, answer = ''
var update = mountHand(document.body, onKey)
joinMatch({ onStateChange: onStateChange })

function onStateChange(envelope) {
  playerId = envelope.playerId
  var previousRound = state && state.round, previousPhase = state && state.phase
  state = envelope.messageFromTable
  if (state && (state.round !== previousRound || state.phase !== previousPhase)) answer = ''
  update(state, playerId, answer)
}
function onKey(key) {
  if (!state) return
  if (state.phase === 'lobby') { if (key === 'easy' || key === 'medium' || key === 'hard') sendToTable({ difficulty: key }); return }
  if (state.phase === 'leaderboard') { if (key === 'lobby') sendToTable({ goToLobby: true }); return }
  if (state.phase !== 'answer' || state.submissions[playerId] !== undefined) return
  if (key === 'back') answer = answer.slice(0, -1)
  else if (key === 'send') { if (answer !== '') sendToTable({ answer: Number(answer) }) }
  else if (answer.length < 2) answer += key
  update(state, playerId, answer)
}
