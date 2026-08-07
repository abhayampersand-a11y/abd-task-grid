import type { Metadata } from "next";
import { Suspense } from "react";
import { SignInForm } from "@/components/auth/sign-in-form";
import { SocialSignIn } from "@/components/auth/social-sign-in";

export const metadata: Metadata = { title: "Sign In" };

export default async function SignInPage({
  searchParams,
}: {
  searchParams: Promise<{ next?: string }>;
}) {
  const { next } = await searchParams;

  return (
    <Suspense>
      {/* Rendered here rather than inside the client form so it can read which
          providers are configured straight from the server environment. */}
      <SignInForm social={<SocialSignIn next={next} />} />
    </Suspense>
  );
}
