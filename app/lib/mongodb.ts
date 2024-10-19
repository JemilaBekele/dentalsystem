import mongoose from 'mongoose';

export async function connect() {
    try {
        await mongoose.connect(process.env.DATABASE_URL!, {
            // Removed deprecated options
        });

        const connection = mongoose.connection;
// Set the maximum number of listeners to avoid memory leak warnings
                connection.setMaxListeners(30);
        connection.on('connected', () => {
            console.log('MongoDB connected successfully');
        });

        connection.on('error', (err) => {
            console.error('MongoDB connection error:', err);
            process.exit(1); // Exit with error code
        });

    } catch (error) {
        console.error('Error connecting to MongoDB:', error);
        process.exit(1); // Exit with error code
    }
}