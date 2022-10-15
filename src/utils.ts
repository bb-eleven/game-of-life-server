import { NewsItem } from './news';

export const fromPercentage = (x: string) => Number(x.slice(0, -1));

export const toBoolean = (b: string) => b.toLowerCase() == 'true';

export const IS_POSITIVE_INDEX = 2;
export const TO_SHOW_INDEX = 3;
export const CONTENT_INDEX = 4;

export const toNewsItem = (row: any[]): NewsItem => {
  return {
    neutrality: Number(row[IS_POSITIVE_INDEX]),
    content: row[CONTENT_INDEX],
  };
};
