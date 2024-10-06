require('dotenv').config();
const express = require('express');
const app = express();
const fitbitRouter = require('./routes/fitbit');

app.set('view engine', 'ejs');
app.use(express.static('public'));  // Tạo các file tĩnh (CSS, JS)

app.use('/', fitbitRouter);  // Import route của Fitbit

const port = 3000;
app.listen(port, () => {
    console.log(`Server chạy tại http://localhost:${port}`);
});
