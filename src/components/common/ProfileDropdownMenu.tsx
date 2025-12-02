"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useRef, useState } from "react";
import { useLineUser } from "@/hooks/useLineUser";

interface ProfileDropdownMenuProps {
  className?: string;
  showGreeting?: boolean;
}

export function ProfileDropdownMenu({ className = "", showGreeting = true }: ProfileDropdownMenuProps) {
  const router = useRouter();
  const lineUser = useLineUser();
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleLogout = useCallback(() => {
    localStorage.removeItem("authToken");
    localStorage.removeItem("isLoggedIn");
    localStorage.removeItem("user");
    sessionStorage.clear();
    router.push("/login");
  }, [router]);

  return (
    <div className={`flex items-center gap-3 ${className}`} ref={containerRef}>
      {showGreeting && (
        <div className="text-right">
          <p className="text-sm text-gray-300 leading-tight">ยินดีต้อนรับ</p>
          <p className="text-sm font-bold leading-tight">{lineUser.displayName || "เกษตรกร"}</p>
        </div>
      )}
      <div className="relative">
        <button
          type="button"
          onClick={() => setIsOpen((prev) => !prev)}
          className="w-10 h-10 rounded-full border-2 border-white overflow-hidden bg-gray-200 hover:border-gray-300 transition-colors cursor-pointer focus:outline-none focus:ring-2 focus:ring-white/60"
          aria-haspopup="menu"
          aria-expanded={isOpen}
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={lineUser.pictureUrl || "/default-avatar.png"} alt="Profile" className="w-full h-full object-cover" />
        </button>

        {isOpen && (
          <div className="absolute right-0 top-full mt-2 w-48 overflow-hidden bg-white rounded-lg shadow-xl border border-gray-200 z-[120]">
            <Link
              href="/profile"
              className="block w-full text-left px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-100 transition-colors flex items-center gap-2"
              onClick={() => setIsOpen(false)}
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
              โปรไฟล์
            </Link>
            <button
              type="button"
              onClick={handleLogout}
              className="w-full border-t border-gray-100 text-left px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-100 transition-colors flex items-center gap-2 cursor-pointer"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
              </svg>
              ออกจากระบบ
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
