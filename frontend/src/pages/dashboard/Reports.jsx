import { useEffect, useState } from 'react';
import reportService from '../../services/reportService.js';

const CARDS = [
  {
    id: 'inventory',
    title: 'Inventory Posted',
    valueKey: 'totalInventoryPosted',
    downloadCsv: reportService.downloadInventoryCsv,
    downloadPdf: reportService.downloadInventoryPdf,
  },
  {
    id: 'completed',
    title: 'Completed Transactions',
    valueKey: 'totalCompletedTransactions',
    downloadCsv: reportService.downloadCompletedTransactionsCsv,
    downloadPdf: reportService.downloadCompletedTransactionsPdf,
  },
  {
    id: 'quantity',
    title: 'Quantity Transferred',
    valueKey: 'totalQuantityTransferred',
    downloadCsv: reportService.downloadQuantityTransferredCsv,
    downloadPdf: reportService.downloadQuantityTransferredPdf,
  },
];

const Reports = () => {
  const [summary, setSummary] = useState({
    totalCompletedTransactions: 0,
    totalQuantityTransferred: 0,
    totalInventoryPosted: 0,
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [downloadingId, setDownloadingId] = useState('');

  const load = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await reportService.getSummary();
      setSummary({
        totalCompletedTransactions: res?.data?.totalCompletedTransactions ?? 0,
        totalQuantityTransferred: res?.data?.totalQuantityTransferred ?? 0,
        totalInventoryPosted: res?.data?.totalInventoryPosted ?? 0,
      });
    } catch (err) {
      setError(err?.message || 'Could not load reports');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const triggerDownload = async (card, format) => {
    if (!card) return;
    try {
      setDownloadingId(`${card.id}-${format}`);
      const blob = format === 'csv' ? await card.downloadCsv() : await card.downloadPdf();
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `${card.title.replace(/\s+/g, '-').toLowerCase()}.${format}`;
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
    } catch (err) {
      setError(err?.message || 'Download failed');
    } finally {
      setDownloadingId('');
    }
  };

  return (
    <section className="space-y-6">
      <div className="space-y-1">
        <h1 className="text-2xl font-semibold text-gray-900">Reports</h1>
        <p className="text-sm text-gray-600">Export insights on inventory, requests, and transactions.</p>
      </div>

      {error ? <p className="text-sm text-red-600">{error}</p> : null}

      <div className="grid gap-3 md:grid-cols-2">
        {CARDS.map((card) => (
          <article key={card.id} className="rounded-lg border border-gray-200 bg-white p-4 shadow-sm">
            <p className="text-xs uppercase text-gray-500">Reports</p>
            <h3 className="text-lg font-semibold text-gray-900">{card.title}</h3>
            <div className="mt-3 space-y-2 text-sm text-gray-700">
              <div className="space-y-1">
                <div className="flex items-center justify-between text-xs text-gray-600">
                  <span>Value</span>
                  <span>{loading ? '—' : summary[card.valueKey] ?? 0}</span>
                </div>
                <div className="h-2 rounded-full bg-gray-100">
                  <div
                    className="h-2 rounded-full bg-gray-900"
                    style={{ width: `${Math.min(((summary[card.valueKey] ?? 0) || 0) * 4, 100)}%` }}
                  />
                </div>
              </div>
            </div>
            <div className="mt-4 flex items-center gap-2 text-sm text-gray-700">
              <button
                onClick={() => triggerDownload(card, 'csv')}
                disabled={!!downloadingId}
                className="rounded-md bg-gray-900 px-3 py-1.5 text-sm text-white hover:bg-gray-800 disabled:opacity-60"
              >
                {downloadingId === `${card.id}-csv` ? 'Preparing…' : 'Download CSV'}
              </button>
              <button
                onClick={() => triggerDownload(card, 'pdf')}
                disabled={!!downloadingId}
                className="rounded-md border border-gray-200 px-3 py-1.5 text-sm hover:border-gray-300 disabled:opacity-60"
              >
                {downloadingId === `${card.id}-pdf` ? 'Preparing…' : 'PDF'}
              </button>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
};

export default Reports;
