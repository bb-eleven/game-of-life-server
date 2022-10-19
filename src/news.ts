export interface NewsItem {
  neutrality: number;
  content: string;
}

export interface NewsItemGroup {
  name: string;
  items: NewsItem[];
}

export type News = NewsItemGroup[];
