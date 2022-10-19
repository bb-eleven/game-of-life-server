import { NewsItem } from './news';

export const fromPercentage = (x: string) => Number(x.slice(0, -1));

export const toBoolean = (b: string) => b.toLowerCase() == 'true';

export const NEUTRALITY_INDEX = 2;
export const TO_SHOW_INDEX = 3;
export const CONTENT_INDEX = 4;

export const toNewsItem = (newsItemData: any[]): NewsItem | null => {
  if (!newsItemData[CONTENT_INDEX] || !toBoolean(newsItemData[TO_SHOW_INDEX])) {
    return null;
  }
  return {
    neutrality: Number(newsItemData[NEUTRALITY_INDEX]),
    content: newsItemData[CONTENT_INDEX],
  };
};
