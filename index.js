const express = require('express');
const app = express();
const cors = require('cors');
require('dotenv').config();

const connectDB = require("./connectToMongo");
connectDB();

app.use(cors());
app.use(cors({
    origin: 'https://to-do-app-sksohail19.vercel.app/',
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    allowedHeaders: ['Content-Type', 'Authorization']
}))


app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use("/auth", require("./routes/auth"))
app.use("/list", require("./routes/list"));


app.listen(process.env.PORT, () => {
    console.log('Server is running on port 5000');
})
