import { useState, useEffect } from 'react';

interface ExchangeRateData {
  rate: number;
  lastUpdated: Date;
  isLoading: boolean;
  error: string | null;
}

export function useExchangeRate() {
  const [data, setData] = useState<ExchangeRateData>({
    rate: 56, // Fallback rate
    lastUpdated: new Date(),
    isLoading: true,
    error: null,
  });

  useEffect(() => {
    const fetchRate = async () => {
      try {
        setData(prev => ({ ...prev, isLoading: true, error: null }));

        // Try multiple free APIs in order of preference
        let rate = null;

        // Option 1: ExchangeRate-API (Free, no key needed for basic)
        try {
          const response = await fetch('https://open.er-api.com/v6/latest/USD');
          const json = await response.json();
          if (json.rates && json.rates.PHP) {
            rate = json.rates.PHP;
          }
        } catch (err) {
          console.log('ExchangeRate-API failed, trying alternative...');
        }

        // Option 2: CoinGecko (Backup)
        if (!rate) {
          try {
            const response = await fetch(
              'https://api.coingecko.com/api/v3/simple/price?ids=usd-coin&vs_currencies=php'
            );
            const json = await response.json();
            if (json['usd-coin'] && json['usd-coin'].php) {
              rate = json['usd-coin'].php;
            }
          } catch (err) {
            console.log('CoinGecko failed, trying alternative...');
          }
        }

        // Option 3: Fallback to exchangerate.host
        if (!rate) {
          try {
            const response = await fetch('https://api.exchangerate.host/latest?base=USD&symbols=PHP');
            const json = await response.json();
            if (json.rates && json.rates.PHP) {
              rate = json.rates.PHP;
            }
          } catch (err) {
            console.log('All APIs failed, using fallback rate');
          }
        }

        // Use fetched rate or fallback
        const finalRate = rate || 56;

        setData({
          rate: finalRate,
          lastUpdated: new Date(),
          isLoading: false,
          error: null,
        });

        // Cache the rate in localStorage
        localStorage.setItem('exchangeRate', JSON.stringify({
          rate: finalRate,
          timestamp: new Date().getTime(),
        }));

      } catch (error) {
        console.error('Error fetching exchange rate:', error);

        // Try to use cached rate
        const cached = localStorage.getItem('exchangeRate');
        if (cached) {
          const { rate: cachedRate } = JSON.parse(cached);
          setData({
            rate: cachedRate,
            lastUpdated: new Date(),
            isLoading: false,
            error: 'Using cached rate',
          });
        } else {
          setData({
            rate: 56, // Final fallback
            lastUpdated: new Date(),
            isLoading: false,
            error: 'Failed to fetch rate, using fallback',
          });
        }
      }
    };

    // Fetch on mount
    fetchRate();

    // Refresh every 5 minutes
    const interval = setInterval(fetchRate, 5 * 60 * 1000);

    return () => clearInterval(interval);
  }, []);

  return data;
}

// Helper function to convert PHP to USD
export function convertPHPtoUSD(amountPHP: number, rate: number): number {
  return amountPHP / rate;
}

// Helper function to format USDC amount
export function formatUSDC(amount: number): string {
  return amount.toFixed(2);
}
