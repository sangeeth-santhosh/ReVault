const Reports = () => {
  const reports = [
    { id: 'REP-12', title: 'Monthly performance', period: 'Nov 2025' },
    { id: 'REP-11', title: 'Deal cycle analysis', period: 'Q3 2025' },
  ];

  const mockSeries = [
    { label: 'Listings', value: 18 },
    { label: 'Requests', value: 32 },
    { label: 'Transactions', value: 11 },
  ];

  return (
    <section className="space-y-6">
      <div className="space-y-1">
        <h1 className="text-2xl font-semibold text-gray-900">Reports</h1>
        <p className="text-sm text-gray-600">Export insights on inventory, requests, and transactions.</p>
      </div>

      <div className="grid gap-3 md:grid-cols-2">
        {reports.map((r) => (
          <article key={r.id} className="rounded-lg border border-gray-200 bg-white p-4 shadow-sm">
            <p className="text-xs uppercase text-gray-500">{r.period}</p>
            <h3 className="text-lg font-semibold text-gray-900">{r.title}</h3>
            <div className="mt-3 space-y-2 text-sm text-gray-700">
              {mockSeries.map((s) => (
                <div key={s.label} className="space-y-1">
                  <div className="flex items-center justify-between text-xs text-gray-600">
                    <span>{s.label}</span>
                    <span>{s.value}</span>
                  </div>
                  <div className="h-2 rounded-full bg-gray-100">
                    <div className="h-2 rounded-full bg-gray-900" style={{ width: `${Math.min(s.value * 4, 100)}%` }} />
                  </div>
                </div>
              ))}
            </div>
            <button className="mt-4 rounded-md bg-gray-900 px-3 py-1.5 text-sm text-white hover:bg-gray-800">
              Download
            </button>
          </article>
        ))}
      </div>
    </section>
  );
};

export default Reports;
