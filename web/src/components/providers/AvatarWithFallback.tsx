"use client";

import { useState } from "react";
import { getInitials, getAvatarColor } from "@/shared/utils/avatar";

interface AvatarWithFallbackProps {
  photoURL: string | null;
  name: string;
  size?: "sm" | "md" | "lg";
}

const sizeMap = {
  sm: "w-10 h-10 text-sm",
  md: "w-12 h-12 text-base",
  lg: "w-20 h-20 text-2xl",
};

export function AvatarWithFallback({ photoURL, name, size = "md" }: AvatarWithFallbackProps) {
  const [imgError, setImgError] = useState(false);

  if (photoURL && !imgError) {
    return (
      // eslint-disable-next-line @next/next/no-img-element
      <img
        src={photoURL}
        alt={name}
        onError={() => setImgError(true)}
        className={`${sizeMap[size]} rounded-full object-cover`}
      />
    );
  }

  return (
    <div
      className={`${sizeMap[size]} rounded-full flex items-center justify-center font-bold text-white flex-shrink-0`}
      style={{ backgroundColor: getAvatarColor(name) }}
    >
      {getInitials(name)}
    </div>
  );
}
