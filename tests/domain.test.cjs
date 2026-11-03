const { test } = require('node:test');
const assert = require('node:assert/strict');
const { appendUnique, filterByGenre, plainText } = require('../.test-build/domain/catalog.js');
const { emptyLibrary, changeLibrary, reconcileLibrary, parseLibrary, isRating, isEntry } = require('../.test-build/domain/library.js');
const { normalizeEmail, validateCredentials, validateName, constantTimeEqual } = require('../.test-build/domain/validation.js');
const show = (id = 1) => ({ id, name: `Série ${id}`, image: null, genres: ['Drama'], summary: 'Sinopse', language: 'Português', status: 'Running', premiered: null, rating: null, url: 'https://www.tvmaze.com' });
const favorite = (id = 1, revision = 'r1') => ({ show: show(id), favorite: true, watched: false, rating: null, revision });

test('anexa páginas sem duplicar IDs e preserva a ordem', () => {
  const items = appendUnique([show(1), show(2)], [{ ...show(2), name: 'Atualizada' }, show(3)]);
  assert.deepEqual(items.map((s) => s.id), [1, 2, 3]);
  assert.equal(items[1].name, 'Atualizada');
});
test('uma página vazia não apaga o catálogo já carregado', () => {
  assert.deepEqual(appendUnique([show(1)], []), [show(1)]);
});
test('filtro por gênero não modifica a fonte', () => {
  const items = [show(1), { ...show(2), genres: ['Comedy'] }];
  assert.equal(filterByGenre(items, 'Drama').length, 1);
  assert.equal(filterByGenre(items, 'Todos'), items);
  assert.equal(items.length, 2);
});
test('limpa HTML e mantém texto legível', () => {
  assert.equal(plainText('<p>Uma <b>série</b> &amp; amigos.</p><p>Continua.</p>'), 'Uma série & amigos.\n\nContinua.');
});
test('remove script/style e decodifica entidades numéricas', () => {
  assert.equal(plainText('<script>alert(1)</script><style>x{}</style>Ol&#225; &#x1F3AC;'), 'Olá 🎬');
});
test('sinopse ausente tem mensagem apropriada', () => {
  assert.equal(plainText(null), 'Sinopse não disponível.');
  assert.equal(plainText('<p> </p>'), 'Sinopse não disponível.');
});
test('normaliza e-mail sem alterar senha', () => {
  assert.equal(normalizeEmail('  TESTE@EXEMPLO.COM '), 'teste@exemplo.com');
  assert.doesNotThrow(() => validateCredentials('teste@exemplo.com', 'Minha senha 123!'));
});
test('rejeita e-mail inválido, senha curta e entrada exagerada', () => {
  assert.throws(() => validateCredentials('inválido', '12345678'));
  assert.throws(() => validateCredentials('a@b.com', '123'));
  assert.throws(() => validateCredentials('a@b.com', 'a'.repeat(129)));
});
test('valida o nome no cadastro', () => {
  assert.throws(() => validateName(' '));
  assert.doesNotThrow(() => validateName('Gastão'));
});
test('comparação de hashes aceita igualdade e rejeita diferenças', () => {
  assert.equal(constantTimeEqual(new Uint8Array([1, 2]), new Uint8Array([1, 2])), true);
  assert.equal(constantTimeEqual(new Uint8Array([1, 2]), new Uint8Array([1, 3])), false);
  assert.equal(constantTimeEqual(new Uint8Array([1]), new Uint8Array([1, 2])), false);
});
test('favoritar não modifica o snapshot anterior', () => {
  const old = emptyLibrary();
  const next = changeLibrary(old, show(), { type: 'favorite' }, 'a');
  assert.deepEqual(old.entries, {});
  assert.equal(next.entries['1'].favorite, true);
  assert.deepEqual(next.pending, ['1']);
});
test('desfavoritar preserva um registro para enviar a remoção à nuvem', () => {
  const first = changeLibrary(emptyLibrary(), show(), { type: 'favorite' }, 'a');
  const second = changeLibrary(first, show(), { type: 'favorite' }, 'b');
  assert.equal(second.entries['1'].favorite, false);
  assert.deepEqual(second.pending, ['1']);
});
test('assistida exige nota válida', () => {
  assert.throws(() => changeLibrary(emptyLibrary(), show(), { type: 'watched', watched: true }, 'a'));
  assert.throws(() => changeLibrary(emptyLibrary(), show(), { type: 'watched', watched: true, rating: 6 }, 'a'));
});
test('marcar assistida preserva favorito e registra a nota', () => {
  const first = changeLibrary(emptyLibrary(), show(), { type: 'favorite' }, 'a');
  const next = changeLibrary(first, show(), { type: 'watched', watched: true, rating: 4 }, 'b');
  assert.equal(next.entries['1'].favorite, true);
  assert.equal(next.entries['1'].watched, true);
  assert.equal(next.entries['1'].rating, 4);
});
test('remover assistida limpa a nota sem remover o favorito', () => {
  let state = changeLibrary(emptyLibrary(), show(), { type: 'favorite' }, 'a');
  state = changeLibrary(state, show(), { type: 'watched', watched: true, rating: 4 }, 'b');
  state = changeLibrary(state, show(), { type: 'watched', watched: false }, 'c');
  assert.equal(state.entries['1'].favorite, true);
  assert.equal(state.entries['1'].watched, false);
  assert.equal(state.entries['1'].rating, null);
});
test('não permite avaliar série não assistida', () => {
  assert.throws(() => changeLibrary(emptyLibrary(), show(), { type: 'rating', rating: 5 }, 'a'));
});
test('atualiza nota válida sem duplicar a pendência', () => {
  const first = changeLibrary(emptyLibrary(), show(), { type: 'watched', watched: true, rating: 4 }, 'a');
  const second = changeLibrary(first, show(), { type: 'rating', rating: 5 }, 'b');
  assert.equal(second.entries['1'].rating, 5);
  assert.deepEqual(second.pending, ['1']);
});
test('notas não aceitam frações, strings ou NaN', () => {
  for (const value of [0, 6, 2.5, '5', null, NaN]) assert.equal(isRating(value), false);
  for (const value of [1, 2, 3, 4, 5]) assert.equal(isRating(value), true);
});
test('biblioteca ausente inicia vazia; JSON inválido não é silenciosamente zerado', () => {
  assert.deepEqual(parseLibrary(null), emptyLibrary());
  assert.throws(() => parseLibrary('{'));
  assert.throws(() => parseLibrary('null'));
  assert.throws(() => parseLibrary(JSON.stringify({ version: 2, entries: {}, pending: [] })));
});
test('rejeita formatos inválidos de biblioteca', () => {
  for (const entries of [5, [], 'abc', null]) {
    assert.throws(() => parseLibrary(JSON.stringify({ version: 1, entries, pending: [] })));
  }
});
test('rejeita registros e referências pendentes inconsistentes', () => {
  assert.throws(() => parseLibrary(JSON.stringify({ version: 1, entries: { 2: favorite(1) }, pending: [] })));
  assert.throws(() => parseLibrary(JSON.stringify({ version: 1, entries: {}, pending: ['1'] })));
  assert.equal(isEntry({ ...favorite(), watched: true, rating: null }), false);
});
test('preserva dados em ida e volta pelo JSON', () => {
  const state = changeLibrary(emptyLibrary(), show(), { type: 'favorite' }, 'a');
  assert.deepEqual(parseLibrary(JSON.stringify(state)), state);
});
test('sincronização confirma uma revisão enviada e traz outras séries', () => {
  const state = changeLibrary(emptyLibrary(), show(), { type: 'favorite' }, 'a');
  const next = reconcileLibrary(state, [state.entries['1']], [state.entries['1'], favorite(2)]);
  assert.deepEqual(next.pending, []);
  assert.equal(next.entries['2'].favorite, true);
});
test('edição feita durante sincronização continua pendente', () => {
  const initial = changeLibrary(emptyLibrary(), show(), { type: 'favorite' }, 'a');
  const current = changeLibrary(initial, show(), { type: 'favorite' }, 'b');
  const next = reconcileLibrary(current, [initial.entries['1']], [initial.entries['1']]);
  assert.deepEqual(next.pending, ['1']);
  assert.equal(next.entries['1'].favorite, false);
  assert.equal(next.entries['1'].revision, 'b');
});
test('uma remoção remota é respeitada quando não existe edição local pendente', () => {
  const local = { version: 1, entries: { 1: favorite() }, pending: [] };
  const next = reconcileLibrary(local, [], [{ ...favorite(), favorite: false, revision: 'deleted' }]);
  assert.equal(next.entries['1'].favorite, false);
});
