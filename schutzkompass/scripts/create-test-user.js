// Create test user script
const { execSync } = require('child_process');

// Use curl to register via the register page's server action
// Since the registration uses server actions (not a REST API), we need to
// directly insert a test user into the database
const bcrypt = require('bcryptjs');

async function main() {
  // We'll use the psql command to insert a test user
  const hash = await bcrypt.hash('Test1234!', 10);
  console.log('Hash:', hash);
  
  const orgId = '00000000-0000-0000-0000-000000000001';
  const userId = '00000000-0000-0000-0000-000000000002';
  
  const orgSql = `INSERT INTO organisations (id, name, created_at, updated_at) VALUES ('${orgId}', 'Test GmbH', NOW(), NOW()) ON CONFLICT (id) DO NOTHING;`;
  const userSql = `INSERT INTO users (id, name, email, password_hash, organisation_id, role, created_at, updated_at) VALUES ('${userId}', 'Test User', 'test@test.de', '${hash}', '${orgId}', 'admin', NOW(), NOW()) ON CONFLICT (email) DO NOTHING;`;
  
  console.log('Creating test org and user...');
  try {
    execSync(`sudo docker exec docker_db_1 psql -U schutzkompass -d schutzkompass -c "${orgSql}"`, { stdio: 'inherit' });
    execSync(`sudo docker exec docker_db_1 psql -U schutzkompass -d schutzkompass -c "${userSql}"`, { stdio: 'inherit' });
    console.log('Done! Login with: test@test.de / Test1234!');
  } catch(e) {
    console.error('Error:', e.message);
  }
}

main();
