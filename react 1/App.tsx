import React from 'react';
import { BrowserRouter as Router, Route, Routes, Link } from 'react-router-dom';
import { ThemeProvider, createTheme } from '@mui/material';
import { AppBar, Toolbar, Typography, Container, Box, Button } from '@mui/material';
import StockPage from './components/StockPage';
import CorrelationHeatmap from './components/CorrelationHeatmap';

const theme = createTheme({
  palette: {
    primary: {
      main: '#1976d2',
    },
    secondary: {
      main: '#dc004e',
    },
  },
});

function App() {
  return (
    <ThemeProvider theme={theme}>
      <Router>
        <Box sx={{ flexGrow: 1 }}>
          <AppBar position="static">
            <Toolbar>
              <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
                Stock Price Analytics
              </Typography>
              <Button color="inherit" component={Link} to="/">
                Stock Chart
              </Button>
              <Button color="inherit" component={Link} to="/heatmap">
                Correlation Heatmap
              </Button>
            </Toolbar>
          </AppBar>

          <Container maxWidth="lg" sx={{ mt: 4 }}>
            <Routes>
              <Route path="/" element={<StockPage />} />
              <Route path="/heatmap" element={<CorrelationHeatmap />} />
            </Routes>
          </Container>
        </Box>
      </Router>
    </ThemeProvider>
  );
}

export default App; 