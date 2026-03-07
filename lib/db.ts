import postgres from 'postgres';

// prepare: false is required for Supabase transaction pooler (pgBouncer)
const sql = postgres(process.env.DATABASE_URL!, { prepare: false });

export default sql;
