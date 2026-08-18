# Bomba de Palavras

Em cada turno, a mesa sorteia duas letras; o jogador da vez tem dez segundos para digitar uma palavra válida que contenha a sequência. Todos começam com três vidas, e o último jogador vivo vence.

## Dicionário

`src/data/words.js` é gerado a partir de `vendor/unitex-pt-br/data/mirror/DELAS.csv`, do projeto [datasets-br/unitex-pt-br](https://github.com/datasets-br/unitex-pt-br). A fonte usa a licença LGPLLR. Para atualizar a fonte, execute `npm run prepare-words` antes de construir.

## Desenvolvimento

```sh
npm install
npm run prepare-words
npm run dev
```
