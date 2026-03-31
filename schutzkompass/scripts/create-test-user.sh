#!/bin/bash
cd /home/philipkenneweg/Documents/schutzschild/schutzkompass/apps/web
HASH=$(node -e "console.log(require('bcryptjs').hashSync('Test1234!',10))")
echo "HASH=$HASH"

ORGID="00000000-0000-0000-0000-000000000001"
USERID="00000000-0000-0000-0000-000000000002"

sudo docker exec docker_db_1 psql -U schutzkompass -d schutzkompass -c \
  "INSERT INTO organisations (id, name, created_at, updated_at) VALUES ('$ORGID', 'Test GmbH', NOW(), NOW()) ON CONFLICT (id) DO NOTHING;"

sudo docker exec docker_db_1 psql -U schutzkompass -d schutzkompass -c \
  "INSERT INTO users (id, name, email, password_hash, organisation_id, role, created_at, updated_at) VALUES ('$USERID', 'Test User', 'test@test.de', '$HASH', '$ORGID', 'admin', NOW(), NOW()) ON CONFLICT (email) DO UPDATE SET password_hash='$HASH';"

echo "Done! Login with test@test.de / Test1234!"
