import { createRoot } from 'react-dom/client';
import './index.css';
import App from './App.tsx';
import { GlobalEffectDialog } from './components/GlobalEffectDialog.tsx';
import { AppProvider } from "./AppProvider.tsx";

createRoot(document.getElementById('root')!).render(
  <AppProvider>
    <App />
    <GlobalEffectDialog />
  </AppProvider>
)
