import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { MarketProvider } from './context/MarketContext';
import Header from './layout/Header';
import Sidebar from './layout/Sidebar';
import Dashboard from './pages/Dashboard';
import SignalHistory from './pages/SignalHistory';
import TradeHistory from './pages/TradeHistory';
import Backtest from './pages/Backtest';
import Settings from './pages/Settings';

export default function App() {
  return (
    <MarketProvider>
      <BrowserRouter>
        <div className="min-h-screen flex flex-col" style={{ background: 'var(--surface-2)' }}>
          <Header />
          <div className="flex flex-1">
            <Sidebar />
            <main className="flex-1">
              <Routes>
                <Route path="/" element={<Dashboard />} />
                <Route path="/signals" element={<SignalHistory />} />
                <Route path="/trades" element={<TradeHistory />} />
                <Route path="/backtest" element={<Backtest />} />
                <Route path="/settings" element={<Settings />} />
              </Routes>
            </main>
          </div>
        </div>
      </BrowserRouter>
    </MarketProvider>
  );
}
