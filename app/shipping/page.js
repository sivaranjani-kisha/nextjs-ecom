"use client";
import { useState, useEffect } from "react";

import shippingComponent from "@/components/shipping/shipping";


export default function Dashboard() {
  const [time, setTime] = useState(null);

  useEffect(() => {
    setTime(Date.now());
  }, []);

  return (
    <div>
      
      <shippingComponent /> 
    </div>
  );
}
