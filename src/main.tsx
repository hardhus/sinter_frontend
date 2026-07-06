import React from 'react'
import ReactDOM from 'react-dom/client'
import { RouterProvider, createRouter } from '@tanstack/react-router'
import { routeTree } from './routeTree.gen' 
import { ThemeProvider } from './context/ThemeContext'
import { AuthProvider } from './context/AuthContext';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { client, rspc } from './rspc'
import './App.css'

const router = createRouter({ routeTree })
const queryClient = new QueryClient()

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <ThemeProvider>
      <AuthProvider>
        <rspc.Provider client={client} queryClient={queryClient}>
          <QueryClientProvider client={queryClient}>
            <RouterProvider router={router} />
          </QueryClientProvider>
        </rspc.Provider>
      </AuthProvider>
    </ThemeProvider>
  </React.StrictMode>,
)
