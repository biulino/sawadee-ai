import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import { Box, Container, Typography, Button, Card, CardContent, Grid } from '@mui/material';

// Create theme
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

// Create Query Client
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5, // 5 minutes
      cacheTime: 1000 * 60 * 30, // 30 minutes
    },
  },
});

// Home Page Component
const HomePage: React.FC = () => {
  const handleGetStarted = () => {
    // Navigate to login or main app
    console.log('Get Started clicked');
  };

  return (
    <Container maxWidth="lg">
      <Box sx={{ mt: 8, mb: 4 }}>
        <Typography variant="h2" component="h1" gutterBottom align="center">
          🏨 SawadeeAI
        </Typography>
        <Typography variant="h5" component="h2" gutterBottom align="center" color="text.secondary">
          Next-Generation Hotel Management Platform
        </Typography>
        <Typography variant="body1" align="center" sx={{ mt: 3, mb: 4 }}>
          AI-powered hotel management system built with modern technologies for the hospitality industry.
        </Typography>
        
        <Box sx={{ display: 'flex', justifyContent: 'center', mb: 6 }}>
          <Button 
            variant="contained" 
            size="large" 
            onClick={handleGetStarted}
            sx={{ px: 4, py: 2 }}
          >
            Get Started
          </Button>
        </Box>

        <Grid container spacing={4}>
          <Grid item xs={12} md={4}>
            <Card>
              <CardContent>
                <Typography variant="h6" component="h3" gutterBottom>
                  🤖 AI-Powered Assistant
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Intelligent chatbot for guest services and support with natural language processing.
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          
          <Grid item xs={12} md={4}>
            <Card>
              <CardContent>
                <Typography variant="h6" component="h3" gutterBottom>
                  🏢 Multi-Tenant Architecture
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Support for multiple hotels with isolated data and customizable configurations.
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          
          <Grid item xs={12} md={4}>
            <Card>
              <CardContent>
                <Typography variant="h6" component="h3" gutterBottom>
                  📱 Mobile-First Design
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Responsive web interface and dedicated mobile app for on-the-go management.
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          
          <Grid item xs={12} md={4}>
            <Card>
              <CardContent>
                <Typography variant="h6" component="h3" gutterBottom>
                  🔐 Secure Authentication
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Enterprise-grade security with Keycloak OAuth2/OIDC authentication.
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          
          <Grid item xs={12} md={4}>
            <Card>
              <CardContent>
                <Typography variant="h6" component="h3" gutterBottom>
                  🎯 Smart Recommendations
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  AI-driven activity and service suggestions based on guest preferences.
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          
          <Grid item xs={12} md={4}>
            <Card>
              <CardContent>
                <Typography variant="h6" component="h3" gutterBottom>
                  ⚡ Real-Time Operations
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Live updates for bookings, check-ins, and room status management.
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      </Box>
    </Container>
  );
};

// Main App Component
const App: React.FC = () => {
  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider theme={theme}>
        <CssBaseline />
        <Router>
          <Routes>
            <Route path="/" element={<HomePage />} />
          </Routes>
        </Router>
      </ThemeProvider>
    </QueryClientProvider>
  );
};

export default App;
