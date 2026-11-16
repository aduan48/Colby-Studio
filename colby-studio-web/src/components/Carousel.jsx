import React, { useState, useEffect, useLayoutEffect, useRef } from 'react';
import carousel1 from '../assets/carousel/image1.webp';
import carousel2 from '../assets/carousel/image2.webp';
import carousel3 from '../assets/carousel/image3.webp';
import carousel4 from '../assets/carousel/image4.webp';
import carousel5 from '../assets/carousel/image5.webp';
import carousel6 from '../assets/carousel/image6.webp';
import carousel7 from '../assets/carousel/image7.webp';

import '../styles/Carousel.css';

const IMAGES = [carousel1, carousel2, carousel3, carousel4, carousel5, carousel6, carousel7];

/**
 * An infinitely scrolling photo carousel.
 *
 * The images are rendered as a "group", and the group is repeated enough times to
 * fill the screen plus one extra. Every group slides left by exactly its own width,
 * then the animation restarts. Because the next copy is identical, the loop is seamless.
 */
function Carousel() {
  const stripRef = useRef(null);   // the visible carousel strip
  const groupRef = useRef(null);   // the first group, used to measure one set of images
  const [copies, setCopies] = useState(2);
  const [isMounted, setIsMounted] = useState(false);

  /** Render enough copies of the group to fill the screen, plus one to slide in */
  useLayoutEffect(() => {
    const update = () => {
      const stripW = stripRef.current?.offsetWidth;
      const groupW = groupRef.current?.offsetWidth;
      if (!stripW || !groupW) return;
      setCopies(Math.max(2, Math.ceil(stripW / groupW) + 1));
    };
    update();
    const ro = new ResizeObserver(update); // also fires as the images load in
    ro.observe(stripRef.current);
    ro.observe(groupRef.current);
    return () => ro.disconnect();
  }, []);

  /** Start the animation only after mounting, so it always begins from a clean start */
  useEffect(() => {
    setIsMounted(true);
    return () => setIsMounted(false);
  }, []);

  return (
    <div className="carousel" ref={stripRef}>
      {Array.from({ length: copies }, (_, i) => (
        <div
          key={i}
          ref={i === 0 ? groupRef : undefined}
          className={`group ${isMounted ? 'animate' : ''}`}
          aria-hidden={i > 0 ? true : undefined} // screen readers only read the first copy
        >
          {IMAGES.map((src, j) => (
            <img
              key={j}
              src={src}
              alt={i === 0 ? `Studio photo ${j + 1}` : ''}
              className="card"
              draggable={false}
            />
          ))}
        </div>
      ))}
    </div>
  );
}

export default Carousel;
