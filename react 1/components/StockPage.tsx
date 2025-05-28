import React, { useEffect, useState } from 'react';
import { Box, FormControl, InputLabel, MenuItem, Select, Paper, Typography } from '@mui/material';
import { Line } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
} from 'chart.js';
import { fetchStocks, fetchStockHistory, StockPrice } from '../services/api';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
);

const timeIntervals = [
  { value: 15, label: '15 minutes' },
  { value: 30, label: '30 minutes' },
  { value: 60, label: '1 hour' },
  { value: 120, label: '2 hours' },
];

const StockPage: React.FC = () => {
  const [stocks, setStocks] = useState<{ [key: string]: string }>({});
  const [selectedStock, setSelectedStock] = useState<string>('');
  const [timeInterval, setTimeInterval] = useState<number>(30);
  const [priceHistory, setPriceHistory] = useState<StockPrice[]>([]);

  useEffect(() => {
    const loadStocks = async () => {
      const stocksData = await fetchStocks();
      setStocks(stocksData);
      if (Object.keys(stocksData).length > 0) {
        setSelectedStock(Object.values(stocksData)[0]);
      }
    };
    loadStocks();
  }, []);

  useEffect(() => {
    const loadPriceHistory = async () => {
      if (selectedStock) {
        const history = await fetchStockHistory(selectedStock, timeInterval);
        setPriceHistory(history);
      }
    };
    loadPriceHistory();
    const interval = setInterval(loadPriceHistory, 30000); // Refresh every 30 seconds
    return () => clearInterval(interval);
  }, [selectedStock, timeInterval]);

  const chartData = {
    labels: priceHistory.map(item => 
      new Date(item.lastUpdatedAt).toLocaleTimeString()
    ),
    datasets: [
      {
        label: 'Stock Price',
        data: priceHistory.map(item => item.price),
        borderColor: 'rgb(75, 192, 192)',
        tension: 0.1,
      },
      {
        label: 'Average',
        data: priceHistory.map(() => {
          const avg = priceHistory.reduce((sum, item) => sum + item.price, 0) / priceHistory.length;
          return avg;
        }),
        borderColor: 'rgb(255, 99, 132)',
        borderDash: [5, 5],
      },
    ],
  };

  const chartOptions = {
    responsive: true,
    plugins: {
      legend: {
        position: 'top' as const,
      },
      title: {
        display: true,
        text: `${Object.entries(stocks).find(([_, symbol]) => symbol === selectedStock)?.[0] || ''} Price History`,
      },
      tooltip: {
        callbacks: {
          label: (context: any) => {
            return `Price: $${context.parsed.y.toFixed(2)}`;
          },
        },
      },
    },
    scales: {
      y: {
        beginAtZero: false,
      },
    },
  };

  return (
    <Box sx={{ p: 3 }}>
      <Paper sx={{ p: 3, mb: 3 }}>
        <Box sx={{ display: 'flex', gap: 2, mb: 3 }}>
          <FormControl fullWidth>
            <InputLabel>Stock</InputLabel>
            <Select
              value={selectedStock}
              label="Stock"
              onChange={(e) => setSelectedStock(e.target.value)}
            >
              {Object.entries(stocks).map(([name, symbol]) => (
                <MenuItem key={symbol} value={symbol}>
                  {name} ({symbol})
                </MenuItem>
              ))}
            </Select>
          </FormControl>
          <FormControl fullWidth>
            <InputLabel>Time Interval</InputLabel>
            <Select
              value={timeInterval}
              label="Time Interval"
              onChange={(e) => setTimeInterval(Number(e.target.value))}
            >
              {timeIntervals.map((interval) => (
                <MenuItem key={interval.value} value={interval.value}>
                  {interval.label}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </Box>
        
        {priceHistory.length > 0 ? (
          <Line data={chartData} options={chartOptions} />
        ) : (
          <Typography variant="body1" align="center">
            No data available for the selected stock and time interval
          </Typography>
        )}
      </Paper>
    </Box>
  );
};

export default StockPage; 