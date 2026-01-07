import './App.css';
import type { ReactNode } from 'react';
import { useSelector } from 'react-redux';
import { selectIsAuthenticated, selectRole } from './redux/authSlice';
import { Navigate, useLocation, matchPath } from 'react-router-dom';
import Home from './pages/Home';
import CVManager from './pages/CVManager';
import { Routes, Route } from 'react-router-dom';
import CVTemplateEditor from './pages/Admin/CVTemplateEditor';
import Header from './components/Header';
import Login from './pages/Login';
import Register from './pages/Register';
import Companies from './pages/Companies';
import CompaniesDetail from './pages/CompaniesDetail';
import JobDetail from './pages/JobDetail';
import SearchJob from './pages/SearchJob';
import UploadCV from './pages/UploadCV';
import CVTemplatesList from './pages/CVTemplatesList';
import FavoriteJobs from './pages/FavoriteJobs';
import AppliedJobs from './pages/AppliedJobs';
import VerifyOtpPage from './pages/VerifyOtpPage';
import ForgotPasswordPage from './pages/ForgotPasswordPage';
import ResetPasswordPage from './pages/ResetPasswordPage';
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import MyProfile from './pages/MyProfile';
import LoginEmployer from './pages/Employer/LoginEmployer';
import RegisterEmployer from './pages/Employer/RegisterEmloyer';
import LoginAdmin from './pages/Admin/LoginAdmin';
import RegisterAdmin from './pages/Admin/RegisterAdmin';
import { useState } from 'react';
import Sidebar from './components/Sidebar';
import EmployerProfile from './pages/Employer/EmployerProfile';
import UserManagement from './pages/Admin/UserManagement';
import CompanyManagement from './pages/Admin/CompanyManagement';
import TagManagement from './pages/Admin/TagManagement';
import CVTemplateManagement from './pages/Admin/CVTemplateManagement';
import NotificationTemplates from './pages/Admin/NotificationTemplates';
import NotificationEmails from './pages/Admin/NotificationEmails';
import Notifications from './pages/Admin/Notifications';
import CVBuilderTemplate from './pages/CVBuilderTemplate';
import CVEditTemplate from './pages/CVEditTemplate';
import CVPreviewPage from './pages/CVPreviewPage';
import JobManagement from './pages/Admin/JobManagement';
import ChangePassword from './pages/Admin/ChangePassword';
import EmployerJobs from './pages/Employer/EmployerJobs';
import EmployerManagement from './pages/Employer/EmployerManagement';
import CVManagement from './pages/Admin/CVManagement';
import LogsUI from './pages/Admin/LogsUI';
import Dashboard from './pages/Admin/Dashboard';
import EmployerReports from './pages/Employer/EmployerReports';

