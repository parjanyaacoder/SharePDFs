import { useAuthState } from 'react-firebase-hooks/auth';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';

import './App.css';
import '../firebase';
import Signup from './components/Signup';
import Login from './components/Login';
import Dashboard from './components/Dashboard';
import Header from './components/Header';
import PDFViewer from './components/PDFViewer';
import SharedPDFViewer from './components/SharedPDFViewer';
import Upload from './components/Upload';
import { auth } from '../firebase';

function App() {
  const [user, loading] = useAuthState(auth);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-xl">Loading...</div>
      </div>
    );
  }

  return (
    <Router>
      <div className="min-h-screen flex flex-col">
        {user && <Header />}
        <main className={`flex-1 ${user ? 'min-h-[calc(100vh-4rem)] pt-16' : 'min-h-screen'}`}>
          <Routes>
            <Route path="/signup" element={!user ? <Signup /> : <Navigate to="/dashboard" />} />
            <Route path="/login" element={!user ? <Login /> : <Navigate to="/dashboard" />} />
            <Route path="/dashboard" element={user ? <Dashboard /> : <Navigate to="/login" />} />
            <Route path="/upload" element={user ? <Upload /> : <Navigate to="/login" />} />
            <Route path="/pdf/:id" element={user ? <PDFViewer /> : <Navigate to="/login" />} />
            <Route path="/shared/:shareToken" element={<SharedPDFViewer />} />
            <Route path="/" element={<Navigate to={user ? '/dashboard' : '/login'} replace />} />
            <Route path="*" element={<Navigate to={user ? '/dashboard' : '/login'} replace />} />
          </Routes>
        </main>
      </div>
    </Router>
  );
}

export default App;
