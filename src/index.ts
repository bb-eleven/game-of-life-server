import express from 'express';
import cors from 'cors';
import { sheets } from './sheets';
import { createSheetsRequest, MajorDimension } from './sheets-request';
import { fromPercentage } from './utils';

const PORT = 3000;
const app = express();

app.use(cors());
app.use(express.json()); // for parsing application/json
app.use(express.urlencoded({ extended: true })); // for parsing application/x-www-form-urlencoded

app.get('/leaderboards', async (req, res) => {
  const [names, scores] = (
    await Promise.all(
      ['ScoreSheet!C2:C50', 'ScoreSheet!E2:E50'].map((range) =>
        sheets.spreadsheets.values.get(createSheetsRequest(range))
      )
    )
  ).map((response) => response.data?.values?.map((values) => values[0]));

  if (!names || !scores || names.length !== scores.length) {
    res.status(500).send(
      JSON.stringify({
        error: "couldn't find names or scores, or they differed in length",
      })
    );
  } else {
    // map to LeaderboardEntry[], sorted by rank ascending, score descending
    let rank = 1;
    const leaderboards = names
      .map((name, index) => ({ name, score: Number(scores[index]) }))
      .sort((a, b) => b.score - a.score)
      .map((entry) => ({ rank: rank++, ...entry }));

    res.status(200).send(JSON.stringify({ leaderboards }));
  }
});

app.get('/day', async (req, res) => {
  let dayVal = (await sheets.spreadsheets.values.get(createSheetsRequest('Website!A2'))).data
    .values;
  let day: number;

  if (!dayVal) {
    day = 1;
  } else {
    day = Number(dayVal[0][0]);
    if (isNaN(day)) {
      day = 1;
    }
  }

  res.status(200).send(JSON.stringify({ day }));
});

app.get('/news/:day', async (req, res) => {
  let dayVal = req.params.day;
  let day: number;

  if (!dayVal) {
    day = 1;
  } else {
    day = Number(dayVal);
    if (isNaN(day)) {
      day = 1;
    } else if (day < 1) {
      day = 1;
    } else if (day > 10) {
      day = 10;
    }
  }

  // const recurringData = (await sheets.spreadsheets.values.get(createSheetsRequest()))
  const sheet = 'Daily Multipliers Tracking!';
  const getSalesPitchData = sheets.spreadsheets.values
    .get(createSheetsRequest(sheet + 'C7'))
    .then((response) => ({ salesPitch: fromPercentage(response?.data?.values?.[0][0]) }));

  const getPropertyInvestmentData = sheets.spreadsheets.values
    .get(createSheetsRequest(sheet + 'C9:C10', MajorDimension.COLUMNS))
    .then((response) => {
      const values = response?.data?.values?.[0];
      return {
        propertyInvestment: {
          rentalYield: fromPercentage(values?.[0]),
          propertyValue: fromPercentage(values?.[1]),
        },
      };
    });

  const getLifeInsurancePenaltyData = sheets.spreadsheets.values
    .get(createSheetsRequest(sheet + 'C15'))
    .then((response) => ({ lifeInsurancePenalty: Number(response?.data?.values?.[0][0]) }));

  const values = await Promise.all([
    getSalesPitchData,
    getPropertyInvestmentData,
    getLifeInsurancePenaltyData,
  ]);

  const recurringData = Object.assign({}, ...values);

  res.status(200).send(JSON.stringify({ recurringData }));
});

app.listen(PORT, () => {
  console.log(`server started at port ${PORT}`);
});
