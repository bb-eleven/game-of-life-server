import express from 'express';
import cors from 'cors';
import { sheets } from './sheets';
import { createSheetsRequest, MajorDimension } from './sheets-request';
import { fromPercentage, toBoolean, toNewsItem, TO_SHOW_INDEX } from './utils';
import { News, NewsItem, NewsItemRow, RecurringNewsItems } from './news';
import { recaptchaenterprise } from 'googleapis/build/src/apis/recaptchaenterprise';
import { Key } from 'readline';

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

app.get('/news', async (req, res) => {
  // 9 rows
  const newsData = (await sheets.spreadsheets.values.get(createSheetsRequest('Website!G5:K13')))
    .data.values;

  const recurringNewsItems: RecurringNewsItems = {
    propertyValue: [],
    rentalYield: [],
    salesPitch: [],
    lifeInsurance: [],
  };

  if (!newsData) {
    res
      .status(200)
      .send(JSON.stringify({ news: { interestingInfo: null, ...recurringNewsItems } }));
    return;
  }

  const recurringNewsItemsKeys = Object.keys(recurringNewsItems);

  for (let i = 1; i < 9; i++) {
    const recurringNewsItemsRow = newsData[i];
    console.log(recurringNewsItemsRow);
    if (toBoolean(recurringNewsItemsRow[TO_SHOW_INDEX])) {
      recurringNewsItems[
        recurringNewsItemsKeys[Math.floor((i - 1) / 2)] as keyof RecurringNewsItems
      ].push(toNewsItem(recurringNewsItemsRow));
    }
  }

  let news: News = {
    ...recurringNewsItems,
    interestingInfo: null,
  };

  const interestingInfoRow = newsData[0];
  if (toBoolean(interestingInfoRow[TO_SHOW_INDEX])) {
    news.interestingInfo = toNewsItem(interestingInfoRow);
  }

  res.status(200).send(JSON.stringify({ news }));
});

app.listen(PORT, () => {
  console.log(`server started at port ${PORT}`);
});
