'use client';

import Lottie from "lottie-react";
import ringingAnimation from "@/assets/lottie/ringing.json";

const LottieRinger = () => {
  return (
    <div className="fixed inset-0 z-999999999 flex items-center justify-center bg-black bg-opacity-60">
      <div className="text-center">
        <div className="w-32 h-32 mx-auto">
          <Lottie animationData={ringingAnimation} loop autoplay />
        </div>
        <p className="mt-6 text-xl text-white">Connecting you to the specialist...</p>
      </div>
    </div>
  );
};

export default LottieRinger;
