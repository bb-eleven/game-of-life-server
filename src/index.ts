import express from 'express';
import cors from 'cors';
import { sheets } from './sheets';
import { createSheetsRequest } from './sheets-request';

const PORT = 3000;
const app = express();

app.use(cors());
app.use(express.json()); // for parsing application/json
app.use(express.urlencoded({ extended: true })); // for parsing application/x-www-form-urlencoded

app.get("/leaderboards", async (req, res) => {
  const [names, scores] = (await Promise.all(['ScoreSheet!C2:C50', 'ScoreSheet!E2:E50']
    .map(range => sheets.spreadsheets.values.get(createSheetsRequest(range)))))
    .map(response => response.data?.values?.map(values => values[0]));

  if (!names || !scores || names.length !== scores.length) {
    res.status(500).send(JSON.stringify({ error: 'couldn\'t find names or scores, or they differed in length' }));
  } else {
    // map to LeaderboardEntry[], sorted by rank ascending, score descending
    let rank = 1;
    const leaderboards = names
      .map((name, index) => ({ name, score: Number(scores[index]) }))
      .sort((a, b) => b.score - a.score)
      .map(entry => ({ rank: rank++, ...entry }));

    res.status(200).send(JSON.stringify({ leaderboards }));
  }
});

app.listen(PORT, () => {
  console.log(`server started at port ${PORT}`);
});