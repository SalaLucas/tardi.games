var STYLE_ID = 'cidade-dorme-style'
var ROLE_INFO = {
  cidadao: ['Cidadão', '🏠', 'Ajude a cidade a encontrar os Assassinos.'],
  detetive: ['Detetive', '🔎', 'Investigue uma pessoa por noite.'],
  anjo: ['Anjo', '🪽', 'Proteja uma pessoa por noite.'],
  assassino: ['Assassino', '🌑', 'Elimine a cidade sem ser descoberto.']
}
var CSS = [
  '*{box-sizing:border-box}html,body{margin:0;width:100%;height:100%;overflow:hidden;background:#080d21;color:#fff9e8;font-family:Arial,sans-serif}',
  'button{font:inherit}.cd-table{height:100%;position:relative;overflow:hidden;padding:3vmin;background:radial-gradient(circle at 50% 12%,#32528b 0,#14264c 32%,#080d21 72%)}',
  '.cd-moon{position:absolute;top:-9vmin;left:50%;width:29vmin;height:29vmin;transform:translateX(-50%);border-radius:50%;background:#fff4bd;box-shadow:0 0 8vmin #ffe98d99}.cd-moon:after{content:"";position:absolute;left:7vmin;top:-2vmin;width:29vmin;height:29vmin;border-radius:50%;background:#254374}',
  '.cd-stars{position:absolute;inset:0;background-image:radial-gradient(#fff 1px,transparent 1px);background-size:7vmin 7vmin;opacity:.25}.cd-top,.cd-center,.cd-roster{position:relative;z-index:2}.cd-top{display:flex;justify-content:space-between;align-items:center;text-transform:uppercase;letter-spacing:.14em}.cd-title{font-size:3vmin;font-weight:bold}.cd-phase{font-size:2vmin;color:#f6dc9a}',
  '.cd-center{height:62vh;display:flex;flex-direction:column;align-items:center;justify-content:center;text-align:center}.cd-icon{font-size:12vmin;filter:drop-shadow(0 1vmin 2vmin #0008)}.cd-kicker{font-size:2.2vmin;color:#c9d8ff;letter-spacing:.16em;text-transform:uppercase}.cd-center h1{margin:1vmin;max-width:82vw;font-size:5vmin}.cd-center p{margin:1vmin;max-width:75vw;color:#dbe4ff;font-size:2.7vmin}.cd-timer{font-size:6vmin;font-weight:bold;color:#ffdc7b}',
  '.cd-roster{position:absolute;left:3vmin;right:3vmin;bottom:3vmin;display:flex;flex-wrap:wrap;justify-content:center;gap:1.1vmin}.cd-player{min-width:15vmin;padding:1.2vmin 1.5vmin;border:1px solid #6680ad;border-radius:1.5vmin;background:#0b1534dc;text-align:center;font-size:1.8vmin}.cd-player b{display:block;font-size:2.1vmin}.cd-player.dead{opacity:.38;filter:grayscale(1)}.cd-player.done{border-color:#77e6b1}.cd-player.dead b{text-decoration:line-through}',
  '.cd-hand{height:100%;min-height:0;display:flex;flex-direction:column;align-items:center;justify-content:flex-start;overflow-y:auto;padding:6vmin 5vmin;text-align:center;background:radial-gradient(circle at 50% 12%,#304e87,#0a1027 68%)}.cd-hand:before,.cd-hand:after{content:"";display:block;flex:1 0 0}.cd-hand>*{flex-shrink:0}.cd-hand h1{font-size:8vmin;margin:1vmin}.cd-hand p{font-size:4vmin;margin:1.4vmin;color:#dce6ff}.cd-role{width:100%;max-width:72vmin;padding:4vmin;margin:2vmin 0;border:2px solid #e6ca7c;border-radius:4vmin;background:#101b3c}.cd-role-icon{font-size:12vmin;line-height:1}.cd-role small{display:block;color:#e6ca7c;font-size:3vmin;text-transform:uppercase;letter-spacing:.15em}.cd-targets{width:100%;display:flex;flex-direction:column;align-items:center}.cd-button{width:100%;max-width:72vmin;margin:1.2vmin 0;padding:3.5vmin;border:0;border-radius:2.5vmin;background:#e6b84e;color:#1c1730;font-size:4.5vmin;font-weight:bold;box-shadow:0 .8vmin 0 #986c24}.cd-button:active{transform:translateY(.4vmin);box-shadow:0 .4vmin 0 #986c24}.cd-button.target{display:flex;justify-content:space-between;background:#e9efff;box-shadow:0 .7vmin 0 #8191b7}.cd-button:disabled{opacity:.45}.cd-badge{font-size:3vmin;color:#8ce7b5}.cd-result{padding:3vmin;border-radius:2vmin;background:#111d41;font-size:4vmin!important}.cd-danger{color:#ff9e9e!important}.cd-good{color:#8ce7b5!important}',
  '@media(max-aspect-ratio:3/4){.cd-role{padding:2.5vmin}.cd-role-icon{font-size:10vmin}.cd-button{padding:2.8vmin}}'
].join('')

