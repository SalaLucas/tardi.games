# Bomba de Palavras

No início da rodada, o jogo sorteia duas letras. Cada jogador tem dez segundos para digitar uma palavra válida que contenha a sequência; o mesmo par continua enquanto os jogadores acertarem e só muda quando alguém perde uma vida. Todos começam com três vidas, e o último jogador vivo vence.

O jogo funciona com ou sem uma tela compartilhada. Em uma partida somente com celulares, cada aparelho mostra as letras sorteadas, o cronômetro, o jogador da vez e as vidas de todos. Quando há uma mesa, ela também acompanha a palavra enquanto o jogador digita e destaca a resposta completa quando ela é aceita.

Os pares sorteados precisam aparecer em pelo menos 100 palavras do dicionário com até sete letras. Assim, o jogo evita combinações que só existem em nomes, gentílicos ou termos técnicos longos.

## Dicionário

`src/data/words.js` é gerado a partir de `../../vendor/word-bomb/unitex-pt-br/data/mirror/DELAS.csv`, do projeto [datasets-br/unitex-pt-br](https://github.com/datasets-br/unitex-pt-br). A fonte usa a licença LGPLLR. Para atualizar a fonte, execute `npm run prepare-words` antes de construir.

## Desenvolvimento

```sh
npm install
npm run prepare-words
npm run dev
```
