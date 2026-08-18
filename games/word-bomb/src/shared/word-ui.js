var STYLE_ID = 'word-bomb-style'
var CSS = [
  '*{box-sizing:border-box}',
  'html,body{margin:0;width:100%;height:100%;overflow:hidden;background:#120b27;color:#fff7e8;font-family:Arial,sans-serif}',
  '.wb-table{min-height:100%;position:relative;overflow:hidden;padding:4vmin;background:radial-gradient(circle at 50% 42%,#44205f 0,#24113d 45%,#11091f 100%)}',
  '.wb-table:before{content:"";position:absolute;inset:-40%;opacity:.25;background:repeating-radial-gradient(circle,#ffb338 0 1px,transparent 2px 9vmin);transform:rotate(14deg)}',
  '.wb-top,.wb-main,.wb-roster{position:relative;z-index:1}.wb-top{display:flex;justify-content:space-between;align-items:center;color:#f7d58b;text-transform:uppercase;letter-spacing:.14em}.wb-title{font-size:3vmin;font-weight:bold}.wb-round{font-size:1.8vmin}',
  '.wb-main{height:66vh;display:flex;flex-direction:column;justify-content:center;align-items:center;text-align:center}.wb-caption{font-size:2.3vmin;letter-spacing:.16em;text-transform:uppercase;color:#e8c6ff}.wb-pair{font-size:22vmin;line-height:.9;font-weight:bold;letter-spacing:.04em;color:#ffd166;text-shadow:0 .9vmin 0 #9b5119,0 1.8vmin 3vmin #0008}.wb-status{margin-top:4vmin;min-height:4vmin;max-width:72vmin;font-size:2.8vmin;font-weight:bold}.wb-help{font-size:2vmin;color:#e1cef2;margin-top:1vmin}',
  '.wb-bomb{width:11vmin;height:11vmin;border-radius:50%;background:radial-gradient(circle at 33% 28%,#ff837c 0 7%,#e63643 9%,#8d132c 68%);box-shadow:0 1vmin 2vmin #0008;position:absolute;right:6vmin;top:11vmin}.wb-bomb:after{content:"";position:absolute;width:6vmin;height:2vmin;border-top:.8vmin solid #ffca68;right:-4.5vmin;top:-2vmin;transform:rotate(-25deg);border-radius:50%}.wb-seconds{position:absolute;inset:0;display:flex;align-items:center;justify-content:center;font-size:4.5vmin;font-weight:bold}',
  '.wb-roster{position:absolute;z-index:2;bottom:2.5vmin;left:3vmin;right:3vmin;display:flex;gap:1.2vmin;justify-content:center;flex-wrap:wrap}.wb-player{min-width:16vmin;padding:1.2vmin 1.8vmin;border-radius:1.8vmin;background:#170c2bdd;border:1px solid #765697;font-size:1.9vmin}.wb-player.active{background:#5b276a;border-color:#ffd166;box-shadow:0 0 2vmin #ffd16666}.wb-player.out{opacity:.42;filter:grayscale(1)}.wb-player b{display:block;font-size:2.2vmin}.wb-heart{color:#ff6978}',
  '.wb-hand{min-height:100%;display:flex;flex-direction:column;align-items:center;justify-content:center;padding:7vmin 5vmin;background:radial-gradient(circle at 50% 25%,#512c72,#160b2a 72%);text-align:center}.wb-hand h1{margin:0 0 2vmin;font-size:8vmin}.wb-hand p{margin:1vmin 0;color:#e7d5f3;font-size:4vmin}.wb-hand .pair{font-size:26vmin;line-height:1;font-weight:bold;color:#ffd166;text-shadow:0 .8vmin 0 #9b5119}.wb-hand .timer{color:#ff8e8e;font-size:8vmin;font-weight:bold}.wb-input{width:92%;height:14vmin;margin:4vmin 0 2vmin;border:0;border-radius:3vmin;padding:0 4vmin;font-size:6vmin;text-align:center;background:#fff9ed;color:#2b153e;outline:3px solid #ffd166}.wb-button{width:92%;border:0;border-radius:3vmin;padding:4vmin;background:#ffbd39;color:#351229;font-size:5vmin;font-weight:bold;box-shadow:0 1vmin 0 #a55b18}.wb-button:active{transform:translateY(.6vmin);box-shadow:0 .4vmin 0 #a55b18}.wb-note{min-height:7vmin;color:#ffbebf;font-size:3.4vmin!important}.wb-lives{display:flex;gap:1vmin;margin:2vmin 0;font-size:7vmin}.wb-lives span{filter:grayscale(1);opacity:.35}.wb-lives span.on{filter:none;opacity:1}.wb-winner{font-size:9vmin!important;color:#ffd166!important;font-weight:bold}'
].join('')

