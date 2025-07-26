'use client';

import dynamic from 'next/dynamic';
import React from 'react';

const Map = dynamic(() => import('./Map'), { ssr: false });

const MapClientOnly = () => {
  return <Map />;
};

export default MapClientOnly;
