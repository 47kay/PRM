// add-retry-count.js
const { DataSource } = require('typeorm');
require('dotenv').config();

// Create a data source with the connection details
const dataSource = new DataSource({
  type: 'postgres',
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT || '5432'),
  username: process.env.DB_USERNAME || 'postgres',
  password: process.env.DB_PASSWORD || 'joseph',
  database: process.env.DB_DATABASE || 'prm_db',
  synchronize: false,
  logging: true,
});

async function addRetryCountColumn() {
  try {
    // Initialize the data source
    await dataSource.initialize();
    console.log('Connected to database');

    // Add the retryCount column
    await dataSource.query('ALTER TABLE notifications ADD COLUMN IF NOT EXISTS "retryCount" integer NOT NULL DEFAULT 0');
    console.log('retryCount column added successfully!');
  } catch (error) {
    console.error('Error adding column:', error);
  } finally {
    // Close the connection
    if (dataSource.isInitialized) {
      await dataSource.destroy();
      console.log('Database connection closed');
    }
  }
}

// Run the function
addRetryCountColumn()
  .then(() => process.exit(0))
  .catch(error => {
    console.error('Unhandled error:', error);
    process.exit(1);
  });