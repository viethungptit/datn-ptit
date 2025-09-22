import './App.css';
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

function App() {
  return (
    <Router>
      <div className="flex flex-col h-screen">
        <Header />
        <main className="flex-1 pt-[70px]">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/manage-cvs" element={<CVManager />} />
            <Route path="/manage-cvs/:cvId" element={<CVBuilder />} />
            <Route path="/preview-cv/:cvId" element={<CVPreviewPage />} />
            <Route path="/templates" element={<CVTemplateBuilder />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/employer/login" element={<LoginEmployer />} />
            <Route path="/employer/register" element={<RegisterEmployer />} />
            <Route path="/companies" element={<Companies />} />
            <Route path="/companies/:companyId" element={<CompaniesDetail />} />
            <Route path="/jobs/:jobId" element={<JobDetail />} />
            <Route path="/jobs" element={<SearchJob />} />
            <Route path="/upload-cv" element={<UploadCV />} />
            <Route path="/cv-templates" element={<CVTemplatesList />} />
          </Routes>
        </main>
      </div>
    </Router>
  );
}

export default App;
