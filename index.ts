import express from 'express';
import cors from 'cors';
import * as dotenv from 'dotenv';
dotenv.config();

const PORT = 3000;
const app = express();

app.use(cors());
app.use(express.json()); // for parsing application/json
app.use(express.urlencoded({ extended: true })); // for parsing application/x-www-form-urlencoded

app.listen(PORT, () => {
  console.log(`server started at port ${PORT}`);
});