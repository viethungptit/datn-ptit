import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import './index.css';
import App from './App.tsx';
import { store } from './redux/store';
import { Provider } from 'react-redux';
import { setAuthFromToken, refreshToken } from './redux/authSlice';
import { jwtDecode } from 'jwt-decode';

// Khởi tạo xác thực từ localStorage khi app khởi động
const accessToken = localStorage.getItem('accessToken');
if (accessToken) {
  try {
    const decoded: any = jwtDecode(accessToken);
    const now = Date.now() / 1000;
    if (decoded.exp > now) {
      store.dispatch(setAuthFromToken(accessToken));
    } else {
      store.dispatch(refreshToken());
    }
  } catch {
    localStorage.removeItem('accessToken');
  }
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <Provider store={store}>
      <App />
    </Provider>
  </StrictMode>,
)
