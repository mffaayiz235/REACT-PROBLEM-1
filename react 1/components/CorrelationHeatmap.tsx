import React, { useEffect, useState } from 'react';
import { Box, FormControl, InputLabel, MenuItem, Select, Paper, Typography } from '@mui/material';
import { Heatmap } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  Title,
  Tooltip,
  Legend
} from 'chart.js';
import { fetchStocks, fetchStockHistory, calculateCorrelation, StockPrice } from '../services/api';

ChartJS.register(
  CategoryScale,
  LinearScale,
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

interface CorrelationData {
  [key: string]: {
    prices: number[];
    avg: number;
    stdDev: number;
  };
}

const CorrelationHeatmap: React.FC = () => {
  const [stocks, setStocks] = useState<{ [key: string]: string }>({});
  const [timeInterval, setTimeInterval] = useState<number>(30);
  const [correlationData, setCorrelationData] = useState<CorrelationData>({});
  const [hoveredStock, setHoveredStock] = useState<string | null>(null);

  useEffect(() => {
    const loadStocks = async () => {
      const stocksData = await fetchStocks();
      setStocks(stocksData);
    };
    loadStocks();
  }, []);

  useEffect(() => {
    const loadCorrelationData = async () => {
      const data: CorrelationData = {};
      
      // Fetch price history for all stocks
      for (const [name, symbol] of Object.entries(stocks)) {
        const history = await fetchStockHistory(symbol, timeInterval);
        const prices = history.map(item => item.price);
        
        // Calculate average and standard deviation
        const avg = prices.reduce((a, b) => a + b, 0) / prices.length;
        const variance = prices.reduce((sum, x) => sum + Math.pow(x - avg, 2), 0) / prices.length;
        const stdDev = Math.sqrt(variance);
        
        data[symbol] = { prices, avg, stdDev };
      }
      
      setCorrelationData(data);
    };

    if (Object.keys(stocks).length > 0) {
      loadCorrelationData();
      const interval = setInterval(loadCorrelationData, 30000); // Refresh every 30 seconds
      return () => clearInterval(interval);
    }
  }, [stocks, timeInterval]);

  const getCorrelationMatrix = () => {
    const symbols = Object.keys(correlationData);
    const matrix: number[][] = [];

    symbols.forEach((symbol1) => {
      const row: number[] = [];
      symbols.forEach((symbol2) => {
        const correlation = calculateCorrelation(
          correlationData[symbol1].prices,
          correlationData[symbol2].prices
        );
        row.push(correlation);
      });
      matrix.push(row);
    });

    return matrix;
  };

  const getStockStats = (symbol: string) => {
    if (!correlationData[symbol]) return null;
    return {
      avg: correlationData[symbol].avg.toFixed(2),
      stdDev: correlationData[symbol].stdDev.toFixed(2),
    };
  };

  const heatmapData = {
    labels: Object.keys(correlationData),
    datasets: [{
      data: getCorrelationMatrix().flat(),
      width: Object.keys(correlationData).length,
      height: Object.keys(correlationData).length,
      backgroundColor: (context: any) => {
        const value = context.dataset.data[context.dataIndex] || 0;
        const alpha = Math.abs(value);
        return value > 0
          ? `rgba(75, 192, 192, ${alpha})`
          : `rgba(255, 99, 132, ${alpha})`;
      },
    }],
  };

  const heatmapOptions = {
    responsive: true,
    plugins: {
      legend: {
        display: false,
      },
      tooltip: {
        callbacks: {
          label: (context: any) => {
            const value = context.dataset.data[context.dataIndex];
            return `Correlation: ${value.toFixed(3)}`;
          },
        },
      },
    },
    scales: {
      x: {
        type: 'category',
        position: 'bottom',
      },
      y: {
        type: 'category',
        position: 'left',
      },
    },
    onHover: (event: any, elements: any[]) => {
      if (elements && elements.length > 0) {
        const symbol = Object.keys(correlationData)[elements[0].index % Object.keys(correlationData).length];
        setHoveredStock(symbol);
      } else {
        setHoveredStock(null);
      }
    },
  };

  return (
    <Box sx={{ p: 3 }}>
      <Paper sx={{ p: 3, mb: 3 }}>
        <Box sx={{ mb: 3 }}>
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

        {Object.keys(correlationData).length > 0 ? (
          <>
            <Box sx={{ height: '600px' }}>
              <Heatmap data={heatmapData} options={heatmapOptions} />
            </Box>
            
            {hoveredStock && (
              <Box sx={{ mt: 2, textAlign: 'center' }}>
                <Typography variant="h6">
                  {Object.entries(stocks).find(([_, symbol]) => symbol === hoveredStock)?.[0]}
                </Typography>
                <Typography variant="body1">
                  Average: ${getStockStats(hoveredStock)?.avg}
                </Typography>
                <Typography variant="body1">
                  Standard Deviation: ${getStockStats(hoveredStock)?.stdDev}
                </Typography>
              </Box>
            )}
          </>
        ) : (
          <Typography variant="body1" align="center">
            Loading correlation data...
          </Typography>
        )}
      </Paper>
    </Box>
  );
};

export default CorrelationHeatmap; 