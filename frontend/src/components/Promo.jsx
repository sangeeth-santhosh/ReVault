import Images from "../assets/Images";

const Promo = () => {
  return (
    <>
      <div
        id="section-products"
        className="w-full grid grid-cols-12 gap-6 max-md:grid-cols-1 max-md:gap-4"
      >
        <div className="col-span-7 bg-[#c5e8d5] rounded-[32px] p-6 relative overflow-hidden h-48 flex items-center max-md:col-span-1">
          <div className="relative z-10">
            <h3 className="text-[16px] font-semibold mb-4 max-w-full break-words">
              "John is a man of focus, commitment, sheer will... something you
              know <br /> very little about. I once saw him kill three men in a
              bar... with a pencil. <br /> With a pencil!"
            </h3>
            <button type="button" className="px-6 py-2 bg-white/80 backdrop-blur rounded-full text-xs font-semibold">
              John Wick
            </button>
          </div>
          <img
            src={Images.Spidi}
            className="absolute right-0 top-0 h-full w-3/5 object-contain object-right mix-blend-multiply opacity-80 max-sm:w-1/2"
            alt="Promo"
          />
        </div>

      </div>
    </>
  );
};

export default Promo;

