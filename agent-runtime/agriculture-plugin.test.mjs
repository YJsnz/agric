import test from 'node:test';
import assert from 'node:assert/strict';
import {apply} from './agriculture-plugin.mjs';
import {scopeToolArgs} from './tool-scope.mjs';

test('all agriculture tools compile their real Harness schemas, including optional record ID', () => {
  const registered=[];
  apply({tools:{register:tool=>registered.push(tool)}});
  assert.equal(registered.length,6);
  assert.deepEqual(registered.map(tool=>tool.name),['get_business_records','query_crop_knowledge','get_farm_context','retrieve_evidence','get_vision_records','analyze_environment']);
});

test('a user-selected record constrains omitted or different model arguments', () => {
  const id='97681559-6554-4bc2-9eda-41db058cfc8d',question=`核验视觉记录 ${id}`;
  assert.deepEqual(scopeToolArgs('get_vision_records',{},question),{recordId:id});
  assert.deepEqual(scopeToolArgs('get_vision_records',{recordId:'other'},question),{recordId:id});
  assert.deepEqual(scopeToolArgs('retrieve_evidence',{query:'梨叶'},question),{query:'梨叶'});
  assert.deepEqual(scopeToolArgs('get_vision_records',{},'查询最近视觉记录'),{});
  assert.equal(scopeToolArgs('query_crop_knowledge',{crop:'pear',question:'问题'},'查询小麦知识').crop,'wheat');
});
