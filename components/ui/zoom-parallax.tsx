'use client';

import { useScroll, useTransform, motion } from 'framer-motion';
import { useRef } from 'react';

interface Image {
  src: string;
  alt?: string;
}

interface ZoomParallaxProps {
  /** Array of images to be displayed in the parallax effect max 7 images */
  images: Image[];
}

export function ZoomParallax({ images }: ZoomParallaxProps) {
  const container = useRef(null);

  // Each image gets its own scroll section (100vh per image)
  // Total height = number of images × 100vh
  const sectionHeight = 100; // viewport height per image
  const totalSections = images.length;

  return (
    <div ref={container} className="relative" style={{ height: `${totalSections * sectionHeight}vh` }}>
      <div className="sticky top-0 h-screen overflow-hidden bg-black">
        {images.map(({ src, alt }, index) => {
          const sectionStart = index * sectionHeight;
          const sectionEnd = (index + 1) * sectionHeight;

          return (
            <ImageScroller
              key={index}
              src={src}
              alt={alt || `Parallax image ${index + 1}`}
              index={index}
              sectionStart={sectionStart}
              sectionEnd={sectionEnd}
              containerRef={container}
            />
          );
        })}
      </div>
    </div>
  );
}

interface ImageScrollerProps {
  src: string;
  alt: string;
  index: number;
  sectionStart: number;
  sectionEnd: number;
  containerRef: React.RefObject<HTMLDivElement>;
}

function ImageScroller({
  src,
  alt,
  index,
  sectionStart,
  sectionEnd,
  containerRef,
}: ImageScrollerProps) {
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ['start start', 'end end'],
  });

  // Map the full scroll range to this image's section
  // 7 images: each gets 1/7 of the 0-1 range
  const totalImages = 7; // Update if you change image count
  const sectionStart_normalized = index / totalImages;
  const sectionEnd_normalized = (index + 1) / totalImages;
  
  const imageProgress = useTransform(
    scrollYProgress,
    [sectionStart_normalized, sectionEnd_normalized],
    [0, 1]
  );

  // Scale from 1 to 4: image grows from 25vh×25vw to 100vh×100vw (fills viewport)
  const scale = useTransform(imageProgress, [0, 1], [1, 4]);

  // Fade in slightly
  const opacity = useTransform(imageProgress, [0, 0.1, 1], [0.3, 1, 1]);

  return (
    <motion.div
      style={{
        scale,
        opacity,
      }}
      className="absolute inset-0 flex items-center justify-center"
    >
      {/* Fixed size: 25vw × 25vh. When scaled 4x, fills 100vw × 100vh viewport */}
      <div className="w-[25vw] h-[25vh] flex items-center justify-center">
        <img
          src={src || '/placeholder.svg'}
          alt={alt}
          className="w-full h-full object-cover"
        />
      </div>
    </motion.div>
  );
}
