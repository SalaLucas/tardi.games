var STYLE_ID = 'attention-style'
var CSS = [
  '*{box-sizing:border-box}',
  'html,body{margin:0;width:100%;height:100%;overflow:hidden;background:#10172e;color:#f8fbff;font-family:Arial,sans-serif}',
  '.att-table{height:100%;position:relative;overflow:hidden;background:radial-gradient(circle at 50% 45%,#2b3e80 0,#172553 45%,#0b1026 100%)}',
  '.att-top{position:absolute;z-index:5;top:0;left:0;width:100%;padding:2.2vmin 3.5vmin;display:flex;align-items:center;justify-content:space-between;background:linear-gradient(#101735e8,transparent)}',
  '.att-title{font-size:3vmin;font-weight:bold;letter-spacing:.08em;text-transform:uppercase}.att-round{font-size:2vmin;color:#b9ccff;text-transform:capitalize}',
  '.att-prompt{position:absolute;z-index:6;left:50%;top:50%;transform:translate(-50%,-50%);text-align:center;background:#101735e6;border:2px solid #91b6ff;border-radius:3vmin;padding:3vmin 5vmin;min-width:45vmin;box-shadow:0 1vmin 5vmin #0008}',
  '.att-prompt small{display:block;color:#b9ccff;font-size:2.4vmin;letter-spacing:.13em;text-transform:uppercase}.att-target{font-size:12vmin;line-height:1.1}.att-prompt strong{font-size:3.5vmin}',
  '.att-scene{position:absolute;inset:0}.att-object{position:absolute;line-height:1;will-change:transform;filter:drop-shadow(.25vmin .35vmin .15vmin #0005)}',
  '.att-scoreboard{position:absolute;z-index:5;bottom:2vmin;left:3vmin;display:flex;flex-wrap:wrap}.att-score{background:#101735cf;border-radius:2vmin;padding:1vmin 1.6vmin;margin-right:1vmin;font-size:1.8vmin}.att-score b{color:#ffdd78}',
  '.att-hand{min-height:100%;display:flex;flex-direction:column;align-items:center;justify-content:center;padding:6vmin;background:linear-gradient(155deg,#17285a,#10172e)}',
  '.att-hand h1{font-size:7vmin;margin:0 0 2vmin}.att-hand p{font-size:4.5vmin;margin:1vmin;text-align:center;color:#d9e5ff}.att-hand .hint{font-size:3.5vmin;color:#abc2fa}.att-hand-target{font-size:25vmin;line-height:1;margin:2vmin}',
  '.att-answer{font-size:15vmin;min-height:18vmin;line-height:1;text-align:center;color:#ffdd78;margin:3vmin 0}.att-pad{width:88%;max-width:62vmin;display:flex;flex-wrap:wrap;justify-content:center}.att-key{width:29%;margin:1%;height:13vmin;border:0;border-radius:2.5vmin;background:#324b93;color:#fff;font-size:6vmin;font-weight:bold}.att-key:active{background:#6489e9}.att-key.send{background:#20a46a;width:60%}.att-key.back{background:#6e4a78}',
  '.att-results{font-size:5vmin;color:#ffdd78;text-align:center}.att-correct{color:#70efae}.att-wrong{color:#ff9b9b}',
  '.att-difficulty{display:flex;flex-direction:column;width:90%;max-width:66vmin;margin-top:4vmin}.att-difficulty button{border:0;border-radius:2.5vmin;margin:1vmin 0;padding:3vmin;background:#324b93;color:#fff;font-size:5vmin;font-weight:bold}.att-difficulty button.easy{background:#229467}.att-difficulty button.hard{background:#b54552}',
  '.att-leaderboard{width:58vmin;max-width:80vw;text-align:left;margin:2vmin auto}.att-rank{display:flex;justify-content:space-between;margin:1vmin 0;padding:1.4vmin 2vmin;border-radius:1.5vmin;background:#293b77;font-size:2.7vmin}.att-rank:first-child{background:#a97920;color:#fff8d7}'
].join('')

