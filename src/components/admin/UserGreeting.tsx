"use client";
import React, { useState, useEffect } from "react";
import { authUtils } from "@/services/utils/authUtils";

export function UserGreeting() {
  const [userDisplayName, setUserDisplayName] = useState("Guest");
  
  useEffect(() => {
    const displayName = authUtils.getUserDisplayName();
    setUserDisplayName(displayName);
  }, []);
  
  return (
    <span className="text-2xl relative text-black dark:text-white">
      Hello, {userDisplayName}
    </span>
  );
}
