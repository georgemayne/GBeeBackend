const mongoose = require('mongoose');
require('dotenv').config();

const uri = process.env.MONGODB_URI;

const options = {
    serverSelectionTimeoutMS: 5000,
    maxPoolSize: 10,
    appName: 'GeeBee'
};

mongoose.connection.on('connected', () => {
    const dbName = mongoose.connection.name;
    console.log(`GeeBee connected to ${dbName} database`);
});

mongoose.connection.on('error', (err) => {
    console.error('GeeBee connection error:', err.message);
});

mongoose.connection.on('disconnected', () => {
    console.log('GeeBee disconnected');
});

process.on('SIGINT', async () => {
    await mongoose.connection.close();
    console.log('GeeBee connection closed through app termination');
    process.exit(0);
});

const connectWithRetry = async () => {
    try {
        await mongoose.connect(uri, options);
    } catch (error) {
        console.error('Failed to connect. Retrying in 5 seconds...', error.message);
        setTimeout(connectWithRetry, 5000);
    }
};

const connectDB = async () => {
    try {
        await connectWithRetry();
        console.log('GeeBeeDB Connected!');
    } catch (error) {
        console.error('Oops!!! Something went wrong:', error.message);
        process.exit(1);
    }
};

module.exports = connectDB;
