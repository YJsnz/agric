import test from 'node:test';
import assert from 'node:assert/strict';
import {resourceLimits} from './resource-limits.mjs';
test('edge budgets reach the official SDK unchanged', () => {
  assert.deepEqual(resourceLimits({contextTokens:4096,maxTokens:512,timeoutSeconds:600}), {contextTokens:4096,maxTokens:512,timeoutSeconds:600});
  assert.throws(()=>resourceLimits({contextTokens:NaN}));
  assert.throws(()=>resourceLimits({maxTokens:0}));
});
