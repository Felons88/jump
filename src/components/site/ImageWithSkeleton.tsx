import { useState } from "react";
import { cn } from "@/lib/utils";
import { Skeleton } from "@/components/ui/skeleton";

type ImageWithSkeletonProps = {
  src: string;
  alt: string;
  className?: string;
  wrapperClass?: string;
  priority?: boolean;
};

export function ImageWithSkeleton({
  src,
  alt,
  className,
  wrapperClass,
  priority = false,
}: ImageWithSkeletonProps) {
  const [loaded, setLoaded] = useState(false);

  return (
    <div className={cn("relative overflow-hidden", wrapperClass)}>
      <img
        src={src}
        alt={alt}
        loading={priority ? "eager" : "lazy"}
        decoding="async"
        onLoad={() => setLoaded(true)}
        onError={() => setLoaded(true)}
        className={cn(
          "h-full w-full object-cover transition-opacity duration-300",
          loaded ? "opacity-100" : "opacity-0",
          className,
        )}
      />
      {!loaded && <Skeleton className="absolute inset-0" />}
    </div>
  );
}
