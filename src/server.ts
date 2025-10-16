import app from './app';
import prisma from './utils/database';

const PORT = process.env.PORT || 3001;

// Simple function to connect to database
async function connectDatabase() {
  try {
    await prisma.$connect();
    console.log('✅ Database connected successfully');
  } catch (error) {
    console.error('❌ Database connection failed:', error);
    process.exit(1);
  }
}

// Function to start the server
async function startServer() {
  try {
    await connectDatabase();
    
    const server = app.listen(PORT, () => {
      console.log('🚀 ExpenseFlow API Server Started!');
      console.log(`📍 Server running on port ${PORT}`);
      console.log(`🌍 Environment: ${process.env.NODE_ENV || 'development'}`);
      console.log(`📚 API Documentation: http://localhost:${PORT}/api-docs`);
      console.log(`❤️  Health Check: http://localhost:${PORT}/health`);
      console.log('================================================');
    });

    // Simple graceful shutdown
    const gracefulShutdown = async () => {
      console.log('\n⏳ Gracefully shutting down...');
      
      server.close(async () => {
        console.log('🔌 HTTP server closed');
        
        try {
          await prisma.$disconnect();
          console.log('🗄️  Database disconnected');
        } catch (error) {
          console.error('❌ Error disconnecting from database:', error);
        }
        
        console.log('✅ Graceful shutdown completed');
        process.exit(0);
      });
    };

    // Handle shutdown signals
    process.on('SIGTERM', gracefulShutdown);
    process.on('SIGINT', gracefulShutdown);

  } catch (error) {
    console.error('❌ Failed to start server:', error);
    process.exit(1);
  }
}

// Start the application
startServer();

export { prisma };
