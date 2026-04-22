"use client";

import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

export default function Navbar() {
  return (
    <header className="sticky top-0 z-50 w-full bg-[#0f1117]/95 backdrop-blur-md border-b border-white/5">
      <div className="flex items-center justify-between px-4 py-3">
        {/* Logo */}
        <span className="text-[#f5a623] font-black text-2xl tracking-tight font-['Orbitron',sans-serif]">
          odds<span className="text-white">96</span>
        </span>

        {/* Actions */}
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="sm"
            className="text-white/80 hover:text-white border border-white/20 hover:border-white/40 rounded-full px-4 text-sm font-semibold relative"
          >
            Bonus
            <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-green-400 rounded-full border-2 border-[#0f1117]" />
          </Button>
          <Button
            variant="outline"
            size="sm"
            className="border-[#f5a623] text-[#f5a623] hover:bg-[#f5a623] hover:text-black rounded-full px-4 text-sm font-bold bg-transparent"
          >
            Log In
          </Button>
          <Button
            size="sm"
            className="bg-[#f5a623] hover:bg-[#e09410] text-black rounded-full px-4 text-sm font-bold"
          >
            Join Us
          </Button>
        </div>
      </div>
    </header>
  );
}
