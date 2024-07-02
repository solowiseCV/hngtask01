import express, { urlencoded } from 'express';
import dotenv from 'dotenv';
import router from './src/routes/router.js';
import cors from 'cors'
import { errorHandler } from './src/middlewares/error.middleware.js';

dotenv.config();
const app = express();
const Port = process.env.PORT || 8000;

// Use the IP extraction middleware

app.use(cors());
app.use(express.json());
app.use(urlencoded({ extended: false }));


app.use('/', router);
app.get("/", (req, res) => {
    res.send("Welcome to HNG stage1 task home route, Enjoy 🔥");
  });

  app.use(errorHandler);

app.listen(Port, () => {
    console.log(`Server is running on port ${Port}`);
});
