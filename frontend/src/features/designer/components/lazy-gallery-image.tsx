import { useEffect, useRef, useState, type ImgHTMLAttributes } from 'react';

type LazyGalleryImageProps = Omit<ImgHTMLAttributes<HTMLImageElement>, 'decoding' | 'loading' | 'src'> & {
  src: string;
};

export function LazyGalleryImage({ src, ...props }: LazyGalleryImageProps) {
  const imageRef = useRef<HTMLImageElement>(null);
  const [visibleSource, setVisibleSource] = useState<string | null>(null);
  const shouldLoad = visibleSource === src;

  useEffect(() => {
    const image = imageRef.current;
    if (!image) return;

    if (typeof IntersectionObserver === 'undefined') {
      setVisibleSource(src);
      return;
    }

    const observer = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) {
        setVisibleSource(src);
        observer.disconnect();
      }
    }, { rootMargin: '200px 0px' });

    observer.observe(image);
    return () => observer.disconnect();
  }, [src]);

  return (
    <img
      {...props}
      ref={imageRef}
      src={shouldLoad ? src : undefined}
      loading={shouldLoad ? 'eager' : 'lazy'}
      decoding="async"
    />
  );
}
