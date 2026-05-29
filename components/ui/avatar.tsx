"use client";

import { useState } from "react";
import Image from "next/image";
import { cn } from "@/lib/utils";

interface AvatarProps {
  src?: string | null;
  name?: string | null;
  size?: "sm" | "md" | "lg" | "xl";
  className?: string;
}

const sizes     = { sm: 32, md: 40, lg: 56, xl: 80 };
const textSizes = { sm: "text-sm", md: "text-base", lg: "text-xl", xl: "text-3xl" };

export default function Avatar({ src, name, size = "md", className }: AvatarProps) {
  const [imgError, setImgError] = useState(false);

  const px      = sizes[size];
  const initial = name?.trim()[0]?.toUpperCase() ?? "?";
  const showImg = Boolean(src) && !imgError;

  return (
    <div
      className={cn(
        "relative rounded-full flex-shrink-0 flex items-center justify-center overflow-hidden",
        "bg-gradient-to-br from-indigo-500 to-pink-500",
        className
      )}
      style={{ width: px, height: px }}
    >
      {showImg ? (
        <Image
          src={src!}
          alt={name ?? "avatar"}
          fill
          className="object-cover"
          onError={() => setImgError(true)}
        />
      ) : (
        <span className={cn("font-bold text-white select-none", textSizes[size])}>
          {initial}
        </span>
      )}
    </div>
  );
}
