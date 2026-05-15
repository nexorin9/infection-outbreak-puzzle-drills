import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { PuzzleProvider } from './contexts/PuzzleContext';
import { ThemeProvider } from './contexts/ThemeContext';
import { ReplayProvider } from './contexts/ReplayContext';
import ThemeToggle from './components/ThemeToggle';
import ToastProvider from './components/ToastProvider';
import ErrorBoundary from './components/ErrorBoundary';
import HomePage from './pages/HomePage';
import PuzzlePage from './pages/PuzzlePage';
import ReportPage from './pages/ReportPage';
import HelpPage from './pages/HelpPage';
import ReplayPage from './pages/ReplayPage';
import HistoryPage from './pages/HistoryPage';
import SimulatorPage from './pages/SimulatorPage';

function App() {
  return (
    <BrowserRouter>
      <ErrorBoundary>
        <ThemeProvider>
          <ReplayProvider>
            <PuzzleProvider>
              <ToastProvider />
              <div className="min-h-screen bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 transition-colors">
                <header className="p-4 flex justify-end">
                  <ThemeToggle />
                </header>
                <Routes>
                  <Route path="/" element={<HomePage />} />
                  <Route path="/puzzle/:sessionId" element={<PuzzlePage />} />
                  <Route path="/report/:sessionId" element={<ReportPage />} />
                  <Route path="/help" element={<HelpPage />} />
                  <Route path="/replay/:replayId" element={<ReplayPage />} />
                  <Route path="/history" element={<HistoryPage />} />
                  <Route path="/simulator" element={<SimulatorPage />} />
                  <Route path="*" element={<Navigate to="/" replace />} />
                </Routes>
              </div>
            </PuzzleProvider>
          </ReplayProvider>
        </ThemeProvider>
      </ErrorBoundary>
    </BrowserRouter>
  );
}

export default App;