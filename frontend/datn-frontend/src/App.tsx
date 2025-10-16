import './App.css';
import { useSelector } from 'react-redux';
import { selectIsAuthenticated } from './redux/authSlice';
import { Navigate } from 'react-router-dom';
import CVBuilder from './pages/CVBuilder';
import Home from './pages/Home';
import CVManager from './pages/CVManager';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import CVTemplateBuilder from './pages/CVTemplateBuilder';
import Header from './components/Header';
import Login from './pages/Login';
import Register from './pages/Register';
import LoginEmployer from './pages/LoginEmployer';
import RegisterEmployer from './pages/RegisterEmloyer';
import Companies from './pages/Companies';
import CompaniesDetail from './pages/CompaniesDetail';
import JobDetail from './pages/JobDetail';
import SearchJob from './pages/SearchJob';
import UploadCV from './pages/UploadCV';
import CVTemplatesList from './pages/CVTemplatesList';
import CVPreviewPage from './pages/CVPreviewPage';
import FavoriteJobs from './pages/FavoriteJobs';
import AppliedJobs from './pages/AppliedJobs';

function App() {
  const isAuthenticated = useSelector(selectIsAuthenticated);

  return (
    <Router>
      <div className="flex flex-col h-screen">
        <Header />
        <main className="flex-1 pt-[70px]">
          <Routes>
            {/* Public routes */}
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />

            {/* Protected routes */}
            <Route
              path="/"
              element={isAuthenticated ? <Home /> : <Navigate to="/login" replace />} />
            <Route
              path="/manage-cvs"
              element={isAuthenticated ? <CVManager /> : <Navigate to="/login" replace />} />
            <Route
              path="/manage-cvs/:cvId"
              element={isAuthenticated ? <CVBuilder /> : <Navigate to="/login" replace />} />
            <Route
              path="/preview-cv/:cvId"
              element={isAuthenticated ? <CVPreviewPage /> : <Navigate to="/login" replace />} />
            <Route
              path="/templates"
              element={isAuthenticated ? <CVTemplateBuilder /> : <Navigate to="/login" replace />} />
            <Route
              path="/employer/login"
              element={isAuthenticated ? <Navigate to="/" replace /> : <LoginEmployer />} />
            <Route
              path="/employer/register"
              element={isAuthenticated ? <Navigate to="/" replace /> : <RegisterEmployer />} />
            <Route
              path="/companies"
              element={isAuthenticated ? <Companies /> : <Navigate to="/login" replace />} />
            <Route
              path="/companies/:companyId"
              element={isAuthenticated ? <CompaniesDetail /> : <Navigate to="/login" replace />} />
            <Route
              path="/jobs/:jobId"
              element={isAuthenticated ? <JobDetail /> : <Navigate to="/login" replace />} />
            <Route
              path="/jobs"
              element={isAuthenticated ? <SearchJob /> : <Navigate to="/login" replace />} />
            <Route
              path="/upload-cv"
              element={isAuthenticated ? <UploadCV /> : <Navigate to="/login" replace />} />
            <Route
              path="/cv-templates"
              element={isAuthenticated ? <CVTemplatesList /> : <Navigate to="/login" replace />} />
            <Route
              path="/favorite"
              element={isAuthenticated ? <FavoriteJobs /> : <Navigate to="/login" replace />} />
            <Route
              path="/applied"
              element={isAuthenticated ? <AppliedJobs /> : <Navigate to="/login" replace />} />
          </Routes>
        </main>
      </div>
    </Router>
  );
}

export default App;
