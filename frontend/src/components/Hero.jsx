// File: src/components/Hero.jsx
export default function Hero() {
  return (
    <section className="bg-[#f7f7f7] text-center rounded-b-4xl p-10 px-30">
      <img
        src="https://via.placeholder.com/70"
        className="mx-auto rounded-full mb-4"
      />
      <p className="text-xs mb-2">👋 Hey! I am John</p>
      <h1 className="text-4xl md:text-5xl font-bold leading-snug mb-6">
        Building digital<br />products, brands, and<br />experience.
      </h1>
      <button className="bg-black text-white px-6 py-3 rounded-full text-sm">
        Latest Shots →
      </button>
    </section>
  );
}
