const fastify = require('fastify')();
const { Client } = require('pg');
require('dotenv').config();

// Підключення до PostgreSQL
const client = new Client({
  user: process.env.PG_USER,
  host: process.env.PG_HOST,
  database: process.env.PG_DATABASE,
  password: process.env.PG_PASSWORD,
  port: process.env.PG_PORT,
});

// Підключення до бази даних
client.connect()
  .then(() => {
    console.log('PostgreSQL connected');
    // Викликаємо створення таблиці після підключення до бази даних
    createTable();
  })
  .catch((err) => console.error('Error connecting to PostgreSQL:', err));

// Функція для створення таблиці
const createTable = async () => {
  const query = `
    CREATE TABLE IF NOT EXISTS components (
      id SERIAL PRIMARY KEY,
      name VARCHAR(100) NOT NULL,
      type VARCHAR(50),
      price NUMERIC(10, 2),  -- Зміна на NUMERIC для підтримки дробових значень
      quantity INTEGER
    );
  `;
  console.log("Creating table...");
  try {
    await client.query(query);
    console.log('Table created or already exists');
  } catch (err) {
    console.error('Error creating table:', err);
  }
};

// Додавання JSON-парсера
fastify.addContentTypeParser('application/json', { parseAs: 'string' }, (req, body, done) => {
  try {
    const parsed = JSON.parse(body);
    done(null, parsed);
  } catch (error) {
    error.statusCode = 400;
    done(error, undefined);
  }
});

// Створення нового компонента
fastify.post('/components', async (request, reply) => {
  const { name, type, price, quantity } = request.body;
  const query = `
    INSERT INTO components (name, type, price, quantity) 
    VALUES ($1, $2, $3, $4) RETURNING *;
  `;
  const values = [name, type, price, quantity];

  try {
    const result = await client.query(query, values);
    reply.status(201).send({ message: 'Component added', component: result.rows[0] });
  } catch (err) {
    console.error("Error adding component:", err);
    reply.status(500).send({ error: 'Internal server error' });
  }
});

// Отримання компонентів
fastify.get('/components', async (request, reply) => {
  try {
    const result = await client.query('SELECT * FROM components');
    reply.send(result.rows);
  } catch (err) {
    console.error("Error fetching components:", err);
    reply.status(500).send({ error: 'Internal server error' });
  }
});

// Запуск сервера
fastify.listen({ port: 3000, host: '0.0.0.0' }, (err, address) => {
  if (err) {
    console.error(err);
    process.exit(1);
  }
  console.log(`Server listening at ${address}`);
});
