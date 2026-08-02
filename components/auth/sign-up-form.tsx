"use client";

import { useState, type FormEvent } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { ArrowRight, Lock, Mail, Smartphone, User } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Checkbox, InputField } from "@/components/ui/field";
import { Logo, LogoMark } from "@/components/ui/logo";
import { fromApiFieldErrors, validate, type FieldErrors } from "@/lib/form";
import { signUpSchema } from "@/lib/validation";
import { toApiError, useSignUpMutation } from "@/store/api";

const INITIAL = {
  fullName: "",
  email: "",
  mobile: "",
  password: "",
  confirmPassword: "",
  acceptTerms: false,
};

export function SignUpForm() {
  const router = useRouter();
  const [signUp, { isLoading }] = useSignUpMutation();
  const [values, setValues] = useState(INITIAL);
  const [errors, setErrors] = useState<FieldErrors>({});

  function update<K extends keyof typeof INITIAL>(
    key: K,
    value: (typeof INITIAL)[K],
  ) {
    setValues((current) => ({ ...current, [key]: value }));
    setErrors((current) => ({ ...current, [key]: undefined }));
  }

  async function onSubmit(event: FormEvent) {
    event.preventDefault();

    const result = validate(signUpSchema, values);
    if (!result.ok) {
      setErrors(result.errors);
      return;
    }

    try {
      await signUp(values).unwrap();
      toast.success("Welcome to TaskFlow Pro", {
        description: "Your account is ready.",
      });
      router.push("/dashboard");
      router.refresh();
    } catch (error) {
      const apiError = toApiError(error);
      setErrors(fromApiFieldErrors(apiError.fieldErrors));
      toast.error(apiError.message);
    }
  }

  return (
    <div className="mx-auto w-full max-w-[560px] animate-fade-up">
      <div className="text-center">
        <div className="inline-flex items-center gap-3">
          <LogoMark className="size-12 rounded-[18px]" />
          <Logo className="text-2xl [&>span]:text-2xl" />
        </div>
        <p className="mx-auto mt-4 max-w-sm text-balance text-sm leading-relaxed text-ink-muted">
          Optimize your productivity with professional task management.
        </p>
      </div>

      <div className="card mt-8 p-6 shadow-raise sm:p-8">
        <h1 className="text-xl font-semibold tracking-tight text-ink">
          Create an account
        </h1>

        <form onSubmit={onSubmit} className="mt-6 space-y-4" noValidate>
          <InputField
            label="FULL NAME"
            placeholder="Enter your full name"
            autoComplete="name"
            icon={<User />}
            value={values.fullName}
            error={errors.fullName}
            onChange={(event) => update("fullName", event.target.value)}
          />

          <InputField
            label="EMAIL ADDRESS"
            type="email"
            placeholder="name@company.com"
            autoComplete="email"
            icon={<Mail />}
            value={values.email}
            error={errors.email}
            onChange={(event) => update("email", event.target.value)}
          />

          <InputField
            label="MOBILE NUMBER"
            type="tel"
            placeholder="+1 (555) 000-0000"
            autoComplete="tel"
            icon={<Smartphone />}
            value={values.mobile}
            error={errors.mobile}
            onChange={(event) => update("mobile", event.target.value)}
          />

          <div className="grid gap-4 sm:grid-cols-2">
            <InputField
              label="PASSWORD"
              type="password"
              placeholder="••••••••"
              autoComplete="new-password"
              icon={<Lock />}
              value={values.password}
              error={errors.password}
              onChange={(event) => update("password", event.target.value)}
            />
            <InputField
              label="CONFIRM"
              type="password"
              placeholder="••••••••"
              autoComplete="new-password"
              icon={<Lock />}
              value={values.confirmPassword}
              error={errors.confirmPassword}
              onChange={(event) => update("confirmPassword", event.target.value)}
            />
          </div>

          <div className="pt-1">
            <Checkbox
              checked={values.acceptTerms}
              onChange={(event) => update("acceptTerms", event.target.checked)}
              label={
                <>
                  I agree to the{" "}
                  <span className="font-medium text-brand-600">
                    Terms of Service
                  </span>{" "}
                  and{" "}
                  <span className="font-medium text-brand-600">
                    Privacy Policy
                  </span>
                  .
                </>
              }
            />
            {errors.acceptTerms && (
              <p className="mt-1.5 text-xs font-medium text-rose-600">
                {errors.acceptTerms}
              </p>
            )}
          </div>

          <Button
            type="submit"
            size="lg"
            loading={isLoading}
            className="w-full"
            iconRight={<ArrowRight className="size-4" />}
          >
            Create Account
          </Button>
        </form>

        <div className="mt-7 border-t border-line pt-5 text-center text-sm text-ink-muted">
          Already have an account?{" "}
          <Link
            href="/sign-in"
            className="font-semibold text-brand-600 transition-colors hover:text-brand-700"
          >
            Sign In
          </Link>
        </div>
      </div>

      <p className="mt-8 text-center text-xs text-ink-faint">
        Support · Language · Theme
      </p>
    </div>
  );
}
