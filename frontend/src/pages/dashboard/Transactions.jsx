import { useEffect, useState } from 'react';
import useAuth from '../../hooks/useAuth.js';
import transactionService from '../../services/transactionService.js';

const Transactions = () => {
  const { user } = useAuth();
  const userId = user?._id || user?.id;

  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const loadTransactions = async () => {
    setLoading(true);
    setError('');

    try {
      const [mine, seller] = await Promise.all([
        transactionService.getMy(),
        transactionService.getSeller(),
      ]);

      const merged = [...(mine?.data || []), ...(seller?.data || [])];

      const unique = merged.filter(
        (tx, index, arr) =>
          arr.findIndex(
            (t) => (t._id || t.id) === (tx._id || tx.id)
          ) === index
      );

      setTransactions(unique);
    } catch (err) {
      setError(err?.message || 'Could not load transactions');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadTransactions();
  }, []);

  return (
    <section className="space-y-6">
      {loading && (
        <div className="text-sm text-gray-600"></div>
      )}

      {error && (
        <p className="text-sm text-red-600">{error}</p>
      )}

      {!loading && !transactions.length && (
        <div className="rounded-lg border border-dashed border-gray-300 bg-white p-6 text-sm text-gray-600">
          No transactions yet.
        </div>
      )}

      {!!transactions.length && (
        <div className="overflow-hidden rounded-lg border border-gray-200 bg-white shadow-sm">
          <table className="min-w-full text-sm">
            <thead className="bg-gray-50 text-left text-gray-700">
              <tr>
                <th className="px-4 py-3">Item</th>
                <th className="px-4 py-3">Buyer</th>
                <th className="px-4 py-3">Seller</th>
                <th className="px-4 py-3">Role</th>
                <th className="px-4 py-3">Value</th>
                <th className="px-4 py-3">Date</th>
                <th className="px-4 py-3">Status</th>
              </tr>
            </thead>

            <tbody className="divide-y divide-gray-200 text-gray-800">
              {transactions.map((tx) => {
                const txId = tx._id || tx.id;

                const buyerName =
                  typeof tx.buyer === 'object'
                    ? tx.buyer?.businessName || tx.buyer?.name
                    : typeof tx.buyer === 'string'
                    ? tx.buyer
                    : '—';

                const sellerName =
                  typeof tx.seller === 'object'
                    ? tx.seller?.businessName || tx.seller?.name
                    : typeof tx.seller === 'string'
                    ? tx.seller
                    : '—';

                const role =
                  String(tx.buyer?._id || tx.buyer) === String(userId)
                    ? 'Buyer'
                    : String(tx.seller?._id || tx.seller) === String(userId)
                    ? 'Seller'
                    : tx.role || '—';

                return (
                  <tr key={txId}>
                    <td className="px-4 py-3">
                      {tx.request?.inventory?.title ||
                        tx.item ||
                        tx.inventoryTitle ||
                        'Item'}
                    </td>

                    <td className="px-4 py-3">{buyerName}</td>

                    <td className="px-4 py-3">{sellerName}</td>

                    <td className="px-4 py-3">{role}</td>

                    <td className="px-4 py-3">
                      {tx.value ?? tx.amount ?? '—'}
                    </td>

                    <td className="px-4 py-3">
                      {new Date(
                        tx.createdAt || tx.date || tx.timestamp
                      ).toLocaleDateString()}
                    </td>

                    <td className="px-4 py-3">
                      <span className="rounded-full bg-gray-100 px-3 py-1 text-xs font-semibold text-gray-700">
                        {tx.status || 'pending'}
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </section>
  );
};

export default Transactions;
