"use client";

import { useEffect, useRef, useState, type FormEvent, type ReactNode } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { toast } from "sonner";
import { AtSign, Eye, EyeOff, Lock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Checkbox, InputField } from "@/components/ui/field";
import { LogoMark } from "@/components/ui/logo";
import { fromApiFieldErrors, validate, type FieldErrors } from "@/lib/form";
import { signInSchema } from "@/lib/validation";
import { toApiError, useSignInMutation } from "@/store/api";

export function SignInForm({ social }: { social?: ReactNode }) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [signIn, { isLoading }] = useSignInMutation();

  // A failed social sign-in comes back as a redirect to this page carrying the
  // reason, since the provider left the user in a browser tab, not a fetch.
  const oauthError = searchParams.get("error");
  const reportedError = useRef<string | null>(null);
  useEffect(() => {
    if (!oauthError || reportedError.current === oauthError) return;
    reportedError.current = oauthError;
    toast.error(oauthError);
  }, [oauthError]);

  const [values, setValues] = useState({
    identifier: "",
    password: "",
    remember: false,
  });
  const [errors, setErrors] = useState<FieldErrors>({});
  const [showPassword, setShowPassword] = useState(false);

  async function onSubmit(event: FormEvent) {
    event.preventDefault();

    const result = validate(signInSchema, values);
    if (!result.ok) {
      setErrors(result.errors);
      return;
    }

    try {
      const { user } = await signIn(values).unwrap();
      toast.success(`Welcome back, ${user.fullName.split(" ")[0]}`);

      const next = searchParams.get("next");
      const fallback = user.role === "ADMIN" ? "/admin" : "/dashboard";
      router.push(next && next.startsWith("/") ? next : fallback);
      router.refresh();
    } catch (error) {
      const apiError = toApiError(error);
      setErrors(fromApiFieldErrors(apiError.fieldErrors));
      toast.error(apiError.message);
    }
  }

  return (
    <div className="mx-auto w-full max-w-[480px] animate-fade-up">
      <div className="text-center">
        <LogoMark className="mx-auto size-14" />
        <h1 className="mt-6 text-[34px] font-bold tracking-tight text-ink">
          TaskFlow Pro
        </h1>
        <p className="mt-2 text-sm text-ink-muted">
          Welcome back. Please enter your details.
        </p>
      </div>

      <div className="card mt-9 p-6 shadow-raise sm:p-8">
        <form onSubmit={onSubmit} className="space-y-5" noValidate>
          <InputField
            label="Email or Mobile Number"
            placeholder="name@company.com"
            inputMode="email"
            autoComplete="username"
            icon={<AtSign />}
            value={values.identifier}
            error={errors.identifier}
            onChange={(event) => {
              setValues((v) => ({ ...v, identifier: event.target.value }));
              setErrors((e) => ({ ...e, identifier: undefined }));
            }}
          />

          <InputField
            label="Password"
            type={showPassword ? "text" : "password"}
            placeholder="••••••••"
            autoComplete="current-password"
            icon={<Lock />}
            value={values.password}
            error={errors.password}
            onChange={(event) => {
              setValues((v) => ({ ...v, password: event.target.value }));
              setErrors((e) => ({ ...e, password: undefined }));
            }}
            action={
              <span className="text-[13px] font-semibold text-brand-600">
                Forgot Password?
              </span>
            }
            trailing={
              <button
                type="button"
                onClick={() => setShowPassword((value) => !value)}
                aria-label={showPassword ? "Hide password" : "Show password"}
                className="flex size-9 items-center justify-center rounded-lg text-ink-faint transition-colors hover:bg-surface-muted hover:text-ink-soft"
              >
                {showPassword ? (
                  <EyeOff className="size-4.5" />
                ) : (
                  <Eye className="size-4.5" />
                )}
              </button>
            }
          />

          <Checkbox
            checked={values.remember}
            onChange={(event) =>
              setValues((v) => ({ ...v, remember: event.target.checked }))
            }
            label="Remember me for 30 days"
          />

          <Button type="submit" size="lg" loading={isLoading} className="w-full">
            Sign In
          </Button>
        </form>

        {social}
      </div>

      <p className="mt-7 text-center text-sm text-ink-muted">
        Don&apos;t have an account?{" "}
        <Link
          href="/sign-up"
          className="font-semibold text-brand-600 transition-colors hover:text-brand-700"
        >
          Sign up for free
        </Link>
      </p>

      <div className="mt-10 space-y-1.5 text-center text-xs text-ink-faint">
        <p>© 2026 TaskFlow Pro. All rights reserved.</p>
        <p>Privacy Policy · Terms of Service</p>
      </div>
    </div>
  );
}
