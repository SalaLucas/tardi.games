import { startMatch, sendToAllHands, endMatch } from '@juxhouse/tardi-core/table'
import { ROLE, assignRoles, plurality, roleName, winningTeam } from './shared/game-rules.js'
import { mountTable } from './shared/game-ui.js'

var connected = [], participants = [], roles = {}, knowledge = {}, timer = null
var state = initialState(), update = mountTable(document.body)

startMatch({ onMessage: onMessage, onPlayersChange: onPlayersChange })

function initialState() { return { phase: 'lobby', night: 0, alive: {}, actions: {}, ready: {}, message: '', deadline: null, lastEliminated: null, winner: null } }

function onPlayersChange(info) {
  connected = info.players
  if (state.phase !== 'lobby' && state.phase !== 'finished') removeDisconnectedPlayers()
  publish()
}

function onMessage(envelope) {
  var id = envelope.playerId, message = envelope.messageFromHand || {}
  if (!connectedPlayer(id)) return
  if (state.phase === 'lobby' && message.start) { startGame(); return }
  if (state.phase === 'finished' && message.restart) { resetGame(); return }
  if (!state.alive[id]) return
  if (state.phase === 'night-angel' && roles[id] === ROLE.ANGEL) chooseAngel(id, message.targetId)
  else if (state.phase === 'night-assassin' && roles[id] === ROLE.ASSASSIN) chooseAssassin(id, message.targetId)
  else if (state.phase === 'night-detective' && roles[id] === ROLE.DETECTIVE) chooseDetective(id, message.targetId)
  else if (state.phase === 'discussion' && message.ready) { state.ready[id] = true; publish(); if (allAliveActed(state.ready)) startVote() }
  else if (state.phase === 'vote' && message.targetId) chooseVote(id, message.targetId)
}

function startGame() {
  if (connected.length < 5 || connected.length > 8) return
  clearTimer(); participants = connected.slice(); roles = assignRoles(participants); knowledge = {}
  state = initialState()
  for (var i = 0; i < participants.length; i++) { state.alive[participants[i].playerId] = true; knowledge[participants[i].playerId] = [] }
  startNight()
}

function resetGame() { clearTimer(); participants = []; roles = {}; knowledge = {}; state = initialState(); publish() }

function startNight() {
  clearTimer(); state.night += 1; state.actions = {}; state.ready = {}; state.lastEliminated = null; state.message = 'A cidade dorme. Todos fechem os olhos.'; state.deadline = null
  enterNightPhase('night-angel')
}

function enterNightPhase(phase) {
  state.phase = phase
  var neededRole = phase === 'night-angel' ? ROLE.ANGEL : phase === 'night-assassin' ? ROLE.ASSASSIN : ROLE.DETECTIVE
  if (!aliveIdsByRole(neededRole).length) { nextNightPhase(); return }
  state.message = phase === 'night-angel' ? 'Anjo, acorde e escolha quem proteger.' : phase === 'night-assassin' ? 'Assassinos, acordem e escolham uma vítima.' : 'Detetive, acorde e faça sua investigação.'
  publish()
}

function nextNightPhase() {
  if (state.phase === 'night-angel') enterNightPhase('night-assassin')
  else if (state.phase === 'night-assassin') enterNightPhase('night-detective')
  else resolveNight()
}

function chooseAngel(id, targetId) {
  if (!validAliveTarget(targetId) || state.actions.angel) return
  state.actions.angel = targetId; nextNightPhase()
}

function chooseAssassin(id, targetId) {
  if (!validAliveTarget(targetId) || roles[targetId] === ROLE.ASSASSIN || state.actions[id]) return
  state.actions[id] = targetId; publish()
  if (allRoleActed(ROLE.ASSASSIN)) { state.actions.assassin = plurality(roleActions(ROLE.ASSASSIN), aliveIdsExceptRole(ROLE.ASSASSIN), true); nextNightPhase() }
}

function chooseDetective(id, targetId) {
  if (!validAliveTarget(targetId) || targetId === id || state.actions.detective) return
  state.actions.detective = targetId
  knowledge[id].push({ night: state.night, playerId: targetId, isAssassin: roles[targetId] === ROLE.ASSASSIN })
  nextNightPhase()
}

function resolveNight() {
  var target = state.actions.assassin
  state.phase = 'dawn'; state.deadline = Date.now() + 5500
  if (target && target !== state.actions.angel) { state.alive[target] = false; state.lastEliminated = target; state.message = playerName(target) + ' não acordou.' }
  else if (target) state.message = 'O Anjo protegeu a cidade. Ninguém foi eliminado.'
  else state.message = 'A noite foi tranquila. Ninguém foi eliminado.'
  publish(); clearTimer(); timer = setTimeout(afterDawn, 5520)
}

function afterDawn() { if (finishIfWon()) return; startDiscussion() }

function startDiscussion() {
  clearTimer(); state.phase = 'discussion'; state.ready = {}; state.deadline = Date.now() + 45000; state.message = 'Conversem, desconfiem e defendam-se.'; publish()
  timer = setTimeout(startVote, 45020)
}

