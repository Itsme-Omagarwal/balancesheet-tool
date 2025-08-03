const express = require('express');
const cors = require('cors');
const authRoutes = require('./routes/auth');
const protectedRoutes = require('./routes/protected');
const uploadRoutes = require('./routes/upload');
const chatRoutes = require('./routes/chat');
require('dotenv').config();
const app = express();
app.use(cors({ origin: 'http://localhost:5173' }));


app.use(express.json());

app.use('/auth', authRoutes);
app.use('/', protectedRoutes);
app.use('/', uploadRoutes);
app.use('/chat', chatRoutes);

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