export function mountTable(root) {
  injectStyle(); var wrap = el('div','cd-table'), top = el('div','cd-top'), center = el('div','cd-center'), roster = el('div','cd-roster'), deadline = 0
  wrap.appendChild(el('div','cd-stars')); wrap.appendChild(el('div','cd-moon')); top.appendChild(el('div','cd-title','Cidade Dorme')); top.appendChild(el('div','cd-phase')); wrap.appendChild(top); wrap.appendChild(center); wrap.appendChild(roster); root.appendChild(wrap)
  setInterval(function () { var clock = wrap.querySelector('.cd-timer'); if (clock) clock.textContent = secondsLeft(deadline) + 's' }, 250)
  return function (state) {
    deadline = state.deadline || 0; top.lastChild.textContent = phaseName(state)
    center.innerHTML = tableCenter(state)
    roster.innerHTML = ''
    ;(state.players || []).forEach(function (player) { var alive = state.phase === 'lobby' || state.alive[player.playerId] !== false, done = state.submitted[player.playerId] || state.ready[player.playerId]; var card = el('div','cd-player' + (!alive ? ' dead' : '') + (done ? ' done' : '')); card.appendChild(el('b','',player.nick || 'Jogador')); card.appendChild(el('span','',state.phase === 'finished' ? roleLabel(state, player.playerId) : !alive ? 'Adormeceu' : done ? 'Pronto' : 'Acordado')); roster.appendChild(card) })
  }
}

export function mountHand(root, onAction) {
  injectStyle(); var wrap = el('div','cd-hand'), lastKey = ''; root.appendChild(wrap)
  setInterval(function () { var timer = wrap.querySelector('.cd-timer'); if (timer && timer.dataset.deadline) timer.textContent = secondsLeft(Number(timer.dataset.deadline)) + 's' }, 250)
  return function (state, playerId) {
    if (!state) { wrap.innerHTML = '<h1>Cidade Dorme</h1><p>Conectando à mesa…</p>'; return }
    var key = [state.phase,state.night,state.message,state.alive[playerId],state.submitted[playerId],state.ready[playerId],state.deadline,state.winner].join('|'); if (key === lastKey) return; lastKey = key
    if (state.phase === 'lobby') return renderLobby(wrap, state, onAction)
    var mine = state.privateViews[playerId]
    if (!mine) { wrap.innerHTML = '<h1>Acompanhe a mesa</h1><p>A partida já começou.</p>'; return }
    if (state.phase === 'finished') return renderFinished(wrap, state, mine, onAction)
    if (!state.alive[playerId]) { wrap.innerHTML = roleCard(mine) + '<h1>Você adormeceu</h1><p>Continue acompanhando em silêncio.</p>'; return }
    var canAct = activeRole(state.phase) === mine.role
    if (canAct) renderAction(wrap, state, playerId, mine, onAction)
    else if (state.phase === 'discussion') renderDiscussion(wrap, state, mine, playerId, onAction)
    else if (state.phase === 'vote') renderTargets(wrap, state, playerId, mine, 'Escolha seu voto', allowedTargets(state, playerId, null), onAction)
    else renderWaiting(wrap, state, mine, playerId)
  }
}

