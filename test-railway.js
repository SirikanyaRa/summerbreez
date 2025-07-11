// Quick test for Railway deployment
import express from 'express';
import cors from 'cors';

console.log('✅ Testing core imports...');

const app = express();
const PORT = process.env.PORT || 3000;

// Basic middleware
app.use(cors());
app.use(express.json());

// Test route
app.get('/test', (req, res) => {
  res.json({ 
    status: 'working',
    message: 'Railway deployment test successful',
    timestamp: new Date().toISOString()
  });
});

console.log('✅ All imports successful');
console.log('✅ Express app configured');
console.log('✅ Ready for Railway deployment');

// Don't start server, just test imports
process.exit(0);
