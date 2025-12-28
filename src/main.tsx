import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { PersistQueryClientProvider } from '@tanstack/react-query-persist-client'
import { queryClient, persister, CACHE_BUSTER } from './lib/queryClient'
import './index.css'
import App from './App'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <PersistQueryClientProvider
      client={queryClient}
      persistOptions={{ persister, maxAge: 1000 * 60 * 60 * 24, buster: CACHE_BUSTER }} // 24 hour max age, buster invalidates cache when changed
    >
      <App />
    </PersistQueryClientProvider>
  </StrictMode>,
)
