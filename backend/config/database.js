require('dotenv').config();
const { Sequelize } = require('sequelize');
const path = require('path');

let sequelize;

if (process.env.SUPABASE_DB_URL) {
  // Connect to cloud Supabase PostgreSQL instance
  sequelize = new Sequelize(process.env.SUPABASE_DB_URL, {
    dialect: 'postgres',
    logging: false,
    dialectOptions: {
      ssl: {
        require: true,
        rejectUnauthorized: false // Required for hosted databases like Supabase/Render
      }
    }
  });
  console.log('[DATABASE] Initializing Supabase cloud PostgreSQL connection...');
} else {
  // Fallback to local SQLite for seamless local execution
  sequelize = new Sequelize({
    dialect: 'sqlite',
    storage: path.join(__dirname, '../evacsense.sqlite'),
    logging: false
  });
  console.log('[DATABASE] Initializing local SQLite connection...');
}

module.exports = sequelize;
