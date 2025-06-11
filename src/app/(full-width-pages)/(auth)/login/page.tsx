import SignInForm from "@/components/auth/SignInForm";
import FullScreenSpinner from "@/components/ui/FullScreenSpinner";
import { Metadata } from "next";
import { Suspense } from "react";

export const metadata: Metadata = {
  title: "Login",
  description: "Login to your account",
};

export default function SignIn() {
  return (
    <Suspense fallback={<FullScreenSpinner isVisible={true} message="Loading..." />}>
      <SignInForm />
    </Suspense>
  );
}
