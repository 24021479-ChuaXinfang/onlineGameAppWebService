// include the required packages
const express = require('express');
const mysql = require('mysql2/promise');
require('dotenv').config();
const port = 3000;

const app = express();

// Use connection pool instead of creating new connection each time
const dbConfig = {
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    port: process.env.DB_PORT,
    waitForConnections: true,
    connectionLimit: 10, // smaller pool is fine
    queueLimit: 0,
};
const pool = mysql.createPool(dbConfig);

// CORS - allow all origins for React Native (can restrict later)
const cors = require("cors");
app.use(cors());
app.use(express.json());

// Start server
app.listen(port, () => console.log(`Server running on port ${port}`));

// --- Routes ---

// Get all games
app.get('/allgames', async (req, res) => {
    try {
        const [rows] = await pool.execute('SELECT * FROM games');
        res.json(rows);
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Server error for allgames' });
    }
});

// Add game
app.post('/addgame', async (req, res) => {
    const { game_name, game_cover, game_year } = req.body;
    try {
        await pool.execute(
            'INSERT INTO games (game_name, game_cover, game_year) VALUES (?, ?, ?)',
            [game_name, game_cover, game_year]
        );
        res.status(201).json({ message: `Game ${game_name} added successfully` });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: `Server error - could not add game ${game_name}` });
    }
});

// Delete game
app.delete('/deletegame/:id', async (req, res) => {
    const { id } = req.params;
    console.log("Delete request received for id:", id);

    try {
        const [result] = await pool.execute('DELETE FROM games WHERE id = ?', [id]);

        if (result.affectedRows === 0) {
            return res.status(404).json({ message: 'Game not found' });
        }

        res.json({ message: `Game ${id} deleted successfully` });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Server error deleting game' });
    }
});

// Update game
app.put('/updategame/:id', async (req, res) => {
    const { id } = req.params;
    const { game_name, game_cover, game_year } = req.body;
    console.log("Update request received:", req.body);

    try {
        const [result] = await pool.execute(
            'UPDATE games SET game_name = ?, game_cover = ?, game_year = ? WHERE id = ?',
            [game_name, game_cover, parseInt(game_year), id]
        );

        if (result.affectedRows === 0) {
            return res.status(404).json({ message: 'Game not found' });
        }

        res.json({ message: `Game ${id} updated successfully` });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Server error updating game' });
    }
});
