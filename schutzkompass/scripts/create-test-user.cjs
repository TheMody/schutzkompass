#!/usr/bin/env node
// Create a test user directly via the database
const bcrypt = require('bcryptjs');
const { execSync } = require('child_process');

const hash = bcrypt.hashSync('Test1234!', 10);
const orgId = '00000000-0000-0000-0000-000000000001';
const userId = '00000000-0000-0000-0000-000000000002';

const sql1 = `INSERT INTO organisations (id, name, created_at, updated_at) VALUES ('${orgId}', 'Test GmbH', NOW(), NOW()) ON CONFLICT (id) DO NOTHING;`;
const sql2 = `INSERT INTO users (id, name, email, password_hash, organisation_id, role, created_at, updated_at) VALUES ('${userId}', 'Test User', 'test@test.de', '${hash}', '${orgId}', 'admin', NOW(), NOW()) ON CONFLICT (email) DO UPDATE SET password_hash = EXCLUDED.password_hash;`;

try {
  execSync(`sudo docker exec docker_db_1 psql -U schutzkompass -d schutzkompass -c "${sql1}"`, { stdio: 'inherit' });
  execSync(`sudo docker exec docker_db_1 psql -U schutzkompass -d schutzkompass -c "${sql2}"`, { stdio: 'inherit' });
  console.log('\n✅ Test user created! Login: test@test.de / Test1234!');
} catch (e) {
  console.error('Error:', e.message);
}
