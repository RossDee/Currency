interface HistoricalRate {
  currency: string;
  buyingRate: number;
  sellingRate: number;
  middleRate: number;
  timestamp: string;
}

export const getExchangeRateHistory = async (currency: string): Promise<HistoricalRate[]> => {
  try {
    const response = await fetch(`/api/exchange-history?currency=${currency}`);
    if (!response.ok) {
      throw new Error('Failed to fetch historical data');
    }
    return await response.json();
  } catch (error) {
    console.error('Error fetching historical data:', error);
    return [];
  }
};

export const saveExchangeRate = async (rate: {
  currency: string;
  buyingRate: number;
  sellingRate: number;
  middleRate: number;
}) => {
  try {
    const response = await fetch('/api/exchange-history', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(rate),
    });

    if (!response.ok) {
      throw new Error('Failed to save historical data');
    }

    return await response.json();
  } catch (error) {
    console.error('Error saving historical data:', error);
  }
};
