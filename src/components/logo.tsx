import { cn } from "@/lib/utils";
import Image from "next/image";
import SGTLogo from "@/components/image/SGT-Logo.png";

export function Logo({ className }: { className?: string }) {
  return (
    <div className={cn("relative h-24 w-auto", className)}>
      <Image
        src={SGTLogo}
        alt="Swiss-GlobalTech Logo"
        fill
        style={{ objectFit: "contain" }}
        priority
      />
    </div>
  );
}