function App() {
  const isAuthenticated = useSelector(selectIsAuthenticated);
  const userRole = useSelector(selectRole);
  const location = useLocation();

  const RoleRoute = ({ element, allowedRoles }: { element: ReactNode; allowedRoles?: string[] }) => {
    if (!isAuthenticated) return <Navigate to="/login" replace />;
    if (allowedRoles && allowedRoles.length > 0) {
      if (!allowedRoles.includes(userRole || '')) {
        return <Navigate to="/" replace />;
      }
    }
    return element;
  };

  const noHeaderPaths = [
    '/employer/login',
    '/employer/register',
    '/admin/login',
    '/admin/register',
    '/preview-cvs/:cvId',
  ];

  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const hideHeaderForPath = noHeaderPaths.some((path) => matchPath({ path, end: true }, location.pathname));
  const showHeader = (!isAuthenticated || userRole === 'candidate') && !hideHeaderForPath;
  const isEmployerOrAdmin = (userRole === 'employer' || userRole === 'admin') && !hideHeaderForPath;
  const headerHeight = showHeader ? 70 : 0;

  return (
    <div className="flex flex-col h-screen">
      {showHeader && <Header />}
      {isEmployerOrAdmin && (
        <Sidebar collapsed={sidebarCollapsed} onToggle={() => setSidebarCollapsed(s => !s)} headerOffset={headerHeight} />
      )}

      <main
        className={showHeader ? 'flex-1 pt-[70px] transition-all duration-200' : 'flex-1 transition-all duration-200'}
        style={{ marginLeft: isEmployerOrAdmin ? (sidebarCollapsed ? '60px' : '16.666667%') : undefined }}
      >
        <Routes>
          {/* Public routes */}
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/forgot-password" element={<ForgotPasswordPage />} />
          <Route path="/verify-otp" element={<VerifyOtpPage />} />
          <Route path="/reset-password" element={<ResetPasswordPage />} />
          <Route path="/employer/login" element={<LoginEmployer />} />
          <Route path="/employer/register" element={<RegisterEmployer />} />
          <Route path="/admin/login" element={<LoginAdmin />} />
          <Route path="/admin/register" element={<RegisterAdmin />} />
          <Route path="/preview-cvs/:cvId" element={<CVPreviewPage />} />

          <Route path="/" element={<Home />} />
          <Route path="/companies" element={<Companies />} />
          <Route path="/companies/:companyId" element={<CompaniesDetail />} />
          <Route path="/jobs/:jobId" element={<JobDetail />} />
          <Route path="/jobs" element={<SearchJob />} />

          {/* Protected candidate routes */}
          <Route path="/profile" element={<RoleRoute element={<MyProfile />} allowedRoles={['candidate']} />} />
          <Route path="/change-password" element={<RoleRoute element={<ChangePassword />} allowedRoles={['candidate']} />} />
          <Route path="/manage-cvs" element={<RoleRoute element={<CVManager />} allowedRoles={['candidate']} />} />
          <Route path="/manage-cvs/:cvId" element={<RoleRoute element={<CVEditTemplate />} allowedRoles={['candidate']} />} />
          <Route path="/upload-cv" element={<RoleRoute element={<UploadCV />} allowedRoles={['candidate']} />} />
          <Route path="/cv-templates" element={<RoleRoute element={<CVTemplatesList />} allowedRoles={['candidate']} />} />
          <Route path="/cv-templates/:templateId" element={<RoleRoute element={<CVBuilderTemplate />} allowedRoles={['candidate']} />} />
          <Route path="/favorite" element={<RoleRoute element={<FavoriteJobs />} allowedRoles={['candidate']} />} />
          <Route path="/applied" element={<RoleRoute element={<AppliedJobs />} allowedRoles={['candidate']} />} />

          <Route path="/employer/profile" element={<RoleRoute element={<EmployerProfile />} allowedRoles={['employer']} />} />
          <Route path="/employer/jobs" element={<RoleRoute element={<EmployerJobs />} allowedRoles={['employer']} />} />
          <Route path="/employer/employers" element={<RoleRoute element={<EmployerManagement />} allowedRoles={['employer']} />} />
          <Route path="/employer/reports" element={<RoleRoute element={<EmployerReports />} allowedRoles={['employer']} />} />

          {/* Admin user management route */}
          <Route path="/admin/dashboard" element={<RoleRoute element={<Dashboard />} allowedRoles={['admin']} />} />
          <Route path="/admin/users" element={<RoleRoute element={<UserManagement />} allowedRoles={['admin']} />} />
          <Route path="/admin/companies" element={<RoleRoute element={<CompanyManagement />} allowedRoles={['admin']} />} />
          <Route path="/admin/jobs" element={<RoleRoute element={<JobManagement />} allowedRoles={['admin']} />} />
          <Route path="/admin/tags" element={<RoleRoute element={<TagManagement />} allowedRoles={['admin']} />} />
          <Route path="/admin/cvs" element={<RoleRoute element={<CVManagement />} allowedRoles={['admin']} />} />
          <Route path="/admin/templates" element={<RoleRoute element={<CVTemplateManagement />} allowedRoles={['admin']} />} />
          <Route path="/admin/templates/new" element={<RoleRoute element={<CVTemplateEditor />} allowedRoles={['admin']} />} />
          <Route path="/admin/templates/:templateId" element={<RoleRoute element={<CVTemplateEditor />} allowedRoles={['admin']} />} />
          <Route path="/admin/notification-templates" element={<RoleRoute element={<NotificationTemplates />} allowedRoles={['admin']} />} />
          <Route path="/admin/notifications" element={<RoleRoute element={<Notifications />} allowedRoles={['admin']} />} />
          <Route path="/admin/notification-emails" element={<RoleRoute element={<NotificationEmails />} allowedRoles={['admin']} />} />
          <Route path="/admin/logs" element={<RoleRoute element={<LogsUI />} allowedRoles={['admin']} />} />


        </Routes>
      </main>
      <ToastContainer
        position="top-right"
        autoClose={3000}
        hideProgressBar={false}
        newestOnTop={false}
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
        theme="colored"
      />
    </div>
  );
}

export default App;
