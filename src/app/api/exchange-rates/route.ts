import { NextResponse } from 'next/server';
import axios from 'axios';
import * as cheerio from 'cheerio';

interface ExchangeRate {
  currency: string;
  name: string;
  buyingRate: number;
  cashBuyingRate: number;
  sellingRate: number;
  cashSellingRate: number;
  middleRate: number;
  pubTime: string;
}

// Initial data for fallback
const initialRates: ExchangeRate[] = [
  {
    currency: 'SEK',
    name: 'Swedish Krona',
    buyingRate: 65.83,
    cashBuyingRate: 65.83,
    sellingRate: 66.35,
    cashSellingRate: 66.35,
    middleRate: 65.88,
    pubTime: '2024.12.02 22:38:59'
  }
];

async function fetchCIBRates(): Promise<ExchangeRate[]> {
  try {
    const response = await axios.get('https://personalbank.cib.com.cn/pers/main/pubinfo/ifxQuotationQuery.do', {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8',
        'Accept-Language': 'zh-CN,zh;q=0.9,en;q=0.8',
        'Cache-Control': 'no-cache',
        'Pragma': 'no-cache',
      },
    });

    const $ = cheerio.load(response.data);
    const rates: ExchangeRate[] = [];

    // CIB exchange rate table parsing
    $('table.lst tr').each((_, row) => {
      const cells = $(row).find('td');
      if (cells.length >= 6) {
        const rowData = cells.map((_, cell) => $(cell).text().trim()).get();
        
        // Skip header row and empty rows
        if (rowData[0] && !isNaN(parseFloat(rowData[3]))) {
          rates.push({
            currency: rowData[0],
            name: rowData[1] || rowData[0],
            buyingRate: parseFloat(rowData[3]) || 0,
            cashBuyingRate: parseFloat(rowData[3]) || 0,
            sellingRate: parseFloat(rowData[4]) || 0,
            cashSellingRate: parseFloat(rowData[4]) || 0,
            middleRate: (parseFloat(rowData[3]) + parseFloat(rowData[4])) / 2 || 0,
            pubTime: new Date().toISOString()
          });
        }
      }
    });

    if (rates.length > 0) {
      console.log(`Successfully parsed ${rates.length} CIB exchange rates`);
      return rates;
    }
    throw new Error('No CIB rates found in the response');
  } catch (error) {
    console.error('Error fetching CIB rates:', error);
    throw error;
  }
}

export async function GET() {
  try {
    console.log('Attempting to fetch BOC exchange rates...');

    const response = await axios.get('https://www.bankofchina.com/sourcedb/whpj/enindex_1619.html', {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8',
        'Accept-Language': 'en-US,en;q=0.9',
        'Cache-Control': 'no-cache',
        'Pragma': 'no-cache',
        'Referer': 'https://www.bankofchina.com/',
        'Origin': 'https://www.bankofchina.com',
      },
      maxRedirects: 5,
      validateStatus: function (status) {
        return status >= 200 && status < 400; // Accept redirects
      }
    });

    console.log('Response status:', response.status);
    console.log('Response URL:', response.request?.res?.responseUrl);

    const $ = cheerio.load(response.data);
    const rates: ExchangeRate[] = [];

    // Find table rows that have bgcolor="#FFFFFF" which indicates data rows
    $('tr[align="center"]').each((_, row) => {
      const cells = $(row).find('td[bgcolor="#FFFFFF"]');
      
      if (cells.length >= 7) {
        const rowData = cells.map((_, cell) => $(cell).text().trim().replace('&nbsp;', '')).get();
        console.log('Found row data:', rowData);
        
        rates.push({
          currency: rowData[0],
          name: rowData[0], // Currency code is used as name
          buyingRate: parseFloat(rowData[1]) || 0,
          cashBuyingRate: parseFloat(rowData[2]) || 0,
          sellingRate: parseFloat(rowData[3]) || 0,
          cashSellingRate: parseFloat(rowData[4]) || 0,
          middleRate: parseFloat(rowData[5]) || 0,
          pubTime: rowData[6]
        });
      }
    });

    // Try alternative table structure if no rates found
    if (rates.length === 0) {
      console.log('Trying alternative table structure...');
      $('table.publish tr').each((_, row) => {
        const cells = $(row).find('td');
        if (cells.length >= 7) {
          const rowData = cells.map((_, cell) => $(cell).text().trim()).get();
          console.log('Found alternative row data:', rowData);
          
          // Verify that we have numeric data in the expected columns
          if (rowData[0] && !isNaN(parseFloat(rowData[1]))) {
            rates.push({
              currency: rowData[0],
              name: rowData[0],
              buyingRate: parseFloat(rowData[1]) || 0,
              cashBuyingRate: parseFloat(rowData[2]) || 0,
              sellingRate: parseFloat(rowData[3]) || 0,
              cashSellingRate: parseFloat(rowData[4]) || 0,
              middleRate: parseFloat(rowData[5]) || 0,
              pubTime: rowData[6] || new Date().toISOString()
            });
          }
        }
      });
    }

    if (rates.length > 0) {
      console.log(`Successfully parsed ${rates.length} exchange rates`);
      return NextResponse.json(rates);
    }

    // If BOC fails, try CIB as fallback
    console.log('No BOC rates found, trying CIB rates...');
    const cibRates = await fetchCIBRates();
    return NextResponse.json(cibRates);

  } catch (error) {
    console.error('Error fetching BOC rates:', error);
    
    // Try CIB rates as fallback
    try {
      console.log('Attempting to fetch CIB rates as fallback...');
      const cibRates = await fetchCIBRates();
      return NextResponse.json(cibRates);
    } catch (cibError) {
      console.error('Error fetching CIB rates:', cibError);
      if (axios.isAxiosError(error)) {
        console.error('Axios error details:', {
          message: error.message,
          code: error.code,
          status: error.response?.status,
          data: error.response?.data
        });
      }
      // If both BOC and CIB fail, return initial rates
      return NextResponse.json(initialRates);
    }
  }
}