export function mountTable(root) {
  injectStyle()
  var wrap = el('div', 'att-table'), top = el('div', 'att-top'), title = el('div', 'att-title', 'COUNT THE CHAOS'), round = el('div', 'att-round')
  top.appendChild(title); top.appendChild(round)
  var scene = el('div', 'att-scene'), prompt = el('div', 'att-prompt'), scores = el('div', 'att-scoreboard')
  wrap.appendChild(scene); wrap.appendChild(top); wrap.appendChild(prompt); wrap.appendChild(scores); root.appendChild(wrap)
  var objectNodes = [], items = [], last = 0, active = false
  requestAnimationFrame(tick)
  function tick(now) {
    var dt = Math.min(40, now - last || 16) / 16; last = now
    if (active) for (var i = 0; i < items.length; i++) {
      var item = items[i]; item.x += item.vx * dt; item.y += item.vy * dt
      if (item.x < 0 || item.x > 96) { item.vx *= -1; item.x = Math.max(0, Math.min(96, item.x)) }
      if (item.y < 0 || item.y > 90) { item.vy *= -1; item.y = Math.max(0, Math.min(90, item.y)) }
      objectNodes[i].style.transform = 'translate(' + item.x + 'vw,' + item.y + 'vh) rotate(' + (item.spin += item.vx * .5) + 'deg)'
    }
    requestAnimationFrame(tick)
  }
  return function (state, players) {
    round.textContent = state.phase === 'lobby' ? 'Choose a difficulty' : (state.difficulty + ' - Round ' + state.round + ' / 5')
    if (items !== state.scene) { items = state.scene || []; objectNodes = []; scene.innerHTML = ''; for (var i = 0; i < items.length; i++) { var node = el('div', 'att-object', items[i].icon); node.style.fontSize = items[i].size + 'vmin'; scene.appendChild(node); objectNodes.push(node) } }
    active = state.phase === 'observe'; scene.style.display = active ? 'block' : 'none'
    prompt.innerHTML = promptText(state); prompt.style.display = state.phase === 'observe' ? 'none' : 'block'
    scores.innerHTML = ''
    if (state.phase !== 'leaderboard') for (var j = 0; j < players.length; j++) { var p = players[j], score = el('div', 'att-score', (p.nick || 'Player') + ': '); score.appendChild(el('b', '', String(state.scores[p.playerId] || 0))); if (state.phase === 'results' && state.submissions[p.playerId] !== undefined) score.appendChild(document.createTextNode(' - ' + state.submissions[p.playerId])); scores.appendChild(score) }
  }
}

export function mountHand(root, onKey) {
  injectStyle(); var wrap = el('div', 'att-hand'); root.appendChild(wrap)
  return function (state, playerId, answer) {
    if (!state) { wrap.innerHTML = '<h1>Count the Chaos</h1><p>Connecting to the table...</p>'; return }
    var submitted = state.submissions[playerId]
    if (state.phase === 'lobby') renderDifficulty(wrap, onKey)
    else if (state.phase === 'reveal') wrap.innerHTML = '<h1>Remember this object</h1><div class="att-hand-target">' + state.target + '</div><p>Count every one you see.</p>'
    else if (state.phase === 'observe') wrap.innerHTML = '<h1>Watch closely</h1><div class="att-hand-target">' + state.target + '</div><p class="hint">Count them on the table.</p>'
    else if (state.phase === 'answer') renderAnswer(wrap, state.target, answer, submitted, onKey)
    else if (state.phase === 'results') { var correct = submitted === state.targetCount; wrap.innerHTML = '<h1>The answer was</h1><div class="att-results">' + state.target + ' &times; ' + state.targetCount + '</div><p class="' + (correct ? 'att-correct' : 'att-wrong') + '">' + (correct ? 'Correct!' : 'Your answer: ' + (submitted === undefined ? '-' : submitted)) + '</p>' }
    else if (state.phase === 'leaderboard') renderLeaderboard(wrap, state, onKey)
  }
}

