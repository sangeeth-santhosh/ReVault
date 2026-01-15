const Promo = () => {
  return (
    <>
      <div
        id="section-products"
        className="grid grid-cols-12 gap-6 max-md:grid-cols-1 max-md:gap-4"
      >
        <div className="col-span-7 bg-[#c5e8d5] rounded-[32px] p-6 relative overflow-hidden h-48 flex items-center max-md:col-span-1">
          <div className="relative z-10">
            <h3 className="text-2xl font-semibold mb-4">GET UP TO 50% OFF</h3>
            <button className="px-6 py-2 bg-white/80 backdrop-blur rounded-full text-xs font-semibold">
              Get Discount
            </button>
          </div>
          <img
            src="https://csspicker.dev/api/image/?q=fashion+model+abstract&image_type=photo"
            className="absolute right-0 top-0 h-full w-2/3 object-cover mix-blend-multiply opacity-80"
          />
        </div>
        <div className="col-span-2 row-span-2 bg-gray-50 rounded-[32px] p-6 flex flex-col relative max-md:col-span-1 max-md:row-span-1">
          <div className="flex gap-1 mb-4">
            <div className="w-3 h-3 rounded-full bg-pink-300"></div>
            <div className="w-3 h-3 rounded-full bg-yellow-300"></div>
          </div>
          <button className="absolute top-6 right-6 w-8 h-8 bg-white rounded-full flex items-center justify-center shadow-sm">
            <svg
              className="w-4 h-4 text-black"
              fill="none"
              stroke="#000000"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
              ></path>
            </svg>
          </button>
          {/* <img
            src="https://csspicker.dev/api/image/?q=pink+sandals&image_type=photo"
            className="w-full h-48 object-contain my-4"
          />
          <div className="mt-auto">
            <p className="text-[10px] text-black font-semibold uppercase">
              Our Picks
            </p>
            <h4 className="text-sm font-semibold leading-tight">
              WMX Rubber
              <br></br>
              Zebra sandal
            </h4>
            <div className="mt-4 flex justify-end">
              <span className="bg-blue-600 text-white px-4 py-2 rounded-xl text-xs font-semibold">
                $36
              </span>
            </div>
          </div>
        </div>
        <div className="col-span-3 row-span-2 bg-gray-50 rounded-[32px] p-6 flex flex-col relative max-md:col-span-1 max-md:row-span-1">
          <div className="flex gap-1 mb-4">
            <div className="w-3 h-3 rounded-full bg-yellow-200"></div>
            <div className="w-3 h-3 rounded-full bg-black"></div>
          </div>
          <button className="absolute top-6 right-6 w-8 h-8 bg-white rounded-full flex items-center justify-center shadow-sm">
            <svg
              className="w-4 h-4 text-black"
              fill="none"
              stroke="#000000"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
              ></path>
            </svg>
          </button>
          <img
            src="https://csspicker.dev/api/image/?q=yellow+sneakers&image_type=photo"
            className="w-full h-48 object-contain my-4"
          />
          <div className="mt-auto">
            <p className="text-[10px] text-black font-semibold uppercase">
              Your Choice
            </p>
            <h4 className="text-sm font-semibold leading-tight">
              Supper Skiny
              <br></br>
              jogger in brown
            </h4>
            <div className="mt-4 flex justify-end">
              <span className="bg-blue-600 text-white px-4 py-2 rounded-xl text-xs font-semibold">
                $89
              </span>
            </div>
          </div>
        </div>
        <div
          id="section-inspiration"
          className="col-span-7 bg-[#fdf0b4] rounded-[32px] p-6 relative overflow-hidden h-48 flex items-center max-md:col-span-1"
        >
          <div className="relative z-10">
            <h3 className="text-3xl font-semibold mb-1 text-slate-900">
              Winter's weekend
            </h3>
            <p className="text-sm text-black">keep it casual</p>
          </div>
          <button className="absolute top-6 right-6 w-8 h-8 bg-white rounded-full flex items-center justify-center shadow-sm">
            <svg
              className="w-4 h-4"
              fill="none"
              stroke="#000000"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M14 5l7 7m0 0l-7 7m7-7H3"
              ></path>
            </svg>
          </button>
          <img
            src="https://csspicker.dev/api/image/?q=woman+fashion+portrait&image_type=photo"
            className="absolute right-0 bottom-0 h-[120%] w-1/2 object-cover object-top"
          /> */}
        </div>
      </div>
    </>
  );
};

export default Promo;
