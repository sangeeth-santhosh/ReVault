import { useEffect, useState } from 'react';
import useAuth from '../../hooks/useAuth.js';
import transactionService from '../../services/transactionService.js';
import PaperPlane from '../../components/PaperPlanej.jsx';

const Transactions = () => {
  const { user } = useAuth();
  const userId = user?._id || user?.id;
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const load = async () => {
    setLoading(true);
    setError('');
    try {
      const [mine, seller] = await Promise.all([transactionService.getMy(), transactionService.getSeller()]);
      const merged = [...(mine?.data || []), ...(seller?.data || [])];
      const unique = merged.filter(
        (tx, idx, arr) => arr.findIndex((t) => (t._id || t.id) === (tx._id || tx.id)) === idx
      );
      setTransactions(unique);
    } catch (err) {
      setError(err?.message || 'Could not load transactions');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  return (
    <section className="space-y-6">
      <div className="space-y-1">
        <h1 className="text-2xl font-semibold text-gray-900">Transactions</h1>
        <p className="text-sm text-gray-600">Track settlement and delivery milestones.</p>
      </div>

      {loading ? (
        <div className="text-sm text-gray-600">
          <PaperPlane className="w-10 h-10" />
        </div>
      ) : null}
      {error ? <p className="text-sm text-red-600">{error}</p> : null}

      {!loading && !transactions.length ? (
        <div className="rounded-lg border border-dashed border-gray-300 bg-white p-6 text-sm text-gray-600">
          No transactions yet.
        </div>
      ) : null}

      {!!transactions.length && (
        <div className="overflow-hidden rounded-lg border border-gray-200 bg-white shadow-sm">
          <table className="min-w-full text-sm">
            <thead className="bg-gray-50 text-left text-gray-700">
              <tr>
                <th className="px-4 py-3">Item</th>
                <th className="px-4 py-3">Role</th>
                <th className="px-4 py-3">Value</th>
                <th className="px-4 py-3">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 text-gray-800">
              {transactions.map((tx) => (
                <tr key={tx._id || tx.id}>
                  <td className="px-4 py-3">{tx.request?.inventory?.title || tx.item || tx.inventoryTitle || 'Item'}</td>
                  <td className="px-4 py-3">{
                    String(tx.buyer?._id || tx.buyer) === String(userId)
                      ? 'Buyer'
                      : String(tx.seller?._id || tx.seller) === String(userId)
                      ? 'Seller'
                      : tx.role || '—'
                  }</td>
                  <td className="px-4 py-3">{tx.value ?? tx.amount ?? '—'}</td>
                  <td className="px-4 py-3">
                    <span className="rounded-full bg-gray-100 px-3 py-1 text-xs font-semibold text-gray-700">{tx.status || 'pending'}</span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </section>
  );
};

export default Transactions;
