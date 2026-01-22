const express = require('express');
const mysql = require('mysql2/promise');
const cors = require('cors');
require('dotenv').config();

const port = 3000;

// database config info
const dbConfig = {
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    port: process.env.DB_PORT,
    waitForConnections: true,
    connectionLimit: 100,
    queueLimit: 0,
};

const app = express();

// Enable CORS
app.use(cors());
app.use(express.json());

// Start server
app.listen(port, () => {
    console.log(`Server running on port ${port}`);
});

// Get all games
app.get('/allgames', async (req, res) => {
    try {
        const connection = await mysql.createConnection(dbConfig);
        const [rows] = await connection.execute('SELECT * FROM games');
        res.json(rows);
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Server error fetching games' });
    }
});

// Add game
app.post('/addgame', async (req, res) => {
    const { game_name, game_cover, game_year } = req.body;
    try {
        const connection = await mysql.createConnection(dbConfig);
        await connection.execute(
            'INSERT INTO games (game_name, game_cover, game_year) VALUES (?, ?, ?)',
            [game_name, game_cover, parseInt(game_year)]
        );
        res.status(201).json({ message: `Game ${game_name} added successfully` });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Server error adding game' });
    }
});

// Update game
app.put('/updategame/:id', async (req, res) => {
    const { id } = req.params;
    const { game_name, game_cover, game_year } = req.body;

    try {
        const connection = await mysql.createConnection(dbConfig);
        const [result] = await connection.execute(
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

// Delete game
app.delete('/deletegame/:id', async (req, res) => {
    const { id } = req.params;

    try {
        const connection = await mysql.createConnection(dbConfig);
        const [result] = await connection.execute(
            'DELETE FROM games WHERE id = ?',
            [id]
        );

        if (result.affectedRows === 0) {
            return res.status(404).json({ message: 'Game not found' });
        }

        res.json({ message: `Game ${id} deleted successfully` });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Server error deleting game' });
    }
});