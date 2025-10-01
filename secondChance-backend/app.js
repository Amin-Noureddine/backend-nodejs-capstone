/* jshint esversion: 8 */
require('dotenv').config();
const express = require('express');
const cors = require('cors');
const pinoLogger = require('./logger');

const connectToDatabase = require('./models/db');
const { loadData } = require("./util/import-mongo/index");

const app = express();
app.use("*", cors());
app.use(express.json());

const port = 3060;

// Connect to MongoDB
connectToDatabase()
    .then(() => {
        pinoLogger.info('Connected to DB');
    })
    .catch((e) => console.error('Failed to connect to DB', e));

// Route files

// Items API: secondChanceItemsRoutes
const secondChanceItemsRoutes = require('./routes/secondChanceItemsRoutes');

// Search API routes
const searchRoutes = require('./routes/searchRoutes');

// Logger middleware
const pinoHttp = require('pino-http');
const logger = require('./logger');
app.use(pinoHttp({ logger }));

// Use Routes

// Items routes
app.use('/api/secondchance/items', secondChanceItemsRoutes);

// Search routes
app.use('/api/search', searchRoutes);

// Global Error Handler
app.use((err, req, res, next) => {
    console.error(err);
    res.status(500).send('Internal Server Error');
});

// Test route
app.get("/", (req, res) => {
    res.send("Inside the server");
});

// Start server
app.listen(port, () => {
    console.log(`Server running on port ${port}`);
});
