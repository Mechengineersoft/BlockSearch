import { google } from "googleapis";
import { SearchResult, InsertUser, User } from "@shared/schema";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const SHEET_ID = process.env.GOOGLE_SHEETS_ID || "1ZIAN2F3he8QqMzqpeTnzbZ7nyv065ISZhp2f-eziebk";

const auth = new google.auth.GoogleAuth({
  credentials: JSON.parse(process.env.GOOGLE_SERVICE_ACCOUNT || '{}'),
  scopes: ['https://www.googleapis.com/auth/spreadsheets'],
});

if (!process.env.GOOGLE_SERVICE_ACCOUNT) {
  console.error('GOOGLE_SERVICE_ACCOUNT environment variable is not set');
}

if (!process.env.GOOGLE_SHEETS_ID) {
  console.error('GOOGLE_SHEETS_ID environment variable is not set');
}

const sheets = google.sheets({ version: 'v4', auth });

export async function searchSheetData(blockNo: string, partNo?: string, thickness?: string): Promise<SearchResult[]> {
  try {
    console.log('Starting search with params:', { blockNo, partNo, thickness });

    // Specify the exact range in the "Data" tab
    const range = "Data!A2:F"; // Columns A-F, starting from row 2
    console.log('Fetching from range:', range);

    const response = await sheets.spreadsheets.values.get({
      spreadsheetId: SHEET_ID,
      range,
    });

    if (!response.data.values) {
      console.log('No data found in sheet');
      return [];
    }

    console.log(`Found ${response.data.values.length} rows in sheet`);

    const results = response.data.values
      .filter(row => {
        if (!row[0]) {
          console.log('Skipping row with no block number');
          return false;
        }

        const rowBlockNo = row[0].toString().toLowerCase();
        const rowPartNo = row[1]?.toString().toLowerCase() || '';
        const rowThickness = row[2]?.toString().toLowerCase() || '';

        const matchesBlock = rowBlockNo === blockNo.toLowerCase();
        const matchesPart = !partNo || rowPartNo === partNo.toLowerCase();
        const matchesThickness = !thickness || rowThickness === thickness.toLowerCase();

        const matches = matchesBlock && matchesPart && matchesThickness;
        if (matches) {
          console.log('Found matching row:', row);
        }

        return matches;
      })
      .map((row): SearchResult => ({
        blockNo: row[0],
        partNo: row[1] || '',
        thickness: row[2] || '',
        nos: row[3] || '',
        color1: row[4] || '',
        color2: row[5] || ''
      }));

    console.log(`Returning ${results.length} results`);
    return results;
  } catch (error) {
    console.error('Error in searchSheetData:', error);
    throw error;
  }
}

export async function getUserByUsername(username: string): Promise<User | undefined> {
  try {
    const range = "User!A2:C";
    const response = await sheets.spreadsheets.values.get({
      spreadsheetId: SHEET_ID,
      range,
    });

    const values = response.data.values || [];
    const userRow = values.find((row) => row[1]?.toString().toLowerCase() === username.toLowerCase());

    if (!userRow) return undefined;

    return {
      id: parseInt(userRow[0]),
      username: userRow[1],
      password: userRow[2]
    };
  } catch (error) {
    console.error('Error in getUserByUsername:', error);
    return undefined;
  }
}

export async function getUser(id: number): Promise<User | undefined> {
  try {
    const range = "User!A2:C";
    const response = await sheets.spreadsheets.values.get({
      spreadsheetId: SHEET_ID,
      range,
    });

    const values = response.data.values || [];
    const userRow = values.find((row) => parseInt(row[0]) === id);

    if (!userRow) return undefined;

    return {
      id: parseInt(userRow[0]),
      username: userRow[1],
      password: userRow[2]
    };
  } catch (error) {
    console.error('Error in getUser:', error);
    return undefined;
  }
}

export async function createUser(user: InsertUser): Promise<User> {
  try {
    // Get current users to determine next ID
    const range = "User!A2:C";
    const response = await sheets.spreadsheets.values.get({
      spreadsheetId: SHEET_ID,
      range,
    });

    const values = response.data.values || [];
    const newId = values.length > 0 
      ? Math.max(...values.map(row => parseInt(row[0] || '0'))) + 1 
      : 1;

    const newUser: User = {
      id: newId,
      username: user.username,
      password: user.password
    };

    // Append new user
    await sheets.spreadsheets.values.append({
      spreadsheetId: SHEET_ID,
      range: "User!A:C",
      valueInputOption: "RAW",
      requestBody: {
        values: [[newUser.id, newUser.username, newUser.password]]
      }
    });

    return newUser;
  } catch (error) {
    console.error('Error in createUser:', error);
    throw new Error('Failed to create user');
  }
}