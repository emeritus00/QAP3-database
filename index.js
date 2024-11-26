const express = require("express");
const app = express();
const PORT = 3000;
const { Pool } = require("pg");

app.use(express.json());

const pool = new Pool({
  user: "adewalegbadamosi",
  host: "localhost",
  database: "postgres",
  password: "Walexsai.00",
  port: 5432,
});

let tasks = [
  { id: 1, description: "Buy groceries", status: "incomplete" },
  { id: 2, description: "Read a book", status: "complete" },
];

const createTable = async () => {
  const query = `
        CREATE TABLE IF NOT EXISTS tasks (
            id SERIAL PRIMARY KEY,
            description TEXT NOT NULL,
            status TEXT NOT NULL
        );
    `;
  await pool.query(query);
  console.log('Table "tasks" is ready');
};

createTable().catch((err) => {
  console.error("Error creating table:", err);
  process.exit(1);
});

// GET /tasks - Get all tasks
app.get("/tasks", async (request, response) => {
  try {
    const task = await pool.query("SELECT * FROM tasks");
    response.json(task.rows);
  } catch (error) {
    console.error(error);
    response.status(500).json({ error: "Error fetching tasks" });
  }
});

// POST /tasks - Add a new task
app.post("/tasks", async (request, response) => {
  const { description, status } = request.body;

  if (!description || !status) {
    return response
      .status(400)
      .json({ error: "Description and status are required" });
  }

  try {
    const result = await pool.query(
      "INSERT INTO tasks (description, status) VALUES ($1, $2) RETURNING *",
      [description, status]
    );
    response
      .status(201)
      .json({ message: "Task added successfully", task: result.rows[0] });
  } catch (error) {
    console.error(error);
    response.status(500).json({ error: "Error adding task" });
  }
});

// PUT /tasks/:id - Update a task's status
app.put("/tasks/:id", async (request, response) => {
  const taskId = parseInt(request.params.id, 10);
  const { status } = request.body;

  if (!status) {
    return res.status(400).json({ error: "Status is required" });
  }

  try {
    const result = await pool.query(
      "UPDATE tasks SET status = $1 WHERE id = $2 RETURNING *",
      [status, taskId]
    );

    if (result.rowCount === 0) {
      return response.status(404).json({ error: "Task not found" });
    }

    response.json({
      message: "Task updated successfully",
      task: result.rows[0],
    });
  } catch (error) {
    console.error(error);
    response.status(500).json({ error: "Error updating task" });
  }
});

// DELETE /tasks/:id - Delete a task
app.delete("/tasks/:id", async (request, response) => {
  const taskId = parseInt(request.params.id, 10);

  try {
    const result = await pool.query(
      "DELETE FROM tasks WHERE id = $1 RETURNING *",
      [taskId]
    );

    if (result.rowCount === 0) {
      return response.status(404).json({ error: "Task not found" });
    }

    response.json({
      message: "Task deleted successfully",
      task: result.rows[0],
    });
  } catch (error) {
    console.error(error);
    response.status(500).json({ error: "Error deleting task" });
  }
});

app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
