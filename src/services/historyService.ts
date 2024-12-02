import fs from 'fs';
import path from 'path';
import { ExchangeRate } from './currencyService';

const DATA_DIR = path.join(process.cwd(), 'data');
const HISTORY_FILE = path.join(DATA_DIR, 'exchange_history.json');

interface HistoricalData {
  [currency: string]: {
    buyingRate: number;
    sellingRate: number;
    middleRate: number;
    timestamp: string;
  }[];
}

export async function initializeDataDirectory() {
  if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true });
  }
  if (!fs.existsSync(HISTORY_FILE)) {
    fs.writeFileSync(HISTORY_FILE, JSON.stringify({}));
  }
}

export async function saveExchangeRate(rate: ExchangeRate) {
  await initializeDataDirectory();
  
  let history: HistoricalData = {};
  try {
    const data = fs.readFileSync(HISTORY_FILE, 'utf-8');
    history = JSON.parse(data);
  } catch (error) {
    console.error('Error reading history file:', error);
  }

  if (!history[rate.currency]) {
    history[rate.currency] = [];
  }

  // Add new data point
  history[rate.currency].push({
    buyingRate: parseFloat(rate.buyingRate),
    sellingRate: parseFloat(rate.sellingRate),
    middleRate: parseFloat(rate.middleRate),
    timestamp: new Date().toISOString()
  });

  // Keep only last 30 days of data
  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
  history[rate.currency] = history[rate.currency].filter(
    data => new Date(data.timestamp) > thirtyDaysAgo
  );

  try {
    fs.writeFileSync(HISTORY_FILE, JSON.stringify(history, null, 2));
  } catch (error) {
    console.error('Error writing history file:', error);
  }
}

export async function getExchangeRateHistory(currency: string) {
  await initializeDataDirectory();
  
  try {
    const data = fs.readFileSync(HISTORY_FILE, 'utf-8');
    const history: HistoricalData = JSON.parse(data);
    return history[currency] || [];
  } catch (error) {
    console.error('Error reading history file:', error);
    return [];
  }
}
