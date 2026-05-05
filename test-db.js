const { createClient } = require('@libsql/client');

async function main() {
  const db = createClient({ url: 'file:./prisma/dev.db' });
  const users = await db.execute("SELECT email, firstName, lastName, role FROM users");
  console.log('Users in DB (' + users.rows.length + '):');
  for (const u of users.rows) {
    console.log('  ' + u.email + ' (' + u.role + ')');
  }
}

main();
