import React from 'react';
import { DotLottieReact } from '@lottiefiles/dotlottie-react';

const PaperPlane = ({ className = 'w-10 h-10' }) => {
  return (
    <div className={className} role="img" aria-label="Loading">
      <DotLottieReact
        src="https://lottie.host/7d110d60-f0d6-483f-98b5-69fb1f6765c7/p4diuTNJgR.lottie"
        loop
        autoplay
        style={{ width: '100%', height: '100%' }}
      />
    </div>
  );
};

export default PaperPlane;
