import apiClient from './apiClient.js';

export const getSummary = () => apiClient.get('/reports/summary');

export const getInventoryReport = () => apiClient.get('/reports/inventory');
export const getCompletedTransactionsReport = () => apiClient.get('/reports/completed-transactions');
export const getQuantityTransferredReport = () => apiClient.get('/reports/quantity-transferred');

const fetchBlob = async (path) => {
	try {
		return await apiClient.getBlob(path);
	} catch (err) {
		if (err?.message === 'VITE_API_BASE_URL is not set') throw err;
		throw new Error('Could not download report');
	}
};

export const downloadInventoryCsv = () => fetchBlob('/reports/inventory/csv');
export const downloadInventoryPdf = () => fetchBlob('/reports/inventory/pdf');

export const downloadCompletedTransactionsCsv = () => fetchBlob('/reports/completed-transactions/csv');
export const downloadCompletedTransactionsPdf = () => fetchBlob('/reports/completed-transactions/pdf');

export const downloadQuantityTransferredCsv = () => fetchBlob('/reports/quantity-transferred/csv');
export const downloadQuantityTransferredPdf = () => fetchBlob('/reports/quantity-transferred/pdf');

export default {
  getSummary,
  getInventoryReport,
  getCompletedTransactionsReport,
  getQuantityTransferredReport,
  downloadInventoryCsv,
  downloadInventoryPdf,
  downloadCompletedTransactionsCsv,
  downloadCompletedTransactionsPdf,
  downloadQuantityTransferredCsv,
  downloadQuantityTransferredPdf,
};
