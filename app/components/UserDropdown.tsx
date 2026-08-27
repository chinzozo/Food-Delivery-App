/* eslint-disable react-hooks/set-state-in-effect */
/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";
import { useState, useEffect } from "react";

export const UserDropdown = ({ onClose }: any) => {
  const [email, setEmail] = useState("");

  useEffect(() => {
    // Client-side дээр ачаалагдсаны дараа л localStorage-оос авна
    const storedEmail = localStorage.getItem("userEmail");
    if (storedEmail) {
      setEmail(storedEmail);
    }
  }, []);

  const handleSignOut = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("userEmail");
    window.location.reload();
    onClose();
  };

  return (
    <div className="absolute top-12 right-0 bg-white shadow-xl rounded-xl p-4 text-black z-[999] flex flex-col gap-2 min-w-[160px] max-w-[calc(100vw-2rem)]">
      <p className="text-sm font-bold truncate w-full text-center">
        {email || "user@example.com"}
      </p>

      <button
        onClick={handleSignOut}
        className="w-full rounded-2xl bg-gray-100 hover:bg-gray-200 py-1.5 text-xs font-semibold cursor-pointer transition-colors"
      >
        Sign Out
      </button>
    </div>
  );
};
