const { getConnection } = require('./db');

// Функція для створення таблиці
const createTable = async () => {
    const client = await getConnection();
    try {
        const query = `
            CREATE TABLE IF NOT EXISTS employees (
                id SERIAL PRIMARY KEY,
                name VARCHAR(100) NOT NULL,
                position VARCHAR(50) NOT NULL,
                salary NUMERIC(10, 2) NOT NULL,
                hired_on DATE DEFAULT CURRENT_DATE
            );
        `;
        await client.query(query);
        console.log('Table "employees" created successfully.');
    } catch (error) {
        console.error('Error creating table:', error.message);
    } finally {
        client.release();
    }
};

// Функція для додавання нового співробітника
const addEmployee = async (name, position, salary) => {
    const client = await getConnection();
    try {
        const query = `
            INSERT INTO employees (name, position, salary)
            VALUES ($1, $2, $3) RETURNING id;
        `;
        const res = await client.query(query, [name, position, salary]);
        console.log(`Employee added with ID ${res.rows[0].id}`);
    } catch (error) {
        console.error('Error adding employee:', error.message);
    } finally {
        client.release();
    }
};

// Функція для отримання всіх співробітників
const getAllEmployees = async () => {
    const client = await getConnection();
    try {
        const query = 'SELECT * FROM employees;';
        const res = await client.query(query);
        console.log('Employees:', res.rows);
    } catch (error) {
        console.error('Error getting employees:', error.message);
    } finally {
        client.release();
    }
};

// Функція для оновлення зарплати співробітника
const updateEmployeeSalary = async (id, newSalary) => {
    const client = await getConnection();
    try {
        const query = 'UPDATE employees SET salary = $1 WHERE id = $2;';
        await client.query(query, [newSalary, id]);
        console.log(`Employee ID ${id} salary updated to ${newSalary}.`);
    } catch (error) {
        console.error('Error updating salary:', error.message);
    } finally {
        client.release();
    }
};

// Функція для видалення співробітника
const deleteEmployee = async (id) => {
    const client = await getConnection();
    try {
        const query = 'DELETE FROM employees WHERE id = $1;';
        await client.query(query, [id]);
        console.log(`Employee ID ${id} deleted.`);
    } catch (error) {
        console.error('Error deleting employee:', error.message);
    } finally {
        client.release();
    }
};

// Запуск прикладу використання CRUD операцій
const runExample = async () => {
    await createTable();

    // Додавання співробітників
    await addEmployee('John Doe', 'Software Engineer', 60000);
    await addEmployee('Jane Smith', 'Data Scientist', 70000);

    // Отримання всіх співробітників
    await getAllEmployees();

    // Оновлення зарплати
    await updateEmployeeSalary(1, 65000);

    // Видалення співробітника
    await deleteEmployee(2);

    // Отримання оновленого списку співробітників
    await getAllEmployees();
};

// Виконання прикладу
runExample();