export function mountTable(root) {
  injectStyle()
  var wrap = el('div', 'wb-table'), top = el('div', 'wb-top'), main = el('div', 'wb-main'), roster = el('div', 'wb-roster')
  var deadline = 0
  top.appendChild(el('div', 'wb-title', 'Bomba de Palavras'))
  top.appendChild(el('div', 'wb-round'))
  wrap.appendChild(top); wrap.appendChild(el('div', 'wb-bomb')); wrap.appendChild(main); wrap.appendChild(roster); root.appendChild(wrap)
  setInterval(function () {
    var clock = wrap.querySelector('.wb-seconds')
    if (clock && deadline) clock.textContent = String(secondsLeft(deadline))
  }, 200)
  return function (state) {
    deadline = state.deadline || 0
    var active = state.players && state.players[state.turnIndex]
    top.lastChild.textContent = state.phase === 'playing' ? '10 segundos · 3 vidas' : 'Português brasileiro'
    if (state.phase === 'lobby') main.innerHTML = '<div class="wb-caption">Desafio de palavras</div><div class="wb-pair">? ?</div><div class="wb-status">Cada jogador precisa encontrar uma palavra com as duas letras juntas.</div><div class="wb-help">Comece pelo celular quando todos estiverem prontos.</div>'
    else if (state.phase === 'playing') main.innerHTML = '<div class="wb-caption">Vez de ' + escape(active.nick || 'Jogador') + '</div><div class="wb-pair">' + state.pair.toUpperCase() + '</div><div class="wb-status">' + escape(state.message || 'Encontre uma palavra antes da bomba explodir.') + '</div><div class="wb-help">As letras precisam aparecer juntas, nessa ordem.</div>'
    else main.innerHTML = '<div class="wb-caption">A bomba parou</div><div class="wb-pair">★</div><div class="wb-status">' + (state.winnerId ? escape(playerName(state, state.winnerId)) + ' venceu!' : 'Partida encerrada.') + '</div><div class="wb-help">Uma nova partida pode ser iniciada pelo celular.</div>'
    var bomb = wrap.querySelector('.wb-bomb')
    bomb.style.display = state.phase === 'playing' ? 'block' : 'none'
    bomb.innerHTML = state.phase === 'playing' ? '<div class="wb-seconds">' + state.secondsLeft + '</div>' : ''
    roster.innerHTML = ''
    ;(state.players || []).forEach(function (player) {
      var lives = state.lives[player.playerId] || 0, card = el('div', 'wb-player' + (active && active.playerId === player.playerId ? ' active' : '') + (lives === 0 ? ' out' : ''))
      card.appendChild(el('b', '', player.nick || 'Jogador'))
      card.appendChild(el('div', 'wb-heart', hearts(lives)))
      roster.appendChild(card)
    })
  }
}

