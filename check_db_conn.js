const { Client } = require('pg');

async function check(url, name) {
    console.log(`Checking ${name}...`);
    const client = new Client({
        connectionString: url,
    });
    try {
        await client.connect();
        console.log(`${name} connected successfully!`);
        await client.end();
    } catch (err) {
        console.error(`${name} failed:`, err.message);
    }
}

const dbUrl = "postgresql://postgres.lqsygohyrletkhkzwvhq:EXvQKtNsVSoGNd1Z@aws-1-ap-southeast-2.pooler.supabase.com:6543/postgres?pgbouncer=true";
const directUrl = "postgresql://postgres.lqsygohyrletkhkzwvhq:EXvQKtNsVSoGNd1Z@aws-1-ap-southeast-2.pooler.supabase.com:5432/postgres";

check(dbUrl, "DATABASE_URL");
check(directUrl, "DIRECT_URL");
