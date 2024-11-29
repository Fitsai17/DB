// db.js

const { Client } = require('pg');
const dotenv = require('dotenv');

// Завантаження змінних середовища
dotenv.config();

// Підключення до PostgreSQL
const client = new Client({
  user: process.env.PG_USER,
  host: process.env.PG_HOST,
  database: process.env.PG_DATABASE,
  password: process.env.PG_PASSWORD,
  port: process.env.PG_PORT
});

client.connect();

// Функція для оновлення комплектуючого
const updateComponent = async (id, name, type, price, quantity) => {
  const query = `
    UPDATE components 
    SET name = $1, type = $2, price = $3, quantity = $4 
    WHERE id = $5 RETURNING *;
  `;
  const values = [name, type, price, quantity, id];
  
  try {
    const result = await client.query(query, values);
    if (result.rowCount > 0) {
      console.log("Component updated:", result.rows[0]);
      return result.rows[0];
    } else {
      console.log("Component not found");
    }
  } catch (err) {
    console.error("Error updating component:", err);
  }
};

// Функція для додавання нового комплектуючого
const addComponent = async (name, type, price, quantity) => {
  const query = `
    INSERT INTO components (name, type, price, quantity) 
    VALUES ($1, $2, $3, $4) RETURNING *;
  `;
  const values = [name, type, price, quantity];
  
  try {
    const result = await client.query(query, values);
    console.log("Component added:", result.rows[0]);
    return result.rows[0];
  } catch (err) {
    console.error("Error adding component:", err);
  }
};

// Функція для отримання всіх комплектуючих
const getComponents = async () => {
  const query = 'SELECT * FROM components';
  
  try {
    const result = await client.query(query);
    console.log("All components:", result.rows);
    return result.rows;
  } catch (err) {
    console.error("Error fetching components:", err);
  }
};

// Функція для видалення комплектуючого
const deleteComponent = async (id) => {
  const query = 'DELETE FROM components WHERE id = $1 RETURNING *';
  
  try {
    const result = await client.query(query, [id]);
    if (result.rowCount > 0) {
      console.log("Component deleted:", result.rows[0]);
      return result.rows[0];
    } else {
      console.log("Component not found");
    }
  } catch (err) {
    console.error("Error deleting component:", err);
  }
};

// Експортуємо функції
module.exports = {
  updateComponent,
  addComponent,
  getComponents,
  deleteComponent
};
