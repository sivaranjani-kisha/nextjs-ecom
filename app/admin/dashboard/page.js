"use client";
import { useState, useEffect } from "react";


export default function Dashboard() {
  const [time, setTime] = useState(null);

  useEffect(() => {
    setTime(Date.now());
  }, []);

  return (
    <div className="container mx-auto mt-10">
      <h2 className="text-center text-2xl font-bold">Admin Dashboard</h2>
    
    </div>
  );
}
