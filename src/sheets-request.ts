import * as dotenv from 'dotenv';
dotenv.config();

export interface SheetsRequest {
  spreadsheetId: string;
  range: string;
  majorDimension: MajorDimension;
}

export enum MajorDimension {
  ROWS = 'ROWS',
  COLUMNS = 'COLUMNS',
}

export const createSheetsRequest = (
  range: string,
  majorDimension?: MajorDimension
): SheetsRequest => ({
  spreadsheetId: process.env.SHEET_ID as string,
  range,
  majorDimension: majorDimension ?? MajorDimension.ROWS,
});
