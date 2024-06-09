const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
require('dotenv').config();
const connectDB = require('./gbeedb');


const app = express();
connectDB();
const PORT = process.env.PORT;

// Enhanced security and logging middleware
app.use(helmet());  // Helps secure Express apps with various HTTP headers
app.use(cors());   // Enables CORS for all routes
app.use(morgan('dev'));  // Logs HTTP requests

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Routes
app.get('/', (req, res) => {
    res.send('GeeBee API is running');
});

// API routes
app.use('/user', require('./BackEnd/routes/userRoute'));
// Add more routes as needed

// 404 - Not Found
app.use((req, res, next) => {
    res.status(404).send('Page Not Found');
});

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});

// Handle uncaught exceptions
process.on('uncaughtException', (err) => {
    console.error('Uncaught Exception:', err);
    process.exit(1);
});

// Handle unhandled promise rejections
process.on('unhandledRejection', (reason, promise) => {
    console.error('Unhandled Rejection at:', promise, 'reason:', reason);
    process.exit(1);
});