function startVote() {
  if (state.phase !== 'discussion') return
  clearTimer(); state.phase = 'vote'; state.actions = {}; state.deadline = Date.now() + 30000; state.message = 'A cidade decide quem será eliminado.'; publish()
  timer = setTimeout(resolveVote, 30020)
}

function chooseVote(id, targetId) {
  if (!validAliveTarget(targetId) || targetId === id || state.actions[id]) return
  state.actions[id] = targetId; publish(); if (allAliveActed(state.actions)) resolveVote()
}

function resolveVote() {
  if (state.phase !== 'vote') return
  clearTimer(); var target = plurality(state.actions, aliveIds(), false)
  state.phase = 'verdict'; state.deadline = Date.now() + 5500
  if (target) { state.alive[target] = false; state.lastEliminated = target; state.message = playerName(target) + ' foi escolhido pela cidade.' }
  else { state.lastEliminated = null; state.message = 'A votação empatou. Ninguém foi eliminado.' }
  publish(); timer = setTimeout(function () { if (!finishIfWon()) startNight() }, 5520)
}

function finishIfWon() {
  var winner = winningTeam(roles, state.alive)
  if (!winner) return false
  clearTimer(); state.phase = 'finished'; state.winner = winner; state.deadline = null
  state.message = winner === 'cidade' ? 'A cidade venceu!' : 'Os Assassinos dominaram a cidade!'
  publish()
  timer = setTimeout(function () { endMatch({ victor: firstWinnerId(winner) }) }, 7000)
  return true
}

function removeDisconnectedPlayers() {
  var changed = false, ids = participantIds(), i
  for (i = 0; i < ids.length; i++) if (state.alive[ids[i]] && !connectedPlayer(ids[i])) { state.alive[ids[i]] = false; changed = true }
  if (changed && !finishIfWon()) {
    if (state.phase.indexOf('night-') === 0) {
      var role = state.phase === 'night-angel' ? ROLE.ANGEL : state.phase === 'night-assassin' ? ROLE.ASSASSIN : ROLE.DETECTIVE
      if (!aliveIdsByRole(role).length || (role === ROLE.ASSASSIN && allRoleActed(role))) nextNightPhase()
    } else if (state.phase === 'discussion' && allAliveActed(state.ready)) startVote()
    else if (state.phase === 'vote' && allAliveActed(state.actions)) resolveVote()
  }
}

function publish() {
  var showSubmissions = state.phase === 'night-assassin' || state.phase === 'vote'
  var view = { phase: state.phase, night: state.night, alive: state.alive, message: state.message, deadline: state.deadline, lastEliminated: state.lastEliminated, winner: state.winner, players: visiblePlayers(), submitted: showSubmissions ? submittedMap() : {}, ready: state.ready, privateViews: privateViews() }
  update(view); sendToAllHands(view)
}

function privateViews() {
  var views = {}, ids = participantIds(), i, id, role, teammates
  for (i = 0; i < ids.length; i++) { id = ids[i]; role = roles[id]; teammates = []
    if (role === ROLE.ASSASSIN) teammates = aliveIdsByRole(ROLE.ASSASSIN).filter(function (other) { return other !== id })
    views[id] = { role: role, roleName: roleName(role), investigations: knowledge[id] || [], teammates: teammates }
  }
  return views
}

function submittedMap() { var result = {}, id; for (id in state.actions) if (participantById(id)) result[id] = true; return result }
function visiblePlayers() { return state.phase === 'lobby' || state.phase === 'finished' ? connected.slice() : participants.slice() }
function participantIds() { return participants.map(function (player) { return player.playerId }) }
function aliveIds() { return participantIds().filter(function (id) { return state.alive[id] }) }
function aliveIdsByRole(role) { return aliveIds().filter(function (id) { return roles[id] === role }) }
function aliveIdsExceptRole(role) { return aliveIds().filter(function (id) { return roles[id] !== role }) }
function validAliveTarget(id) { return !!id && !!state.alive[id] }
function allRoleActed(role) { var ids = aliveIdsByRole(role); return ids.length > 0 && ids.every(function (id) { return !!state.actions[id] }) }
function roleActions(role) { var result = {}, ids = aliveIdsByRole(role), i; for (i = 0; i < ids.length; i++) result[ids[i]] = state.actions[ids[i]]; return result }
function allAliveActed(actions) { var ids = aliveIds(); return ids.length > 0 && ids.every(function (id) { return !!actions[id] }) }
function connectedPlayer(id) { return connected.filter(function (player) { return player.playerId === id })[0] }
function participantById(id) { return participants.filter(function (player) { return player.playerId === id })[0] }
function playerName(id) { var player = participantById(id); return player ? (player.nick || 'Jogador') : 'Jogador' }
function firstWinnerId(team) { var ids = participantIds().filter(function (id) { return team === 'assassinos' ? roles[id] === ROLE.ASSASSIN : roles[id] !== ROLE.ASSASSIN }); return ids[0] || null }
function clearTimer() { clearTimeout(timer); timer = null }
