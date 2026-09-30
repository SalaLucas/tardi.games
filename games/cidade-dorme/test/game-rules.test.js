import test from 'node:test'
import assert from 'node:assert/strict'
import { ROLE, assignRoles, plurality, roleDeck, winningTeam } from '../src/shared/game-rules.js'

test('role deck scales to two assassins at seven players', function () {
  assert.equal(roleDeck(6).filter(function (r) { return r === ROLE.ASSASSIN }).length, 1)
  assert.equal(roleDeck(7).filter(function (r) { return r === ROLE.ASSASSIN }).length, 2)
  assert.equal(roleDeck(8).length, 8)
})

test('role assignment gives every player exactly one role', function () {
  var players = Array.from({ length: 5 }, function (_, i) { return { playerId: 'p' + i } })
  assert.deepEqual(Object.keys(assignRoles(players, function () { return 0.25 })).sort(), ['p0','p1','p2','p3','p4'])
})

test('city wins without assassins and assassins win at parity', function () {
  var roles = { a: ROLE.ASSASSIN, b: ROLE.CITIZEN, c: ROLE.ANGEL }
  assert.equal(winningTeam(roles, { a: false, b: true, c: true }), 'cidade')
  assert.equal(winningTeam(roles, { a: true, b: true, c: false }), 'assassinos')
})

test('day vote ties eliminate nobody while assassin ties can break randomly', function () {
  var votes = { a: 'x', b: 'y' }
  assert.equal(plurality(votes, ['x','y'], false), null)
  assert.equal(plurality(votes, ['x','y'], true, function () { return 0 }), 'x')
})
