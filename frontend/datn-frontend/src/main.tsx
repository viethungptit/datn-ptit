import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import './index.css';
import App from './App';
import { store } from './redux/store';
import { Provider } from 'react-redux';
import { setAuthFromToken } from './redux/authSlice';
import { BrowserRouter } from 'react-router-dom';

const accessToken = localStorage.getItem('accessToken');
if (accessToken) {
  store.dispatch(setAuthFromToken(accessToken));
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <Provider store={store}>
      <BrowserRouter>
        <App />
      </BrowserRouter>
    </Provider>
  </StrictMode>
);
