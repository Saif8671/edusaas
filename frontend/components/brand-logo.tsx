import Image from "next/image";
import { cn } from "@/lib/utils";

type BrandLogoProps = {
  className?: string;
  priority?: boolean;
  width?: number;
  height?: number;
  alt?: string;
};

export function BrandLogo({
  className,
  priority = false,
  width = 180,
  height = 70,
  alt = "EduLMS logo",
}: BrandLogoProps) {
  return (
    <Image
      src="/edulms-logo-dark.png"
      alt={alt}
      width={width}
      height={height}
      priority={priority}
      className={cn(
        "h-auto select-none object-contain opacity-95 drop-shadow-[0_1px_1px_rgba(0,0,0,0.08)]",
        className,
      )}
    />
  );
}
