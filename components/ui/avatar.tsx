import Image from "next/image";
import { cn } from "@/lib/utils";

interface AvatarProps {
  src?: string | null;
  name?: string | null;
  size?: "sm" | "md" | "lg" | "xl";
  className?: string;
}

const sizes = { sm: 32, md: 40, lg: 56, xl: 80 };
const textSizes = { sm: "text-xs", md: "text-sm", lg: "text-lg", xl: "text-2xl" };

export default function Avatar({ src, name, size = "md", className }: AvatarProps) {
  const px = sizes[size];
  const initials = name
    ? name.split(" ").map((n) => n[0]).join("").slice(0, 2).toUpperCase()
    : "?";

  return (
    <div
      className={cn(
        "relative rounded-full overflow-hidden flex-shrink-0 flex items-center justify-center bg-gradient-to-br from-indigo-500 to-pink-500 font-semibold text-white",
        textSizes[size],
        className
      )}
      style={{ width: px, height: px }}
    >
      {src ? (
        <Image src={src} alt={name ?? "avatar"} fill className="object-cover" />
      ) : (
        <span>{initials}</span>
      )}
    </div>
  );
}
