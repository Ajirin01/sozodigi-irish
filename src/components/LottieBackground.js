'use client';

import { useEffect, useRef } from 'react';

export default function LottieImage({ src, width = "100%", height = "100%", loop = true, autoplay = true }) {
  const container = useRef(null);

  useEffect(() => {
    let animationInstance;

    import('lottie-web').then((lottie) => {
      animationInstance = lottie.loadAnimation({
        container: container.current,
        renderer: 'svg',
        loop,
        autoplay,
        path: src, // JSON file path (e.g. /lottie/animation.json)
      });
    });

    return () => {
      if (animationInstance) {
        animationInstance.destroy();
      }
    };
  }, [src, loop, autoplay]);

  return <div ref={container} style={{ width, height }} />;
}
