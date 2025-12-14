import { Link } from 'react-router-dom';

const Home = () => {
  return (
    <section className="grid gap-8 lg:grid-cols-[1.1fr_0.9fr] items-start">
      <div className="space-y-6">
        <p className="inline-flex rounded-full bg-gray-900 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-white">B2B surplus exchange</p>
        <h1 className="text-4xl font-bold leading-tight text-gray-900">
          Move surplus inventory faster with trusted B2B partners.
        </h1>
        <p className="text-lg text-gray-600">
          List excess stock, receive qualified requests, and manage deals from inquiry to transaction.
        </p>
        <div className="flex flex-wrap gap-3">
          <Link
            to="/register"
            className="rounded-lg bg-gray-900 px-4 py-2 text-white hover:bg-gray-800"
          >
            Get started
          </Link>
          <Link
            to="/browse"
            className="rounded-lg border border-gray-200 px-4 py-2 text-gray-800 hover:border-gray-300"
          >
            Browse surplus
          </Link>
        </div>
        <div className="grid gap-4 sm:grid-cols-3">
          {[
            { label: 'Companies', value: '1.2k+' },
            { label: 'Listings', value: '18k+' },
            { label: 'Fulfillment rate', value: '92%' },
          ].map((item) => (
            <div key={item.label} className="rounded-lg border border-gray-200 bg-white p-4 shadow-sm">
              <div className="text-2xl font-semibold text-gray-900">{item.value}</div>
              <div className="text-sm text-gray-500">{item.label}</div>
            </div>
          ))}
        </div>

        <div className="space-y-3">
          <h2 className="text-lg font-semibold text-gray-900">Browse by category</h2>
          <div className="grid gap-3 sm:grid-cols-3">
            {['Metals', 'Plastics & Packaging', 'Chemicals', 'Food-grade', 'Industrial parts', 'Electronics'].map((cat) => (
              <Link
                key={cat}
                to="/browse"
                className="rounded-lg border border-gray-200 bg-white px-4 py-3 text-sm font-medium text-gray-800 shadow-sm hover:border-gray-300"
              >
                {cat}
              </Link>
            ))}
          </div>
        </div>
      </div>
      <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
        <div className="flex items-center justify-between text-sm font-semibold text-gray-700">
          <span>Live deal board</span>
          <Link to="/browse" className="text-xs font-medium text-gray-600 hover:text-gray-900">View all</Link>
        </div>
        <div className="mt-4 space-y-3">
          {[
            { title: 'Bulk corrugated packaging', price: '$12,400', status: 'Active' },
            { title: 'Industrial valves (grade A)', price: '$31,900', status: 'Negotiating' },
            { title: 'Food-grade totes', price: '$8,750', status: 'Active' },
          ].map((card) => (
            <div key={card.title} className="rounded-lg border border-gray-100 bg-gray-50 p-4">
              <div className="text-base font-semibold text-gray-900">{card.title}</div>
              <div className="text-sm text-gray-600">Expected value {card.price}</div>
              <span className="mt-2 inline-block rounded-full bg-emerald-100 px-3 py-1 text-xs font-semibold text-emerald-800">
                {card.status}
              </span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Home;
