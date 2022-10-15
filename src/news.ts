export interface NewsItem {
  neutrality: number;
  content: string;
}

export type NewsItemRow = NewsItem[];

export interface News extends RecurringNewsItems {
  interestingInfo: NewsItem | null;
}

export interface RecurringNewsItems {
  propertyValue: NewsItemRow;
  rentalYield: NewsItemRow;
  salesPitch: NewsItemRow;
  lifeInsurance: NewsItemRow;
}
