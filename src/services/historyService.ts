// Mock historical data generator
const generateMockHistoricalData = (currency: string) => {
  const data = [];
  const now = new Date();

  // Generate 24 hours of mock data
  for (let i = 0; i < 24; i++) {
    const timestamp = new Date(now.getTime() - i * 60 * 60 * 1000).toISOString();
    const baseRate = 100 + Math.random() * 10;

    data.push({
      currency,
      timestamp,
      buyingRate: baseRate - Math.random(),
      sellingRate: baseRate + Math.random(),
      middleRate: baseRate,
    });
  }

  return data.reverse();
};

export const getExchangeRateHistory = async (currency: string) => {
  // In a real application, this would make an API call to fetch historical data
  // For now, we'll return mock data
  return generateMockHistoricalData(currency);
};
