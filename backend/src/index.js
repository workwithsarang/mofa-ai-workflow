require('dotenv').config();
const express = require('express');
const cors = require('cors');
const { setupSwagger } = require('./swagger/swagger');

const authRoutes = require('./routes/auth');
const agentRoutes = require('./routes/agents');
const workflowRoutes = require('./routes/workflows');

const app = express();

app.use(cors({
  origin: '*',
  allowedHeaders: ['Content-Type', 'Authorization', 'x-vercel-protection-bypass'],
}));
app.use(express.json());

// API docs
setupSwagger(app);

// Routes
app.use('/auth', authRoutes);
app.use('/agents', agentRoutes);
app.use('/workflows', workflowRoutes);

// Health check
app.get('/health', (_req, res) => res.json({ status: 'ok' }));

const PORT = process.env.PORT || 5000;
if (process.env.NODE_ENV !== 'production' || !process.env.VERCEL) {
  app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
    console.log(`Swagger docs at http://localhost:${PORT}/api-docs`);
  });
}

module.exports = app;
