require('dotenv').config();
const express = require('express');
const cors = require('cors');
const donorRoutes = require('./src/routes/donorRoutes');
const adminRoutes = require('./src/routes/adminRoutes');
const ngoRoutes = require('./src/routes/ngoRoutes');
const foodRoutes = require('./src/routes/foodRoutes');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 5000;

app.use(express.json());
app.use(cors());

app.use('/uploads', express.static(path.join(__dirname, 'uploads')));
app.use('/uploads/ngo_docs', express.static(path.join(__dirname, 'src', 'uploads', 'ngo_docs')));

app.use('/api/donors', donorRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/ngo', ngoRoutes);
app.use('/api/food', foodRoutes);

app.get('/', (req, res) => {
    res.send('Welcome to the Surplus Food Distribution API!');
});

app.listen(PORT, () => console.log(`Server running on port ${PORT}`));