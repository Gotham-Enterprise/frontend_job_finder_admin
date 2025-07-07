import React from "react";
import ResetPassword from "@/components/page/ResetPassword";
import FullScreenSpinner from "@/components/ui/FullScreenSpinner";
import { Suspense } from "react";

export default function ResetPasswordPage() {
  return (
    <Suspense fallback={<FullScreenSpinner isVisible={true} message="Loading..." />}>
     <ResetPassword />
     </Suspense>
  );
}