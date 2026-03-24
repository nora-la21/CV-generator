require('dotenv').config();
const express = require('express');
const cors = require('cors');
const uploadRouter = require('./routes/upload');
const generateRouter = require('./routes/generate');

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors());
app.use(express.json({ limit: '10mb' }));

app.use('/api/upload', uploadRouter);
app.use('/api', generateRouter);

app.listen(PORT, () => {
  console.log(`CV Generator server running on http://localhost:${PORT}`);
});
