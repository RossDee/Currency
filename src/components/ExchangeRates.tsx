'use client';

import { useEffect, useState, useCallback } from 'react';
import { ExchangeRate, CurrencyService } from '../services/currencyService';
import InlineChart from './InlineChart';
import DetailedChart from './DetailedChart';
import CurrencyConverter from './CurrencyConverter';
import { getExchangeRateHistory, saveExchangeRate } from '../services/historyService';

export default function ExchangeRates() {
  const [rates, setRates] = useState<ExchangeRate[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedCurrency, setSelectedCurrency] = useState<string | null>(null);
  const [showConverter, setShowConverter] = useState(false);
  const [lastUpdate, setLastUpdate] = useState<Date>(new Date());
  const [bocTimestamp, setBocTimestamp] = useState<string>('');
  const [historicalData, setHistoricalData] = useState<{
    [key: string]: {
      buyingRate: number;
      sellingRate: number;
      middleRate: number;
      timestamp: string;
    }[];
  }>({});

  const fetchRates = useCallback(async () => {
    try {
      const currencyService = CurrencyService.getInstance();
      const data = await currencyService.getExchangeRates();
      setRates(data);
      setLastUpdate(new Date());
      setBocTimestamp(data[0]?.pubTime || '');

      // Save each rate to history
      await Promise.all(
        data.map((rate) =>
          saveExchangeRate({
            currency: rate.currency,
            buyingRate: rate.buyingRate,
            sellingRate: rate.sellingRate,
            middleRate: rate.middleRate,
          }),
        ),
      );

      // Fetch historical data for all currencies
      const historicalDataPromises = data.map(async (rate) => {
        const history = await getExchangeRateHistory(rate.currency);
        return { currency: rate.currency, history };
      });

      const historicalResults = await Promise.all(historicalDataPromises);
      const historicalMap = historicalResults.reduce((acc, { currency, history }) => {
        acc[currency] = history;
        return acc;
      }, {} as { [key: string]: (typeof historicalData)[string] });

      setHistoricalData(historicalMap);
    } catch (error) {
      console.error('Error fetching rates:', error);
      setError('Failed to fetch exchange rates. Please try again later.');
    }
  }, []);

  const refreshData = useCallback(async () => {
    // Check if last update was less than 1 minute ago
    const timeSinceLastUpdate = Date.now() - lastUpdate.getTime();
    if (timeSinceLastUpdate < 60000) {
      const timeToWait = Math.ceil((60000 - timeSinceLastUpdate) / 1000);
      console.log(`Please wait ${timeToWait} seconds before refreshing again`);
      return;
    }

    setLoading(true);
    setError(null);
    await fetchRates();
    setLoading(false);
  }, [fetchRates, lastUpdate]);

  useEffect(() => {
    refreshData();

    // Refresh rates every minute
    const interval = setInterval(refreshData, 60000);

    // Cleanup interval on component unmount
    return () => clearInterval(interval);
  }, [refreshData]);

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[200px]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-4">
        <p className="text-red-700">{error}</p>
        <button
          onClick={refreshData}
          className="mt-2 px-4 py-2 bg-red-100 hover:bg-red-200 rounded text-red-700 text-sm"
        >
          Retry
        </button>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-lg overflow-hidden">
      {selectedCurrency && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg w-full max-w-4xl">
            <div className="p-4 border-b flex justify-between items-center">
              <h3 className="text-lg font-semibold">Historical Data</h3>
              <button
                onClick={() => setSelectedCurrency(null)}
                className="text-gray-500 hover:text-gray-700"
              >
                ✕
              </button>
            </div>
            <div className="p-4">
              <DetailedChart
                data={historicalData[selectedCurrency] || []}
                currency={selectedCurrency}
              />
            </div>
          </div>
        </div>
      )}

      {showConverter && <CurrencyConverter rates={rates} onClose={() => setShowConverter(false)} />}

      <div className="p-6 border-b">
        <div className="flex justify-between items-center">
          <div>
            <h2 className="text-xl font-semibold">Current Exchange Rates</h2>
            <div className="flex flex-col space-y-1 text-sm text-gray-500 mt-1">
              <div className="flex items-center space-x-2">
                <p>BOC Update Time: {bocTimestamp || 'N/A'}</p>
              </div>
              <div className="flex items-center space-x-2">
                <p>Last Refresh: {lastUpdate.toLocaleTimeString()}</p>
                <button
                  onClick={refreshData}
                  className="inline-flex items-center px-2 py-1 text-xs text-blue-600 hover:text-blue-800 focus:outline-none"
                  title="Refresh interval: 1 minute"
                >
                  <svg
                    className={`w-4 h-4 mr-1 ${loading ? 'animate-spin' : ''}`}
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
                    />
                  </svg>
                  Refresh
                </button>
              </div>
            </div>
          </div>
          <button
            onClick={() => setShowConverter(true)}
            className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition-colors"
          >
            Currency Converter
          </button>
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Currency
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Name
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Trend
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Buying Rate
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Selling Rate
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Middle Rate
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {rates.map((rate) => (
              <tr
                key={rate.currency}
                className="hover:bg-gray-50 cursor-pointer"
                onClick={() => setSelectedCurrency(rate.currency)}
              >
                <td className="px-6 py-4 whitespace-nowrap font-medium text-gray-900">
                  {rate.currency}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-gray-500">{rate.name}</td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <InlineChart data={historicalData[rate.currency] || []} />
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-gray-900">{rate.buyingRate.toFixed(2)}</div>
                  <div className="text-xs text-gray-500">
                    Cash: {rate.cashBuyingRate.toFixed(2)}
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-gray-900">{rate.sellingRate.toFixed(2)}</div>
                  <div className="text-xs text-gray-500">
                    Cash: {rate.cashSellingRate.toFixed(2)}
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-gray-900">
                  {rate.middleRate.toFixed(2)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