export function mountHand(root, onAction) {
  injectStyle(); var wrap = el('div', 'wb-hand'), draft = '', draftKey = '', lastRenderKey = '', inputLocked = false
  var deadline = 0
  root.appendChild(wrap)
  setInterval(function () {
    var timer = wrap.querySelector('.timer')
    if (timer && deadline) timer.textContent = secondsLeft(deadline) + 's'
  }, 200)
  return function (state, playerId) {
    if (!state) { wrap.innerHTML = '<h1>Bomba de Palavras</h1><p>Conectando à mesa…</p>'; return }
    deadline = state.deadline || 0
    var stillMyTurn = state.phase === 'playing' && state.players[state.turnIndex].playerId === playerId
    // Once typing begins, the input owns the screen until this player's turn
    // ends. Network retries can then never replace the focused element.
    if (inputLocked && stillMyTurn) return
    if (!stillMyTurn) inputLocked = false
    // Capture the actual DOM value as well as input events. This also covers
    // mobile keyboards that dispatch their final input event during a repaint.
    var openInput = wrap.querySelector('.wb-input')
    if (openInput) draft = openInput.value
    // Timer updates (and duplicate delivery acknowledgements) must not rebuild
    // the input. Rebuilding a focused input discards what the player is typing.
    var renderKey = [state.phase, state.pair, state.turnIndex, state.message, state.winnerId, state.lives[playerId]].join('|')
    if (renderKey === lastRenderKey) return
    lastRenderKey = renderKey
    var turnKey = state.phase + ':' + state.pair + ':' + state.turnIndex + ':' + playerId
    if (turnKey !== draftKey) { draft = ''; draftKey = turnKey }
    var me = findPlayer(state, playerId), myLives = state.lives[playerId] || 0
    if (state.phase === 'lobby') { wrap.innerHTML = '<h1>Bomba de Palavras</h1><p>Encontre uma palavra que contenha as duas letras sorteadas.</p><p>Você tem 10 segundos e 3 vidas.</p><button class="wb-button">Começar partida</button>'; wrap.querySelector('button').onclick = function () { onAction({ type: 'start' }) }; return }
    if (state.phase === 'finished') { wrap.innerHTML = '<h1>Fim de jogo</h1><p class="wb-winner">' + (state.winnerId === playerId ? 'Você venceu!' : escape(playerName(state, state.winnerId)) + ' venceu!') + '</p><button class="wb-button">Jogar novamente</button>'; wrap.querySelector('button').onclick = function () { onAction({ type: 'restart' }) }; return }
    var myTurn = state.players[state.turnIndex].playerId === playerId
    if (!myTurn) { wrap.innerHTML = '<h1>Acompanhe a mesa</h1><div class="pair">' + state.pair.toUpperCase() + '</div><p>É a vez de ' + escape(state.players[state.turnIndex].nick || 'outro jogador') + '.</p><div class="wb-lives">' + lifeMarkup(myLives) + '</div><p class="timer">' + state.secondsLeft + 's</p>'; return }
    if (myLives === 0) { wrap.innerHTML = '<h1>Você saiu da rodada</h1><p>Torça pelos demais jogadores.</p>'; return }
    renderInput(wrap, state, onAction, myLives, draft, function (value) { draft = value; inputLocked = value !== '' }, function () { inputLocked = false }, function () { inputLocked = true })
  }
}

function renderInput(wrap, state, onAction, lives, draft, onDraft, onSend, onFocus) {
  wrap.innerHTML = '<p>É a sua vez!</p><div class="pair">' + state.pair.toUpperCase() + '</div><p class="timer">' + state.secondsLeft + 's</p><div class="wb-lives">' + lifeMarkup(lives) + '</div><input class="wb-input" maxlength="18" autocomplete="off" autocapitalize="none" placeholder="Digite uma palavra"><button class="wb-button">Enviar palavra</button><p class="wb-note">' + escape(state.message || '') + '</p>'
  var input = wrap.querySelector('input'), button = wrap.querySelector('button')
  input.value = draft
  function send() { var word = input.value.trim(); if (word) { onDraft(''); onSend(); onAction({ type: 'word', word: word }) } }
  button.onclick = send
  input.oninput = function () { onDraft(input.value) }
  input.onfocus = onFocus
  input.onkeydown = function (event) { if (event.key === 'Enter') send() }
  input.focus()
}
function hearts(lives) { return '♥'.repeat(lives) + '♡'.repeat(3 - lives) }
function lifeMarkup(lives) { var result = '', i; for (i = 0; i < 3; i++) result += '<span class="' + (i < lives ? 'on' : '') + '">♥</span>'; return result }
function findPlayer(state, id) { return (state.players || []).filter(function (player) { return player.playerId === id })[0] }
function playerName(state, id) { var player = findPlayer(state, id); return player ? (player.nick || 'Jogador') : 'Ninguém' }
function secondsLeft(deadline) { return Math.max(0, Math.ceil((deadline - Date.now()) / 1000)) }
function el(tag, className, text) { var node = document.createElement(tag); node.className = className || ''; if (text !== undefined) node.textContent = text; return node }
function escape(value) { var node = document.createElement('div'); node.textContent = value || ''; return node.innerHTML }
function injectStyle() { if (document.getElementById(STYLE_ID)) return; var style = document.createElement('style'); style.id = STYLE_ID; style.textContent = CSS; document.head.appendChild(style) }
