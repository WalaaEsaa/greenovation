const { Pool } = require('pg');

const db = new Pool({
    user: 'postgres',
    host: 'localhost',
    database: 'Greenovation',
    password: 'abdo4495',
    port: 5432,
});

async function resetDatabase() {
    try {
        console.log('🔄 Resetting database tables...');
        
        // Drop existing tables
        await db.query('DROP TABLE IF EXISTS requests CASCADE');
        await db.query('DROP TABLE IF EXISTS codes CASCADE');
        await db.query('DROP TABLE IF EXISTS offers CASCADE');
        await db.query('DROP TABLE IF EXISTS collectors CASCADE');
        await db.query('DROP TABLE IF EXISTS sellers CASCADE');
        await db.query('DROP TABLE IF EXISTS users CASCADE');
        
        console.log('🗑️ Tables dropped');
        
        // Create users table
        await db.query(`
            CREATE TABLE users (
                id SERIAL PRIMARY KEY,
                name VARCHAR(255),
                email VARCHAR(255) UNIQUE NOT NULL,
                password VARCHAR(255) NOT NULL,
                phone VARCHAR(20),
                balance DECIMAL(10,2) DEFAULT 0,
                points INTEGER DEFAULT 0,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
        `);
        console.log('✅ Users table created');

        // Create sellers table
        await db.query(`
            CREATE TABLE sellers (
                id SERIAL PRIMARY KEY,
                name VARCHAR(255),
                email VARCHAR(255) UNIQUE NOT NULL,
                password VARCHAR(255) NOT NULL,
                phone VARCHAR(20),
                registry VARCHAR(255),
                gps POINT,
                points INTEGER DEFAULT 0,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
        `);
        console.log('✅ Sellers table created');

        // Create collectors table
        await db.query(`
            CREATE TABLE collectors (
                id SERIAL PRIMARY KEY,
                name VARCHAR(255),
                email VARCHAR(255) UNIQUE NOT NULL,
                password VARCHAR(255) NOT NULL,
                phone VARCHAR(20),
                registry VARCHAR(255),
                gps POINT,
                points INTEGER DEFAULT 0,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
        `);
        console.log('✅ Collectors table created');

        // Create requests table
        await db.query(`
            CREATE TABLE requests (
                id SERIAL PRIMARY KEY,
                user_id INTEGER REFERENCES users(id),
                weight DECIMAL(10,2) NOT NULL,
                location VARCHAR(255) NOT NULL,
                description TEXT,
                gps POINT,
                status VARCHAR(50) DEFAULT 'pending',
                collector_id INTEGER REFERENCES collectors(id),
                collector_gps POINT,
                collected_at TIMESTAMP,
                completed_at TIMESTAMP,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
        `);
        console.log('✅ Requests table created');

        // Create offers table
        await db.query(`
            CREATE TABLE offers (
                id SERIAL PRIMARY KEY,
                seller_id INTEGER REFERENCES sellers(id),
                title VARCHAR(255) NOT NULL,
                description TEXT,
                price DECIMAL(10,2) NOT NULL,
                location VARCHAR(255) NOT NULL,
                gps POINT,
                material_type VARCHAR(50) DEFAULT 'plastic',
                status VARCHAR(50) DEFAULT 'active',
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
        `);
        console.log('✅ Offers table created');

        // Create indexes
        await db.query('CREATE INDEX idx_users_email ON users(email)');
        await db.query('CREATE INDEX idx_sellers_email ON sellers(email)');
        await db.query('CREATE INDEX idx_collectors_email ON collectors(email)');
        await db.query('CREATE INDEX idx_requests_user_id ON requests(user_id)');
        await db.query('CREATE INDEX idx_offers_seller_id ON offers(seller_id)');
        console.log('✅ Indexes created');

        console.log('🎉 Database reset completed successfully!');
        
    } catch (error) {
        console.error('❌ Error resetting database:', error);
    } finally {
        await db.end();
    }
}

resetDatabase();
