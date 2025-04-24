"use client";
import { useState, useEffect } from "react";

import termsandcoditionComponent from "@/components/termsandcodition/termsandcodition";


export default function Dashboard() {
  const [time, setTime] = useState(null);

  useEffect(() => {
    setTime(Date.now());
  }, []);

  return (
    <div>
      
      <termsandcoditionComponent /> 
    </div>
  );
}
