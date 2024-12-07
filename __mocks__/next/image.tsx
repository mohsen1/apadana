import React from 'react';
import { vi } from 'vitest';

const MockNextImage = vi.fn().mockImplementation(({ src, alt, ...props }) => {
  // eslint-disable-next-line @next/next/no-img-element
  return <img src={src} alt={alt} {...props} />;
});

export default MockNextImage;
