import Image from "next/image";
import ExchangeRates from '../components/ExchangeRates';

export default function Home() {
  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <h1 className="text-2xl font-bold text-gray-900">Currency Exchange Rates</h1>
          <p className="text-sm text-gray-500">Real-time rates from Bank of China</p>
        </div>
      </header>
      
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <ExchangeRates />
      </main>

      <footer className="bg-white border-t mt-auto">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <p className="text-sm text-gray-500 text-center">
            Data provided by Bank of China. Updated every 5 minutes.
          </p>
        </div>
      </footer>
    </div>
  );
}
