import { test } from 'node:test';
import assert from 'node:assert/strict';
import { COLUMNS, cellsFor, parseCells, direction } from './model.ts';

const valid = () => ({
  id: 'BH-TEST', version: 2, received_date: '2026-10-29', channel: 'SHOPEE',
  order_code: '000123', customer: 'Khách', phone: '0900123456', address: '', product: '=literal',
  reason: '', test_result: '', replacement: '', inbound_code: '', outbound_code: '',
  sent_date: null, due_date: null, priority: 'Bình thường', status: 'Chờ nhận hàng',
  ship_flag: false, ship_in: null, ship_out: null, parts: null, labor: null, other: null,
  refund: null, extra: null, cost_reviewed: false, note: ' Ghi chú '
});
test('round trip preserves leading zeros, literal text, null costs and boolean flags', () => {
  assert.deepEqual(parseCells(cellsFor(valid())), valid());
  assert.equal(COLUMNS.length, 28);
});
test('rejects malformed dates, negative costs, invalid flags and incomplete reviewed costs', () => {
  for (const patch of [{received_date: '2026-02-30'}, {ship_in: -1}, {cost_reviewed: true}, {ship_flag:'yes'}, {version: 1.5}, {status: 'invalid'}, {customer: ''}]) {
    assert.throws(() => parseCells(cellsFor({...valid(), ...patch})));
  }
});
test('website-only edits export; sheet-only edits import; simultaneous edits conflict', () => {
  const base = valid();
  assert.equal(direction(base, base, true), 'same');
  assert.equal(direction(base, {...base, version:3, note:'web edit'}, true), 'push');
  assert.equal(direction({...base, note:'sheet edit'}, base, false), 'pull');
  assert.equal(direction({...base, note:'sheet edit'}, {...base, version:3, note:'web edit'}, false), 'conflict');
});
test('new rows are insertable, but missing existing records cannot be resurrected', () => {
  assert.equal(direction({...valid(), version:0}, undefined, false), 'insert');
  assert.equal(direction(valid(), undefined, false), 'conflict');
});
test('retry after successful import repairs version instead of duplicating or conflicting', () => {
  const row = valid();
  assert.equal(direction({...row, version:0}, {...row, version:1}, false), 'push');
  assert.equal(direction(row, {...row, version:3}, false), 'push');
});
