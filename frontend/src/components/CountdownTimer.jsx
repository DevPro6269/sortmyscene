import { useEffect, useRef, useState } from "react";

export default function CountdownTimer({ expiresAt, onExpire }) {
  const [remaining, setRemaining] = useState(() => Math.max(0, new Date(expiresAt) - Date.now()));
  const firedRef = useRef(false);

  useEffect(() => {
    const id = setInterval(() => {
      const ms = Math.max(0, new Date(expiresAt) - Date.now());
      setRemaining(ms);
      if (ms <= 0 && !firedRef.current) {
        firedRef.current = true;
        clearInterval(id);
        onExpire && onExpire();
      }
    }, 1000);
    return () => clearInterval(id);
  }, [expiresAt, onExpire]);

  useEffect(() => {
    firedRef.current = false;
  }, [expiresAt]);

  const totalSec = Math.floor(remaining / 1000);
  const mm = String(Math.floor(totalSec / 60)).padStart(2, "0");
  const ss = String(totalSec % 60).padStart(2, "0");

  return (
    <span className={`font-mono font-bold ${totalSec < 60 ? "text-red-600" : "text-gray-800"}`}>
      {mm}:{ss}
    </span>
  );
}
