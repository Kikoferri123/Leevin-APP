import axios from 'axios';

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:8000';
const api = axios.create({ baseURL: API_BASE });

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

api.interceptors.response.use(
  (res) => res,
  (err) => {
    if (err.response?.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    return Promise.reject(err);
  }
);

export default api;

// Auth
export const login = (email: string, password: string) => api.post('/auth/login', { email, password });
export const getMe = () => api.get('/auth/me');
export const getUsers = () => api.get('/auth/users');
export const registerUser = (data: any) => api.post('/auth/register', data);
export const updateUser = (id: number, data: any) => api.put(`/auth/users/${id}`, data);
export const updateProfile = (data: any) => api.put('/auth/me', data);

// Properties
export const getProperties = (params?: any) => api.get('/properties', { params });
export const getProperty = (id: number) => api.get(`/properties/${id}`);
export const createProperty = (data: any) => api.post('/properties', data);
export const updateProperty = (id: number, data: any) => api.put(`/properties/${id}`, data);
export const deleteProperty = (id: number) => api.delete(`/properties/${id}`);
export const getPropertiesRanking = (params?: any) => api.get('/properties/ranking', { params });

// Clients
export const getClients = (params?: any) => api.get('/clients', { params });
export const getClient = (id: number) => api.get(`/clients/${id}`);
export const createClient = (data: any) => api.post('/clients', data);
export const updateClient = (id: number, data: any) => api.put(`/clients/${id}`, data);
export const deleteClient = (id: number) => api.delete(`/clients/${id}`);
export const getClientProfile = (id: number) => api.get(`/clients/${id}/profile`);
export const createRemark = (clientId: number, text: string) => api.post(`/clients/${clientId}/remarks`, { text });
export const deleteRemark = (clientId: number, remarkId: number) => api.delete(`/clients/${clientId}/remarks/${remarkId}`);
export const sendContractEmail = (contractId: number) => api.post(`/contracts/${contractId}/send-email`);

// Rooms & Beds
export const getRooms = (params?: any) => api.get('/rooms', { params });
export const createRoom = (data: any) => api.post('/rooms', data);
export const updateRoom = (id: number, data: any) => api.put(`/rooms/${id}`, data);
export const deleteRoom = (id: number) => api.delete(`/rooms/${id}`);
export const addBed = (roomId: number, data: any) => api.post(`/rooms/${roomId}/beds`, data);
export const deleteBed = (bedId: number) => api.delete(`/rooms/beds/${bedId}`);
export const getAvailability = () => api.get('/rooms/availability');

// Transactions
export const getTransactionsIn = (params?: any) => api.get('/transactions/in', { params });
export const createTransactionIn = (data: any) => api.post('/transactions/in', data);
export const updateTransactionIn = (id: number, data: any) => api.put(`/transactions/in/${id}`, data);
export const deleteTransactionIn = (id: number) => api.delete(`/transactions/in/${id}`);
export const getTransactionsOut = (params?: any) => api.get('/transactions/out', { params });
export const createTransactionOut = (data: any) => api.post('/transactions/out', data);
export const updateTransactionOut = (id: number, data: any) => api.put(`/transactions/out/${id}`, data);
export const deleteTransactionOut = (id: number) => api.delete(`/transactions/out/${id}`);

// Contracts
export const getContracts = (params?: any) => api.get('/contracts', { params });
export const getContract = (id: number) => api.get(`/contracts/${id}`);
export const createContract = (data: any) => api.post('/contracts', data);
export const updateContract = (id: number, data: any) => api.put(`/contracts/${id}`, data);
export const deleteContract = (id: number) => api.delete(`/contracts/${id}`);
export const downloadContractPdf = (id: number) => api.get(`/contracts/${id}/pdf`, { responseType: 'blob' });
export const sendContractByEmail = (id: number, data: any) => api.post(`/contracts/${id}/send-email`, data);
export const saveContractSignature = (id: number, data: { signature_licensee?: string; signature_licensor?: string }) => api.put(`/contracts/${id}/signature`, data);
export const generateSignLink = (id: number) => api.post(`/contracts/${id}/generate-sign-link`);

// Client History
export const getClientHistory = (id: number) => api.get(`/clients/${id}/history`);

// Dashboard
export const getDashboardKPIs = (params?: any) => api.get('/dashboard/kpis', { params });
export const getDashboardOps = () => api.get('/dashboard/kpis-ops');
export const getOccupancyTrend = () => api.get('/dashboard/occupancy-trend');
export const getPnLCaixa = (params?: any) => api.get('/dashboard/pnl/caixa', { params });
export const getPnLCompetencia = (params?: any) => api.get('/dashboard/pnl/competencia', { params });

// Alerts
export const getAlerts = (params?: any) => api.get('/alerts', { params });
export const markAlertRead = (id: number) => api.put(`/alerts/${id}/read`);
export const markAllAlertsRead = () => api.put('/alerts/read-all');
export const generateAlerts = () => api.post('/alerts/generate');

// Documents
export const getDocuments = (params?: any) => api.get('/documents', { params });
export const uploadDocument = (file: File, entityType: 'property' | 'client', entityId: number, category: string, docType: string) => {
  const formData = new FormData();
  formData.append('file', file);
  formData.append('category', category);
  formData.append('doc_type', docType);
  if (entityType === 'property') formData.append('property_id', String(entityId));
  else formData.append('client_id', String(entityId));
  return api.post('/documents/upload', formData, { headers: { 'Content-Type': 'multipart/form-data' } });
};
export const deleteDocument = (id: number) => api.delete(`/documents/${id}`);

// Payments
export const getPayments = (params?: any) => api.get('/payments', { params });
export const getPaymentSummary = (params?: any) => api.get('/payments/summary', { params });

// Settings
export const getSettings = (params?: any) => api.get('/settings', { params });
export const getCategoriesIn = () => api.get('/settings/categories-in');
export const getCategoriesOut = () => api.get('/settings/categories-out');
export const getPaymentMethods = () => api.get('/settings/payment-methods');
export const createSetting = (data: any) => api.post('/settings', data);
export const deleteSetting = (id: number) => api.delete(`/settings/${id}`);

// Maintenance
export const getMaintenance = (params?: any) => api.get('/maintenance', { params });
export const getMaintenanceSummary = () => api.get('/maintenance/summary');
export const createMaintenance = (data: any) => api.post('/maintenance', data);
export const updateMaintenance = (id: number, data: any) => api.put(`/maintenance/${id}`, data);
export const deleteMaintenance = (id: number) => api.delete(`/maintenance/${id}`);

// Deposits
export const getDepositsSummary = (params?: any) => api.get('/dashboard/deposits/summary', { params });

// Reports
export const downloadFinancialReport = (params?: any) => api.get('/reports/financial-pdf', { params, responseType: 'blob' });
export const downloadOccupancyReport = () => api.get('/reports/occupancy-pdf', { responseType: 'blob' });
export const downloadExcelExport = (params?: any) => api.get('/reports/excel', { params, responseType: 'blob' });

// Notifications
export const sendReminders = () => api.post('/notifications/send-reminders');

// Dashboard Extended
export const getContractAlerts = () => api.get('/dashboard/contract-alerts');
export const getDelinquency = () => api.get('/dashboard/delinquency');
export const getRevenueProjection = () => api.get('/dashboard/revenue-projection');
export const getMonthComparison = (params?: any) => api.get('/dashboard/month-comparison', { params });

// Delinquency Report
export const downloadDelinquencyReport = () => api.get('/reports/delinquency-pdf', { responseType: 'blob' });

// Audit Logs
export const getAuditLogs = (params?: any) => api.get('/audit/logs', { params });

// HR Extended
export const getEmployeeProfile = (id: number) => api.get(`/hr/employees/${id}`);
export const getTeamCalendar = (params?: any) => api.get('/hr/team-calendar', { params });
export const createTimeOff = (data: any) => api.post('/hr/time-offs', data);
export const updateTimeOff = (id: number, data: any) => api.put(`/hr/time-offs/${id}`, data);
export const deleteTimeOff = (id: number) => api.delete(`/hr/time-offs/${id}`);
export const createEmployeeDoc = (empId: number, data: any) => api.post(`/hr/employees/${empId}/docs`, data);
export const deleteEmployeeDoc = (empId: number, docId: number) => api.delete(`/hr/employees/${empId}/docs/${docId}`);
export const createEmployeeRemark = (empId: number, data: any) => api.post(`/hr/employees/${empId}/remarks`, data);
export const deleteEmployeeRemark = (empId: number, remarkId: number) => api.delete(`/hr/employees/${empId}/remarks/${remarkId}`);
export const createPerformanceReview = (empId: number, data: any) => api.post(`/hr/employees/${empId}/reviews`, data);
export const deletePerformanceReview = (empId: number, reviewId: number) => api.delete(`/hr/employees/${empId}/reviews/${reviewId}`);

// Admin Features - News
export const getAdminNews = (params?: any) => api.get('/admin-features/news', { params });
export const createNews = (data: any) => api.post('/admin-features/news', data);
export const updateNews = (id: number, data: any) => api.put(`/admin-features/news/${id}`, data);
export const deleteNews = (id: number) => api.delete(`/admin-features/news/${id}`);

// Admin Features - Messages
export const getAdminMessages = (params?: any) => api.get('/admin-features/messages', { params });
export const getAdminMessage = (id: number) => api.get(`/admin-features/messages/${id}`);
export const replyMessage = (data: any) => api.post('/admin-features/messages/reply', data);
export const deleteMessage = (id: number) => api.delete(`/admin-features/messages/${id}`);

// Admin Features - Rewards
export const getAdminRewards = (params?: any) => api.get('/admin-features/rewards', { params });
export const addRewardPoints = (data: any) => api.post('/admin-features/rewards/add-points', data);
export const getRewardTransactions = (params?: any) => api.get('/admin-features/rewards/transactions', { params });

// Admin Features - Check-ins
export const getAdminCheckins = (params?: any) => api.get('/admin-features/checkins', { params });

// Admin Features - Reviews
export const getAdminReviews = (params?: any) => api.get('/admin-features/reviews', { params });
export const respondReview = (id: number, data: any) => api.put(`/admin-features/reviews/${id}/respond`, data);

// Admin Features - FAQ
export const getAdminFaq = (params?: any) => api.get('/admin-features/faq', { params });
export const createFaq = (data: any) => api.post('/admin-features/faq', data);
export const updateFaq = (id: number, data: any) => api.put(`/admin-features/faq/${id}`, data);
export const deleteFaq = (id: number) => api.delete(`/admin-features/faq/${id}`);

// Admin Features - Referrals
export const getAdminReferrals = (params?: any) => api.get('/admin-features/referrals', { params });
export const updateReferralStatus = (id: number, data: any) => api.put(`/admin-features/referrals/${id}/status`, data);

// Branding
export const getBranding = () => api.get('/branding');
export const updateBranding = (data: any) => api.put('/branding', data);
