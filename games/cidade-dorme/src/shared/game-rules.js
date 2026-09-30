export var ROLE = { CITIZEN: 'cidadao', DETECTIVE: 'detetive', ANGEL: 'anjo', ASSASSIN: 'assassino' }

export function roleDeck(playerCount) {
  if (playerCount < 5 || playerCount > 8) throw new Error('Cidade Dorme precisa de 5 a 8 jogadores.')
  var deck = [ROLE.DETECTIVE, ROLE.ANGEL]
  var assassins = playerCount >= 7 ? 2 : 1
  while (assassins--) deck.push(ROLE.ASSASSIN)
  while (deck.length < playerCount) deck.push(ROLE.CITIZEN)
  return deck
}

export function assignRoles(players, random) {
  var deck = roleDeck(players.length).slice(), rng = random || Math.random, i, j, swap, result = {}
  for (i = deck.length - 1; i > 0; i--) { j = Math.floor(rng() * (i + 1)); swap = deck[i]; deck[i] = deck[j]; deck[j] = swap }
  for (i = 0; i < players.length; i++) result[players[i].playerId] = deck[i]
  return result
}

export function winningTeam(roles, alive) {
  var assassins = 0, city = 0, id
  for (id in roles) if (alive[id]) { if (roles[id] === ROLE.ASSASSIN) assassins += 1; else city += 1 }
  if (assassins === 0) return 'cidade'
  if (assassins >= city) return 'assassinos'
  return null
}

export function plurality(votes, validTargets, breakTies, random) {
  var allowed = {}, counts = {}, voter, target, max = 0, leaders = [], i
  for (i = 0; i < validTargets.length; i++) allowed[validTargets[i]] = true
  for (voter in votes) { target = votes[voter]; if (allowed[target]) counts[target] = (counts[target] || 0) + 1 }
  for (target in counts) max = Math.max(max, counts[target])
  if (!max) return null
  for (target in counts) if (counts[target] === max) leaders.push(target)
  if (leaders.length > 1 && !breakTies) return null
  return leaders.length === 1 ? leaders[0] : leaders[Math.floor((random || Math.random)() * leaders.length)]
}

export function roleName(role) {
  return { cidadao: 'Cidadão', detetive: 'Detetive', anjo: 'Anjo', assassino: 'Assassino' }[role] || role
}
