import { Link } from 'react-router-dom';

// File: src/components/Footer.jsx
export default function Footer() {
  return (
    <section className="bg-white rounded-3xl p-12 text-center">
      <h2 className="text-2xl font-semibold mb-4">Tell me about your next project</h2>
      <Link
        to="/contact"
        className="bg-black text-white px-6 py-3 rounded-full text-sm inline-block hover:opacity-90"
      >
        Let’s Talk →
      </Link>
    </section>
  );
}
