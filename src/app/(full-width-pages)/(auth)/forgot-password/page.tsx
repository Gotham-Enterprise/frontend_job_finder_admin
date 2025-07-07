
import React from 'react';
import ForgotPassword from '@/components/page/ForgotPassword';
import FullScreenSpinner from "@/components/ui/FullScreenSpinner";
import { Metadata } from "next";
import { Suspense } from "react";

export const metadata: Metadata = {
    title: "Forgot password",
    description: "forgot password",
  };

export default function ForgotPasswordPage() {
 
  return (
    <>
      <Suspense fallback={<FullScreenSpinner isVisible={true} message="Loading..." />}>
      <ForgotPassword />
      </Suspense>
   
    </>
  );
}