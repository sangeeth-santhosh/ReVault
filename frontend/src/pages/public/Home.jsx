import Hero from '../../components/Hero';
import Logos from '../../components/Logos';
import Services from '../../components/services';

const Home = () => {
  return (
    <div className="bg-[#f7f7f7]">
      <div className="mx-auto">
        <Hero />
        <Logos />
        <Services />
      </div>
    </div>
  );
};

export default Home;
