const express = require('express');
const app = express();
const port = process.env.PORT || 3000;

app.use(express.json());

app.post('/webhook', (req, res) => {
    console.log('Webhook received:', req.body);
    res.status(200).send('Message received');
});

app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
});