function renderLobby(wrap, state, onAction) { var count = (state.players || []).length, ok = count >= 5 && count <= 8; wrap.innerHTML = '<h1>Cidade Dorme</h1><p>Detetive, Anjo, Assassinos e Cidadãos.</p><p class="cd-result">' + count + ' / 5–8 jogadores conectados</p><button class="cd-button"' + (ok ? '' : ' disabled') + '>Começar partida</button>'; wrap.querySelector('button').onclick = function () { if (ok) onAction({type:'start'}) } }
function renderAction(wrap, state, playerId, mine, onAction) { if (state.submitted[playerId]) { wrap.innerHTML = roleCard(mine) + '<h1>Escolha confirmada</h1><p>Aguarde os outros jogadores.</p>'; return } var role = mine.role, title = role === 'anjo' ? 'Quem você vai proteger?' : role === 'assassino' ? 'Quem a cidade perderá?' : 'Quem você vai investigar?', excluded = role === 'assassino' ? 'assassino' : null; renderTargets(wrap,state,playerId,mine,title,allowedTargets(state,playerId,excluded,role === 'anjo'),onAction) }
function renderTargets(wrap,state,playerId,mine,title,targets,onAction) { wrap.innerHTML = roleCard(mine) + '<h1>' + title + '</h1><div class="cd-targets"></div>'; var box = wrap.lastChild; targets.forEach(function (id) { var button = el('button','cd-button target'); button.appendChild(el('span','',playerName(state,id))); button.appendChild(el('span','cd-badge','Escolher')); button.onclick = function () { onAction({type:'target',targetId:id}) }; box.appendChild(button) }) }
function renderDiscussion(wrap,state,mine,playerId,onAction) { var ready = state.ready[playerId]; wrap.innerHTML = roleCard(mine) + investigationMarkup(mine,state) + '<h1>Debatam!</h1><p>Quem está mentindo? Quando estiver pronto, encerre sua discussão.</p>' + timer(state) + '<button class="cd-button"' + (ready ? ' disabled' : '') + '>' + (ready ? 'Você está pronto' : 'Estou pronto para votar') + '</button>'; wrap.querySelector('button').onclick = function () { if (!ready) onAction({type:'ready'}) } }
function renderWaiting(wrap,state,mine,playerId) { var html = roleCard(mine) + '<h1>' + waitingTitle(state.phase) + '</h1><p>' + state.message + '</p>' + timer(state); if (mine.role === 'detetive' && mine.investigations.length) { var last = mine.investigations[mine.investigations.length-1]; html += '<p class="cd-result ' + (last.isAssassin ? 'cd-danger' : 'cd-good') + '">' + playerName(state,last.playerId) + (last.isAssassin ? ' é Assassino.' : ' não é Assassino.') + '</p>' } if (mine.role === 'assassino' && mine.teammates.length) html += '<p>Seu aliado: <b>' + mine.teammates.map(function(id){return playerName(state,id)}).join(', ') + '</b></p>'; wrap.innerHTML = html }
function renderFinished(wrap,state,mine,onAction) { wrap.innerHTML = roleCard(mine) + '<h1>' + (state.winner === 'cidade' ? 'A cidade venceu!' : 'Os Assassinos venceram!') + '</h1><p>Veja todos os papéis na mesa.</p><button class="cd-button">Jogar novamente</button>'; wrap.querySelector('button').onclick = function () { onAction({type:'restart'}) } }
function tableCenter(state) { if (state.phase === 'lobby') return '<div class="cd-icon">🌙</div><div class="cd-kicker">Reúnam a cidade</div><h1>Inicie a partida em um celular</h1><p>São necessários de 5 a 8 jogadores.</p>'; var icon = state.phase.indexOf('night-') === 0 ? '🌙' : state.phase === 'discussion' ? '💬' : state.phase === 'vote' ? '🗳️' : state.phase === 'finished' ? '🏆' : state.lastEliminated ? '🕯️' : '🌅'; return '<div class="cd-icon">'+icon+'</div><div class="cd-kicker">'+phaseName(state)+'</div><h1>'+state.message+'</h1>'+(state.deadline?'<div class="cd-timer">'+secondsLeft(state.deadline)+'s</div>':'')+'<p>'+tableHint(state.phase)+'</p>' }
function roleCard(mine) { var info = ROLE_INFO[mine.role] || ['', '', '']; return '<div class="cd-role"><small>Seu papel secreto</small><div class="cd-role-icon">'+info[1]+'</div><h1>'+info[0]+'</h1><p>'+info[2]+'</p></div>' }
function investigationMarkup(mine,state) { if (mine.role !== 'detetive' || !mine.investigations.length) return ''; var last=mine.investigations[mine.investigations.length-1]; return '<p class="cd-result ' + (last.isAssassin ? 'cd-danger' : 'cd-good') + '">' + playerName(state,last.playerId) + (last.isAssassin ? ' é Assassino.' : ' não é Assassino.') + '</p>' }
function roleLabel(state,id) { var view = state.privateViews[id]; return view ? view.roleName : 'Espectador' }
function allowedTargets(state,playerId,excludedRole,includeSelf) { return state.players.filter(function(p){var view=state.privateViews[p.playerId]; return state.alive[p.playerId] && (includeSelf || p.playerId !== playerId) && (!excludedRole || !view || view.role !== excludedRole)}).map(function(p){return p.playerId}) }
function activeRole(phase) { return {'night-angel':'anjo','night-assassin':'assassino','night-detective':'detetive'}[phase] }
function waitingTitle(phase) { if (phase.indexOf('night-') === 0) return 'A cidade dorme'; if (phase === 'dawn') return 'A cidade acorda'; if (phase === 'verdict') return 'A cidade decidiu'; return 'Acompanhe a mesa' }
function phaseName(state) { if (state.phase === 'lobby') return 'Aguardando jogadores'; if (state.phase.indexOf('night-') === 0) return 'Noite ' + state.night; return {dawn:'Amanhecer',discussion:'Discussão',vote:'Votação',verdict:'Resultado',finished:'Fim de jogo'}[state.phase] || state.phase }
function tableHint(phase) { if (phase.indexOf('night-') === 0) return 'Olhe apenas para o seu celular.'; if (phase === 'discussion') return 'Os vivos podem encerrar antes quando todos estiverem prontos.'; if (phase === 'vote') return 'Vote secretamente no seu celular.'; if (phase === 'finished') return 'Os papéis foram revelados.'; return 'Aguarde a próxima etapa.' }
function playerName(state,id) { var p=(state.players||[]).filter(function(player){return player.playerId===id})[0]; return p?(p.nick||'Jogador'):'Jogador' }
function timer(state) { return state.deadline ? '<div class="cd-timer" data-deadline="'+state.deadline+'">'+secondsLeft(state.deadline)+'s</div>' : '' }
function secondsLeft(deadline) { return Math.max(0,Math.ceil((deadline-Date.now())/1000)) }
function el(tag,className,text){var node=document.createElement(tag);node.className=className||'';if(text!==undefined)node.textContent=text;return node}
function injectStyle(){if(document.getElementById(STYLE_ID))return;var style=document.createElement('style');style.id=STYLE_ID;style.textContent=CSS;document.head.appendChild(style)}
