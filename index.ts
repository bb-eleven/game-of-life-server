import express from 'express';
import cors from 'cors';
import { google } from 'googleapis';
import * as dotenv from 'dotenv';
dotenv.config();

const auth = new google.auth.GoogleAuth({
	keyFile: 'credentials.json',
	scopes: 'https://www.googleapis.com/auth/spreadsheets'
});

const sheets = google.sheets({
  version: 'v4',
  auth,
});

const request = {
  spreadsheetId: process.env.SHEET_ID,
  range: 'Sheet1!A2:B50',
  majorDimension: 'ROWS',
};

const PORT = 3000;
const app = express();

app.use(cors());
app.use(express.json()); // for parsing application/json
app.use(express.urlencoded({ extended: true })); // for parsing application/x-www-form-urlencoded

app.get("/leaderboards", async (req, res) => {
	const response = await sheets.spreadsheets.values.get(request);

  if (!response.data.values) {
    return [];
  }

	// map to LeaderboardEntry[], sorted by rank ascending, score descending
	let rank = 1;
	const leaderboards = response.data.values
		.map((row) => ({ name: row[0], score: Number(row[1]) }))
		.sort((a, b) => b.score - a.score)
		.map(entry => ({ rank: rank++, ...entry }));

  res.status(200).send(JSON.stringify({ leaderboards }));
});

app.listen(PORT, () => {
  console.log(`server started at port ${PORT}`);
});