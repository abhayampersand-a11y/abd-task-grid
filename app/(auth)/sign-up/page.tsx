import type { Metadata } from "next";
import { SignUpForm } from "@/components/auth/sign-up-form";
import { SocialSignIn } from "@/components/auth/social-sign-in";

export const metadata: Metadata = { title: "Create an account" };

// `SocialSignIn` decides which buttons to render by reading the provider
// credentials from the environment. Prerendered, that decision would be frozen
// at build time — adding a client secret later would change nothing until the
// next deploy. `/sign-in` is already dynamic because it awaits searchParams.
export const dynamic = "force-dynamic";

export default function SignUpPage() {
  return <SignUpForm social={<SocialSignIn label="Or sign up with" />} />;
}
