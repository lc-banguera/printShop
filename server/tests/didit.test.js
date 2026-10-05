const test = require('node:test');
const assert = require('node:assert/strict');
const crypto = require('node:crypto');

const { canonicalJson, verifyDiditWebhookSignature, mapDiditStatus } = require('../index');

test('Didit V3 signature verifier accepts canonical JSON with Unicode and rejects tampering', () => {
  const payload = { status: 'Approved', event_id: 'evt-1', metadata: { name: 'José' }, webhook_type: 'status.updated' };
  const secret = 'unit-test-didit-secret';
  const timestamp = String(Math.floor(Date.now() / 1000));
  const signature = crypto.createHmac('sha256', secret).update(canonicalJson(payload), 'utf8').digest('hex');
  const rawBody = Buffer.from(JSON.stringify(payload), 'utf8');

  assert.equal(verifyDiditWebhookSignature({ rawBody, signature, timestamp, secret }), true);
  assert.equal(verifyDiditWebhookSignature({ rawBody, signature: '0'.repeat(64), timestamp, secret }), false);
});

test('Didit status mapping only approves or rejects terminal Didit decisions', () => {
  assert.equal(mapDiditStatus('Approved'), 'APPROVED');
  assert.equal(mapDiditStatus('Declined'), 'REJECTED');
  assert.equal(mapDiditStatus('In Review'), 'IN_REVIEW');
  assert.equal(mapDiditStatus('In Progress'), 'PENDING');
  assert.equal(mapDiditStatus('Expired'), 'PENDING');
});
