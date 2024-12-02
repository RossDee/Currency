'use client';

import { useState, useEffect, useCallback } from 'react';
import { ExchangeRate } from '../services/currencyService';

interface CurrencyConverterProps {
  rates: ExchangeRate[];
  onClose: () => void;
}

export default function CurrencyConverter({ rates, onClose }: CurrencyConverterProps) {
  const [amount, setAmount] = useState<number>(100);
  const [fromCurrency, setFromCurrency] = useState<string>('CNY');
  const [toCurrency, setToCurrency] = useState<string>('USD');
  const [result, setResult] = useState<number | null>(null);

  const convertCurrency = useCallback(() => {
    // Find exchange rates for both currencies
    const fromRate = rates.find((r) => r.currency === fromCurrency);
    const toRate = rates.find((r) => r.currency === toCurrency);

    if (!fromRate || !toRate) {
      return;
    }

    // Convert through CNY as base currency
    if (fromCurrency === 'CNY') {
      // Direct conversion from CNY to target currency
      setResult(amount / toRate.middleRate);
    } else if (toCurrency === 'CNY') {
      // Direct conversion to CNY
      setResult(amount * fromRate.middleRate);
    } else {
      // Cross conversion: first to CNY, then to target currency
      const amountInCNY = amount * fromRate.middleRate;
      setResult(amountInCNY / toRate.middleRate);
    }
  }, [amount, fromCurrency, toCurrency, rates]);

  useEffect(() => {
    convertCurrency();
  }, [convertCurrency]);

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg w-full max-w-md">
        <div className="p-4 border-b flex justify-between items-center">
          <h3 className="text-lg font-semibold">Currency Converter</h3>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
            ✕
          </button>
        </div>

        <div className="p-6 space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Amount</label>
            <input
              type="number"
              value={amount}
              onChange={(e) => setAmount(Math.max(0, Number(e.target.value)))}
              className="w-full p-2 border rounded-md"
              min="0"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">From</label>
              <select
                value={fromCurrency}
                onChange={(e) => setFromCurrency(e.target.value)}
                className="w-full p-2 border rounded-md"
              >
                {rates.map((rate) => (
                  <option key={rate.currency} value={rate.currency}>
                    {rate.currency} - {rate.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">To</label>
              <select
                value={toCurrency}
                onChange={(e) => setToCurrency(e.target.value)}
                className="w-full p-2 border rounded-md"
              >
                {rates.map((rate) => (
                  <option key={rate.currency} value={rate.currency}>
                    {rate.currency} - {rate.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {result !== null && (
            <div className="mt-6 p-4 bg-gray-50 rounded-md">
              <div className="text-sm text-gray-500">Result</div>
              <div className="text-xl font-semibold">
                {amount.toFixed(2)} {fromCurrency} =
              </div>
              <div className="text-2xl font-bold text-blue-600">
                {result.toFixed(2)} {toCurrency}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
