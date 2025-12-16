import { useEffect, useState } from 'react';
import reportService from '../../services/reportService.js';

const Reports = () => {
  const [summary, setSummary] = useState({
    totalCompletedTransactions: 0,
    totalQuantityTransferred: 0,
    totalInventoryPosted: 0,
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [downloading, setDownloading] = useState(false);

  const load = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await reportService.getSummary();
      setSummary(res?.data || {});
    } catch (err) {
      setError(err?.message || 'Could not load reports');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const triggerDownload = async (type) => {
    try {
      setDownloading(true);
      const blob = type === 'csv' ? await reportService.downloadCsv() : await reportService.downloadPdf();
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = type === 'csv' ? 'transactions.csv' : 'transactions.pdf';
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
    } catch (err) {
      setError(err?.message || 'Download failed');
    } finally {
      setDownloading(false);
    }
  };

  const cards = [
    { id: 'completed', title: 'Completed transactions', value: summary.totalCompletedTransactions ?? 0 },
    { id: 'quantity', title: 'Quantity transferred', value: summary.totalQuantityTransferred ?? 0 },
    { id: 'inventory', title: 'Inventory posted', value: summary.totalInventoryPosted ?? 0 },
  ];

  return (
    <section className="space-y-6">
      <div className="space-y-1">
        <h1 className="text-2xl font-semibold text-gray-900">Reports</h1>
        <p className="text-sm text-gray-600">Export insights on inventory, requests, and transactions.</p>
      </div>

      {error ? <p className="text-sm text-red-600">{error}</p> : null}

      <div className="grid gap-3 md:grid-cols-2">
        {cards.map((card) => (
          <article key={card.id} className="rounded-lg border border-gray-200 bg-white p-4 shadow-sm">
            <p className="text-xs uppercase text-gray-500">Completed transactions</p>
            <h3 className="text-lg font-semibold text-gray-900">{card.title}</h3>
            <div className="mt-3 space-y-2 text-sm text-gray-700">
              <div className="space-y-1">
                <div className="flex items-center justify-between text-xs text-gray-600">
                  <span>Value</span>
                  <span>{loading ? '—' : card.value}</span>
                </div>
                <div className="h-2 rounded-full bg-gray-100">
                  <div
                    className="h-2 rounded-full bg-gray-900"
                    style={{ width: `${Math.min((card.value || 0) * 4, 100)}%` }}
                  />
                </div>
              </div>
            </div>
            <div className="mt-4 flex items-center gap-2 text-sm text-gray-700">
              <button
                onClick={() => triggerDownload('csv')}
                disabled={downloading}
                className="rounded-md bg-gray-900 px-3 py-1.5 text-sm text-white hover:bg-gray-800 disabled:opacity-60"
              >
                {downloading ? 'Preparing…' : 'Download CSV'}
              </button>
              <button
                onClick={() => triggerDownload('pdf')}
                disabled={downloading}
                className="rounded-md border border-gray-200 px-3 py-1.5 text-sm hover:border-gray-300 disabled:opacity-60"
              >
                PDF
              </button>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
};

export default Reports;
