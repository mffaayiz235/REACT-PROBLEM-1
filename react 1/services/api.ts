const API_BASE_URL = 'http://20.244.56.144/evaluation-service';

export interface Stock {
  symbol: string;
  name: string;
}

export interface StockPrice {
  price: number;
  lastUpdatedAt: string;
}

export const fetchStocks = async (): Promise<{ [key: string]: string }> => {
  const response = await fetch(`${API_BASE_URL}/stocks`);
  const data = await response.json();
  return data.stocks;
};

export const fetchStockPrice = async (ticker: string): Promise<StockPrice> => {
  const response = await fetch(`${API_BASE_URL}/stocks/${ticker}`);
  return await response.json().then(data => data.stock);
};

export const fetchStockHistory = async (ticker: string, minutes: number): Promise<StockPrice[]> => {
  const response = await fetch(`${API_BASE_URL}/stocks/${ticker}?minutes=${minutes}`);
  return await response.json();
};

export const calculateCorrelation = (prices1: number[], prices2: number[]): number => {
  if (prices1.length !== prices2.length || prices1.length === 0) return 0;

  const mean1 = prices1.reduce((a, b) => a + b) / prices1.length;
  const mean2 = prices2.reduce((a, b) => a + b) / prices2.length;

  const variance1 = prices1.reduce((sum, x) => sum + Math.pow(x - mean1, 2), 0);
  const variance2 = prices2.reduce((sum, x) => sum + Math.pow(x - mean2, 2), 0);

  const covariance = prices1.reduce((sum, x, i) => 
    sum + (x - mean1) * (prices2[i] - mean2), 0
  );

  const correlation = covariance / Math.sqrt(variance1 * variance2);
  return isNaN(correlation) ? 0 : correlation;
}; 