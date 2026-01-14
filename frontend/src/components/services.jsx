// File: src/components/Services.jsx
export default function Services() {
  return (
    <>
      <div className="bg-[#f7f7f7] p-10">
        <h2 className="text-center text-xl font-semibold mb-10">
          Collaborate with brands and agencies
          <br />
          to create impactful results.
        </h2>

        <section className="grid md:grid-cols-4 gap-10 mb-20 text-center">
          <div>
            <h3 className="font-semibold mb-2">UI & UX</h3>
            <p className="text-sm text-gray-600">
              Research – Creative Direction – Visual Design
            </p>
          </div>
          <div>
            <h3 className="font-semibold mb-2">Web & Mobile App</h3>
            <p className="text-sm text-gray-600">
              Development – Prototyping – Wireframing
            </p>
          </div>
          <div>
            <h3 className="font-semibold mb-2">Design & Creative</h3>
            <p className="text-sm text-gray-600">
              Brand Identity – Illustrations – Strategy
            </p>
          </div>
          <div>
            <h3 className="font-semibold mb-2">Development</h3>
            <p className="text-sm text-gray-600">
              Frontend – Backend – Full‑Stack
            </p>
          </div>
        </section>
      </div>
    </>
  );
}
