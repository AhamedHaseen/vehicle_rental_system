import React, { createContext, useContext, useState } from 'react';

const CurrencyContext = createContext(null);

const RATES = {
  LKR: 1,
  USD: 0.0033, // 1 LKR ≈ 0.0033 USD (1 USD ≈ 303 LKR)
  EUR: 0.0031  // 1 LKR ≈ 0.0031 EUR (1 EUR ≈ 322 LKR)
};

const SYMBOLS = {
  LKR: 'Rs.',
  USD: '$',
  EUR: '€'
};

export const CurrencyProvider = ({ children }) => {
  const [currency, setCurrency] = useState('LKR');

  const formatPrice = (amountInLkr) => {
    if (amountInLkr === undefined || amountInLkr === null) return '0';
    const num = Number(amountInLkr);
    if (isNaN(num)) return '0';

    if (currency === 'LKR') {
      return `Rs. ${num.toLocaleString('en-LK')}`;
    } else if (currency === 'USD') {
      const converted = num * RATES.USD;
      return `$${converted.toFixed(2)}`;
    } else if (currency === 'EUR') {
      const converted = num * RATES.EUR;
      return `€${converted.toFixed(2)}`;
    }
    return `Rs. ${num.toLocaleString()}`;
  };

  return (
    <CurrencyContext.Provider value={{ currency, setCurrency, formatPrice, symbol: SYMBOLS[currency] }}>
      {children}
    </CurrencyContext.Provider>
  );
};

export const useCurrency = () => {
  const context = useContext(CurrencyContext);
  if (!context) {
    throw new Error('useCurrency must be used within a CurrencyProvider');
  }
  return context;
};
