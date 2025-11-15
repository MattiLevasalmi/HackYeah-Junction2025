import type { ReactNode } from "react";


interface PhoneEmulatorProps {
  children: ReactNode;
}

export function PhoneEmulator({ children }: PhoneEmulatorProps) {
  return (
    <div className="relative z-10">
      <div className="relative w-[380px] h-[780px] bg-neutral-950 rounded-[3rem] shadow-2xl border-[14px] border-neutral-900 overflow-hidden">
        
        {/* Notch */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-40 h-7 bg-neutral-950 rounded-b-3xl z-50"></div>

        {/* Screen */}
        <div className="w-full h-full bg-black overflow-y-auto">
          {children}
        </div>
      </div>

      {/* Power button */}
      <div className="absolute right-0 top-32 w-1 h-16 bg-neutral-800 rounded-l"></div>

      {/* Volume buttons */}
      <div className="absolute left-0 top-28 w-1 h-12 bg-neutral-800 rounded-r"></div>
      <div className="absolute left-0 top-44 w-1 h-12 bg-neutral-800 rounded-r"></div>
    </div>
  );
}
