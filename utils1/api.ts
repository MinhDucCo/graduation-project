import axios from 'axios';

// Tạo axios instance với cấu hình mặc định
const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000/api',
   withCredentials: true, // Cho phép gửi cookies
  headers: {
    'Content-Type': 'application/json',
  },
 
});

// Interceptor cho request
api.interceptors.request.use(
  (config) => {
    // Có thể thêm token vào header nếu cần
    const user = typeof window !== 'undefined' ? localStorage.getItem('user') : null;
    if (user) {
      try {
        const userData = JSON.parse(user);
        // Nếu backend yêu cầu token trong header, thêm vào đây
        // config.headers.Authorization = `Bearer ${userData.token}`;
      } catch (e) {
        // Ignore parsing errors
      }
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Interceptor cho response
api.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    // Xử lý lỗi chung nếu cần
    if (error.response?.status === 401) {
      // Unauthorized - có thể redirect đến trang login
      if (typeof window !== 'undefined') {
        localStorage.removeItem('user');
        localStorage.removeItem('id_user');
        window.location.href = '/Login';
      }
    }
    return Promise.reject(error);
  }
);

export { api };

