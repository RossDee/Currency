import axios from 'axios';
import * as cheerio from 'cheerio';

export interface ExchangeRate {
  currency: string;
  name: string;
  buyingRate: number;
  cashBuyingRate: number;
  sellingRate: number;
  cashSellingRate: number;
  middleRate: number;
  pubTime: string;
}

export class CurrencyService {
  private static instance: CurrencyService;
  private readonly API_URL = '/api/exchange-rates';
  private cache: {
    rates: ExchangeRate[];
    timestamp: number;
  } | null = null;
  private readonly CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

  private constructor() {}

  public static getInstance(): CurrencyService {
    if (!CurrencyService.instance) {
      CurrencyService.instance = new CurrencyService();
    }
    return CurrencyService.instance;
  }

  public async getExchangeRates(): Promise<ExchangeRate[]> {
    try {
      // Check cache first
      if (this.cache && Date.now() - this.cache.timestamp < this.CACHE_DURATION) {
        return this.cache.rates;
      }

      const response = await axios.get<ExchangeRate[]>(this.API_URL);
      const rates = response.data;
      
      // Update cache
      this.cache = {
        rates,
        timestamp: Date.now()
      };
      
      return rates;
    } catch (error) {
      console.error('Error fetching exchange rates:', error);
      throw new Error('Failed to fetch exchange rates');
    }
  }

  public async getHistoricalRates(currency: string, startDate: Date, endDate: Date): Promise<ExchangeRate[]> {
    // TODO: Implement historical data fetching
    throw new Error('Historical rates not implemented yet');
  }
}
