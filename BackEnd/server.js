const express = require('express');
const app = express();
const port = 3000;

const listings = [
    { name: 'Fresh Salmon', description: 'Caught this morning', price: '$10/kg' },
    { name: 'Tuna', description: 'High-quality tuna', price: '$12/kg' },
    { name: 'Mackerel', description: 'Fresh and tasty', price: '$8/kg' }
];

const prices = [
    { fish: 'Salmon', price: '$10/kg' },
    { fish: 'Tuna', price: '$12/kg' },
    { fish: 'Mackerel', price: '$8/kg' }
];

const orders = [
    { id: 1, status: 'Shipped' },
    { id: 2, status: 'Processing' },
    { id: 3, status: 'Delivered' }
];

const threads = [
    { title: 'Fishing Tips', content: 'Share your best fishing tips here!' },
    { title: 'Market Trends', content: 'Discuss the latest market trends.' }
];

app.use(express.static('public'));

app.get('/api/listings', (req, res) => {
    res.json(listings);
});

app.get('/api/prices', (req, res) => {
    res.json(prices);
});

app.get('/api/orders', (req, res) => {
    res.json(orders);
});

app.get('/api/threads', (req, res) => {
    res.json(threads);
});

app.listen(port, () => {
    console.log(`Server is running on http://localhost:${port}`);
});