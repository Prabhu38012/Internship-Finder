import React from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'

// Suppress React Router v7 deprecation warnings and socket warnings during development
const originalWarn = console.warn
const originalError = console.error

console.warn = (...args) => {
  const message = args[0]?.toString() || ''
  
  // Suppress React Router warnings
  if (message.includes('React Router Future Flag Warning')) {
    return
  }
  
  // Suppress socket warnings during development when server might not be ready
  if (message.includes('Socket not available for event:') ||
      message.includes('Connection throttled') ||
      message.includes('Connection attempt without token') ||
      message.includes('Connection timeout') ||
      message.includes('attempting reconnect') ||
      message.includes('Socket not connected')) {
    return
  }
  
  // Suppress browser extension or external warnings
  if (message.includes('PC_plat')) {
    return
  }
  
  originalWarn.apply(console, args)
}

console.error = (...args) => {
  const message = args[0]?.toString() || ''
  const stack = args[0]?.stack?.toString() || ''
  
  // Suppress WebSocket connection errors during development
  if (message.includes('WebSocket connection to') ||
      message.includes('WebSocket is closed before the connection is established') ||
      message.includes('socket.io') ||
      message.includes('socketService') ||
      message.includes('Connection error:') ||
      message.includes('failed: WebSocket is closed') ||
      message.includes('clientVersion=') ||
      message.includes('XMLHttpRequest') ||
      message.includes('XHR') ||
      message.includes('transport=websocket')) {
    return
  }
  
  // Suppress Chrome extension errors
  if (message.includes('chrome-extension://') || 
      stack.includes('chrome-extension://') ||
      message.includes('extension')) {
    return
  }
  
  originalError.apply(console, args)
}

// Suppress unhandled promise rejections from WebSocket
window.addEventListener('unhandledrejection', (event) => {
  const message = event.reason?.toString() || ''
  if (message.includes('WebSocket') || 
      message.includes('socket.io') ||
      message.includes('Connection')) {
    event.preventDefault()
  }
})

// Suppress browser-level errors from WebSocket and extensions
window.addEventListener('error', (event) => {
  const message = event.message?.toString() || ''
  const filename = event.filename?.toString() || ''
  
  // Suppress WebSocket errors
  if (message.includes('WebSocket') || 
      message.includes('socket.io') ||
      message.includes('socketService')) {
    event.preventDefault()
    return false
  }
  
  // Suppress Chrome extension errors
  if (filename.includes('chrome-extension://') || 
      message.includes('chrome-extension://')) {
    event.preventDefault()
    return false
  }
}, true)

import { Provider } from 'react-redux'
import { QueryClient, QueryClientProvider } from 'react-query'
import { ThemeProvider, createTheme } from '@mui/material/styles'
import CssBaseline from '@mui/material/CssBaseline'
import { HelmetProvider } from 'react-helmet-async'
import { Toaster } from 'react-hot-toast'

import App from './App.jsx'
import { store } from './store/store.js'
import './index.css'

// Create React Query client
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      retry: 1,
      staleTime: 5 * 60 * 1000, // 5 minutes
    },
  },
})

// Create Material-UI theme
const theme = createTheme({
  palette: {
    primary: {
      main: '#a855f7',
      light: '#c084fc',
      dark: '#7e22ce',
    },
    secondary: {
      main: '#e879f9',
      light: '#f0abfc',
      dark: '#c026d3',
    },
    background: {
      default: '#faf5ff',
      paper: '#ffffff',
    },
  },
  typography: {
    fontFamily: '"Inter", "Roboto", "Helvetica", "Arial", sans-serif',
    h1: {
      fontWeight: 700,
    },
    h2: {
      fontWeight: 600,
    },
    h3: {
      fontWeight: 600,
    },
    h4: {
      fontWeight: 600,
    },
    h5: {
      fontWeight: 500,
    },
    h6: {
      fontWeight: 500,
    },
  },
  shape: {
    borderRadius: 8,
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          textTransform: 'none',
          fontWeight: 500,
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          boxShadow: '0 1px 3px 0 rgb(0 0 0 / 0.1), 0 1px 2px -1px rgb(0 0 0 / 0.1)',
        },
      },
    },
  },
})

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <HelmetProvider>
      <Provider store={store}>
        <QueryClientProvider client={queryClient}>
          <ThemeProvider theme={theme}>
            <CssBaseline />
            <BrowserRouter>
              <App />
              <Toaster
                position="top-right"
                toastOptions={{
                  duration: 4000,
                  style: {
                    background: '#363636',
                    color: '#fff',
                  },
                  success: {
                    duration: 3000,
                    iconTheme: {
                      primary: '#10b981',
                      secondary: '#fff',
                    },
                  },
                  error: {
                    duration: 5000,
                    iconTheme: {
                      primary: '#ef4444',
                      secondary: '#fff',
                    },
                  },
                }}
              />
            </BrowserRouter>
          </ThemeProvider>
        </QueryClientProvider>
      </Provider>
    </HelmetProvider>
  </React.StrictMode>,
)
