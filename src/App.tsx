import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Navbar from '@/components/Navbar';
import AssessmentPage from '@/pages/AssessmentPage';
import ReportPage from '@/pages/ReportPage';
import JobsPage from '@/pages/JobsPage';
import ActionPage from '@/pages/ActionPage';
import HistoryPage from '@/pages/HistoryPage';

export default function App() {
  return (
    <Router>
      <div className="paper-bg min-h-screen">
        <Navbar />
        <main>
          <Routes>
            <Route path="/" element={<AssessmentPage />} />
            <Route path="/report" element={<ReportPage />} />
            <Route path="/jobs" element={<JobsPage />} />
            <Route path="/action" element={<ActionPage />} />
            <Route path="/history" element={<HistoryPage />} />
          </Routes>
        </main>
      </div>
    </Router>
  );
}
