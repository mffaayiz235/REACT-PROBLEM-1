# Stock Price Aggregation Frontend

A React-based web application for real-time stock price analysis and visualization.

## Features

- Real-time stock price monitoring
- Interactive price charts with customizable time intervals
- Correlation heatmap between different stocks
- Statistical analysis including average prices and standard deviations
- Material UI-based responsive design

## Prerequisites

- Node.js (v14 or higher)
- npm (v6 or higher)

## Installation

1. Clone the repository
2. Install dependencies:
```bash
npm install
```

## Running the Application

1. Start the development server:
```bash
npm start
```

2. Open [http://localhost:3000](http://localhost:3000) in your browser

## Pages

### Stock Page
- View real-time stock prices
- Interactive line chart with price history
- Customizable time intervals
- Average price line
- Detailed price information on hover

### Correlation Heatmap
- Visual representation of stock price correlations
- Color-coded correlation strength
- Statistical information on hover
- Customizable time intervals

## Technical Details

- Built with React and TypeScript
- Uses Material UI for components
- Chart.js for data visualization
- Real-time data updates every 30 seconds
- Responsive design for all screen sizes

## API Integration

The application integrates with the stock exchange API:
- Base URL: http://20.244.56.144/evaluation-service
- Endpoints:
  - GET /stocks - List all available stocks
  - GET /stocks/:ticker - Get current price for a stock
  - GET /stocks/:ticker?minutes=m - Get price history for last m minutes 