function renderAnswer(wrap, target, answer, submitted, onKey) {
  wrap.innerHTML = '<h1>How many ' + target + '?</h1>'
  if (submitted !== undefined) { wrap.innerHTML += '<div class="att-answer">' + submitted + '</div><p class="hint">Answer locked in. Waiting for everyone...</p>'; return }
  wrap.innerHTML += '<div class="att-answer">' + (answer || '-') + '</div><div class="att-pad"></div>'
  var pad = wrap.lastChild, keys = ['1','2','3','4','5','6','7','8','9','back','0','send']
  for (var i = 0; i < keys.length; i++) { var key = keys[i], label = key === 'back' ? 'DEL' : key === 'send' ? 'SEND' : key, button = el('button', 'att-key ' + key, label); button.addEventListener('click', bindKey(key, onKey)); pad.appendChild(button) }
}
function renderDifficulty(wrap, onKey) {
  wrap.innerHTML = '<h1>Choose difficulty</h1><p class="hint">The first selection starts a 5-round game.</p><div class="att-difficulty"></div>'
  var box = wrap.lastChild, choices = [['easy','EASY - Slow'],['medium','MEDIUM - Normal'],['hard','HARD - Fast']]
  for (var i = 0; i < choices.length; i++) { var button = el('button', choices[i][0], choices[i][1]); button.addEventListener('click', bindKey(choices[i][0], onKey)); box.appendChild(button) }
}
function renderLeaderboard(wrap, state, onKey) {
  wrap.innerHTML = '<h1>Final leaderboard</h1><p class="hint">5 rounds - ' + state.difficulty + '</p><div class="att-leaderboard"></div><div class="att-difficulty"><button class="medium">Back to main screen</button></div>'
  var list = wrap.querySelector('.att-leaderboard'), ranking = ranked(state)
  for (var i = 0; i < ranking.length; i++) { var row = el('div', 'att-rank', (i + 1) + '. ' + (ranking[i].nick || 'Player')); row.appendChild(el('b', '', String(state.scores[ranking[i].playerId] || 0))); list.appendChild(row) }
  wrap.querySelector('.medium').addEventListener('click', bindKey('lobby', onKey))
}
function promptText(state) {
  if (state.phase === 'lobby') return '<small>Count the Chaos</small><strong>Choose a difficulty on a phone</strong>'
  if (state.phase === 'reveal') return '<small>Remember this object</small><div class="att-target">' + state.target + '</div><strong>Count every one of them.</strong>'
  if (state.phase === 'answer') return '<small>Time!</small><strong>Enter your answer on your phone</strong>'
  if (state.phase === 'results') return '<small>The answer</small><div class="att-target">' + state.target + ' &times; ' + state.targetCount + '</div><strong>' + (state.round >= 5 ? 'Final results are coming up' : 'Next round is coming up') + '</strong>'
  if (state.phase === 'leaderboard') { var ranking = ranked(state), text = '<small>Final leaderboard</small><strong>'; for (var i = 0; i < ranking.length; i++) text += (i + 1) + '. ' + (ranking[i].nick || 'Player') + ' - ' + (state.scores[ranking[i].playerId] || 0) + '<br>'; return text + '</strong>' }
  return ''
}
function ranked(state) { var list = state.players.slice(); list.sort(function (a, b) { return (state.scores[b.playerId] || 0) - (state.scores[a.playerId] || 0) }); return list }
function bindKey(key, onKey) { return function () { onKey(key) } }
function el(tag, className, content) { var node = document.createElement(tag); node.className = className || ''; if (content !== undefined) node.textContent = content; return node }
function injectStyle() { if (document.getElementById(STYLE_ID)) return; var style = document.createElement('style'); style.id = STYLE_ID; style.textContent = CSS; document.head.appendChild(style) }
