'use client';

import { useEffect, useState } from 'react';
import { ExchangeRate, CurrencyService } from '../services/currencyService';
import InlineChart from './InlineChart';
import DetailedChart from './DetailedChart';
import { getExchangeRateHistory } from '../services/historyService';

export default function ExchangeRates() {
  const [rates, setRates] = useState<ExchangeRate[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedCurrency, setSelectedCurrency] = useState<string | null>(null);
  const [historicalData, setHistoricalData] = useState<any[]>([]);

  const fetchRates = async () => {
    try {
      setLoading(true);
      setError(null);
      const currencyService = CurrencyService.getInstance();
      const data = await currencyService.getExchangeRates();
      setRates(data);
    } catch (err) {
      setError('Failed to fetch exchange rates. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  const fetchHistoricalData = async (currency: string) => {
    try {
      const data = await getExchangeRateHistory(currency);
      setHistoricalData(data);
    } catch (err) {
      console.error('Failed to fetch historical data:', err);
    }
  };

  useEffect(() => {
    fetchRates();
    // Refresh rates every minute
    const interval = setInterval(fetchRates, 60000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if (selectedCurrency) {
      fetchHistoricalData(selectedCurrency);
    }
  }, [selectedCurrency]);

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
          onClick={fetchRates}
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
              <DetailedChart data={historicalData} currency={selectedCurrency} />
            </div>
          </div>
        </div>
      )}
      
      <div className="p-6 border-b">
        <h2 className="text-xl font-semibold">Current Exchange Rates</h2>
        <p className="text-sm text-gray-500 mt-1">
          Last updated: {rates[0]?.pubTime || 'N/A'}
        </p>
      </div>
      
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Currency</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Trend</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Buying Rate</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Selling Rate</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Middle Rate</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {rates.map((rate) => (
              <tr 
                key={rate.currency} 
                className="hover:bg-gray-50 cursor-pointer"
                onClick={() => setSelectedCurrency(rate.currency)}
              >
                <td className="px-6 py-4 whitespace-nowrap font-medium text-gray-900">{rate.currency}</td>
                <td className="px-6 py-4 whitespace-nowrap text-gray-500">{rate.name}</td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <InlineChart data={historicalData.filter(d => d.currency === rate.currency)} />
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-gray-900">{rate.buyingRate.toFixed(2)}</div>
                  <div className="text-xs text-gray-500">Cash: {rate.cashBuyingRate.toFixed(2)}</div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-gray-900">{rate.sellingRate.toFixed(2)}</div>
                  <div className="text-xs text-gray-500">Cash: {rate.cashSellingRate.toFixed(2)}</div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-gray-900">{rate.middleRate.toFixed(2)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
