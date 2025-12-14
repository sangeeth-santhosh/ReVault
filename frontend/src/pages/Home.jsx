// React + Tailwind version split into components
// File: src/pages/Home.jsx
import Header from '../components/Header';
import Hero from '../components/Hero';
import Logos from '../components/Logos';
import Services from '../components/services';
import Footer from '../components/Footer';

const Home = () => {
  return (
    <div className="bg-[#f7f7f7]">
      <div className="mx-auto">
        <Header />
        <Hero />
        <Logos />
        <Services />
        <Footer />
      </div>
    </div>
  );
}

export default Home;