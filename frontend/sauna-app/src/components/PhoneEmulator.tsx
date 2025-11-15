import type { ReactNode } from "react";

interface PhoneEmulatorProps {
  children: ReactNode;
}

export function PhoneEmulator({ children }: PhoneEmulatorProps) {
  return (
    <div className="flex justify-center items-center p-8 bg-neutral-900 min-h-screen">
      <div
        className="relative w-[380px] h-[780px] bg-neutral-950 rounded-[3rem] border-[14px] border-neutral-900 overflow-hidden
                   shadow-[0_030px#FF7F50,0_060px#FF6347] 
                   transform-gpu rotate-y-3 rotate-x-1"
      >
        {/* Notch */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-40 h-7 bg-neutral-950 rounded-b-3xl z-50 shadow-inner"></div>

        {/* Screen */}
        <div className="w-full h-full bg-black overflow-y-auto">{children}</div>

        {/* Power button */}
        <div className="absolute right-0 top-32 w-1 h-16 bg-neutral-800 rounded-l shadow-lg"></div>

        {/* Volume buttons */}
        <div className="absolute left-0 top-28 w-1 h-12 bg-neutral-800 rounded-r shadow-lg"></div>
        <div className="absolute left-0 top-44 w-1 h-12 bg-neutral-800 rounded-r shadow-lg"></div>
      </div>
    </div>
  );
}