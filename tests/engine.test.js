// Testes do motor e do solucionador. Rode com: node --test
const test = require('node:test');
const assert = require('node:assert/strict');
const E = require('../js/engine.js');

// gerador aleatório com semente, para os testes serem reproduzíveis
let seed = 12345;
const rnd = () => (seed = (seed * 16807) % 2147483647) / 2147483647;
function scramble(n = 25) {
  const a = []; let last = '';
  while (a.length < n) {
    const f = 'URFDLB'[Math.floor(rnd() * 6)];
    if (f === last) continue;
    last = f; a.push(f + ['', "'", '2'][Math.floor(rnd() * 3)]);
  }
  return a;
}
const same = (a, b) => a.join('') === b.join('');
const W = E.mv(E.solved(), 'z2'); // branco embaixo, como nos passos 2 a 7

test('cada movimento repetido 4 vezes volta ao início', () => {
  for (const m of ['R', 'L', 'U', 'D', 'F', 'B', 'M', 'E', 'S', 'x', 'y', 'z'])
    assert.ok(same(E.mv(E.solved(), [m, m, m, m]), E.solved()), m);
});

test('"sexy move" (R U R\' U\') 6 vezes volta ao início', () => {
  assert.ok(same(E.mv(E.solved(), "R U R' U' ".repeat(6)), E.solved()));
});

test('algoritmos de cada passo resolvem o caso para o qual foram feitos', () => {
  const algs = [E.AL.c_dir, E.AL.c_fre, E.AL.e_dir, E.AL.e_esq, E.AL.oll, E.AL.sune, E.AL.aperm, E.AL.ua, E.AL.ub];
  for (const a of algs) assert.ok(E.isSolved(E.mv(E.mv(W, E.inv(a)), a)), a);
});

test('validação aceita cubos embaralhados e recusa peças impossíveis', () => {
  const s = E.mv(E.solved(), scramble());
  assert.equal(E.validate(s).ok, true);
  const flip = s.slice(); const a = E.st('UF', 'U'), b = E.st('UF', 'F');
  [flip[a], flip[b]] = [flip[b], flip[a]];
  assert.equal(E.validate(flip).ok, false, 'meio virado');
  const tw = s.slice(); const [i, j, k] = ['U', 'F', 'R'].map(F => E.st('UFR', F));
  [tw[i], tw[j], tw[k]] = [tw[k], tw[i], tw[j]];
  assert.equal(E.validate(tw).ok, false, 'canto girado');
});

test('o solucionador monta 2000 cubos aleatórios', () => {
  let total = 0;
  for (let n = 0; n < 2000; n++) {
    const f = E.mv(E.solved(), scramble());
    const r = E.solve(f);
    const moves = r.stages.flatMap(s => s.subs.flatMap(x => [...x.pre, ...x.alg]));
    total += moves.length;
    assert.ok(E.isSolved(E.mv(f, moves)), 'falhou no cubo ' + n);
  }
  console.log('média de movimentos:', (total / 2000).toFixed(1));
});
