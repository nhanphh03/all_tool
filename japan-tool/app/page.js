"use client";
import {useState} from "react";
export default function Home() {
    const [status, setStatus] = useState("");
    const handleClick = async () => {
        setStatus("Đang mở...");
        const res = await fetch("/api/open-browser");
        const data = await res.json();
        setStatus(data.message || data.error);
    };

  return (
    <div className="font-sans grid grid-rows-[20px_1fr_20px] items-center justify-items-center min-h-screen p-8 pb-20 gap-16 sm:p-20">

        <main style={{ padding: 20 }}>
            <h1>Next.js + Playwright Demo</h1>
            <button onClick={handleClick}>Mở Chromium</button>
            <p>{status}</p>
        </main>
    </div>
  );
}
