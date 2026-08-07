"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import {
  BadgeCheck,
  CreditCard,
  Info,
  KeyRound,
  LogOut,
  Palette,
  Shield,
  Trash2,
  User,
} from "lucide-react";
import { AppearanceSection } from "@/components/theme/appearance-section";
import { Avatar } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { InputField, TextareaField } from "@/components/ui/field";
import { ConfirmDialog } from "@/components/ui/modal";
import { PageHeader } from "@/components/ui/page-header";
import { Skeleton } from "@/components/ui/skeleton";
import { fromApiFieldErrors, validate, type FieldErrors } from "@/lib/form";
import { changePasswordSchema, updateProfileSchema } from "@/lib/validation";
import { cn, formatDate } from "@/lib/utils";
import type { CurrentUser } from "@/lib/types";
import {
  toApiError,
  useChangePasswordMutation,
  useMeQuery,
  useSignOutMutation,
  useUpdateProfileMutation,
} from "@/store/api";

type Section = "personal" | "appearance" | "security" | "billing";

const SECTIONS: { value: Section; label: string; icon: typeof User }[] = [
  { value: "personal", label: "Personal Info", icon: User },
  { value: "appearance", label: "Appearance", icon: Palette },
  { value: "security", label: "Security", icon: Shield },
  { value: "billing", label: "Billing", icon: CreditCard },
];

export function ProfileView() {
  const { data, isLoading } = useMeQuery();

  if (isLoading || !data) {
    return (
      <div className="grid gap-6 lg:grid-cols-[380px_1fr]">
        <Skeleton className="h-96 rounded-2xl" />
        <Skeleton className="h-96 rounded-2xl" />
      </div>
    );
  }

  // Keyed so the form seeds itself from the loaded account rather than
  // syncing server data into state through an effect.
  return <ProfileSettings key={data.user.id} user={data.user} />;
}

function ProfileSettings({ user }: { user: CurrentUser }) {
  const router = useRouter();
  const [updateProfile, { isLoading: saving }] = useUpdateProfileMutation();
  const [changePassword, { isLoading: changing }] = useChangePasswordMutation();
  const [signOut] = useSignOutMutation();

  const [section, setSection] = useState<Section>("personal");
  const [profile, setProfile] = useState({
    fullName: user.fullName,
    jobTitle: user.jobTitle ?? "",
    mobile: user.mobile ?? "",
    bio: user.bio ?? "",
    avatarUrl: user.avatarUrl ?? "",
  });
  const [profileErrors, setProfileErrors] = useState<FieldErrors>({});

  const [passwords, setPasswords] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });
  const [passwordErrors, setPasswordErrors] = useState<FieldErrors>({});
  const [confirmSignOut, setConfirmSignOut] = useState(false);

  async function saveProfile() {
    const result = validate(updateProfileSchema, profile);
    if (!result.ok) {
      setProfileErrors(result.errors);
      return;
    }

    try {
      await updateProfile(profile).unwrap();
      toast.success("Profile updated");
      setProfileErrors({});
    } catch (error) {
      const apiError = toApiError(error);
      setProfileErrors(fromApiFieldErrors(apiError.fieldErrors));
      toast.error(apiError.message);
    }
  }

  async function savePassword() {
    const result = validate(changePasswordSchema, passwords);
    if (!result.ok) {
      setPasswordErrors(result.errors);
      return;
    }

    try {
      await changePassword(passwords).unwrap();
      toast.success("Password changed");
      setPasswords({
        currentPassword: "",
        newPassword: "",
        confirmPassword: "",
      });
      setPasswordErrors({});
    } catch (error) {
      const apiError = toApiError(error);
      setPasswordErrors(fromApiFieldErrors(apiError.fieldErrors));
      toast.error(apiError.message);
    }
  }

  async function handleSignOut() {
    await signOut();
    router.push("/sign-in");
    router.refresh();
  }

  return (
    <div className="space-y-8">
      <PageHeader
        title="Profile Settings"
        description="Manage your personal information, security, and account preferences."
      />

      <div className="grid gap-6 lg:grid-cols-[340px_1fr] lg:items-start">
        {/* ── Identity card + section nav ───────────────────────────── */}
        <div className="space-y-6">
          <section className="card flex flex-col items-center p-7 text-center">
            <div className="relative">
              <Avatar user={user} size="2xl" />
              <span className="absolute -bottom-1 -right-1 flex size-8 items-center justify-center rounded-full bg-brand-600 text-white ring-4 ring-surface dark:bg-brand-500">
                <BadgeCheck className="size-4" />
              </span>
            </div>

            <h2 className="mt-5 text-lg font-semibold tracking-tight text-ink">
              {user.fullName}
            </h2>
            <p className="mt-1 text-[13.5px] text-ink-muted">
              {user.jobTitle ?? "Team member"}
            </p>
            <p className="mt-4 text-[12.5px] text-ink-faint">
              Joined {formatDate(user.createdAt)}
            </p>

            <div className="mt-6 w-full space-y-2">
              <InputField
                placeholder="Paste an image URL"
                value={profile.avatarUrl}
                onChange={(event) =>
                  setProfile((p) => ({ ...p, avatarUrl: event.target.value }))
                }
              />
              <Button className="w-full" onClick={saveProfile} loading={saving}>
                Update Avatar
              </Button>
              {profile.avatarUrl && (
                <Button
                  variant="outline"
                  className="w-full"
                  onClick={() => {
                    setProfile((p) => ({ ...p, avatarUrl: "" }));
                    toast.info("Save changes to remove your photo.");
                  }}
                >
                  Remove Photo
                </Button>
              )}
            </div>
          </section>

          <nav className="card overflow-hidden">
            <p className="border-b border-line px-5 py-3.5 text-[11px] font-semibold uppercase tracking-[0.1em] text-ink-faint">
              Account sections
            </p>
            {SECTIONS.map((item) => (
              <button
                key={item.value}
                type="button"
                onClick={() => setSection(item.value)}
                className={cn(
                  "flex w-full items-center gap-3 border-l-[3px] px-5 py-3.5 text-left text-[14px] font-medium transition-colors",
                  section === item.value
                    ? "border-brand-600 bg-brand-50/50 text-brand-700"
                    : "border-transparent text-ink-soft hover:bg-surface-muted",
                )}
              >
                <item.icon className="size-4.5" />
                {item.label}
              </button>
            ))}
          </nav>
        </div>

        {/* ── Section content ───────────────────────────────────────── */}
        <div className="space-y-6">
          {section === "personal" && (
            <section className="card overflow-hidden">
              <header className="flex items-center justify-between border-b border-line px-6 py-4">
                <h2 className="text-[15px] font-semibold text-ink">
                  Personal Information
                </h2>
                <Info className="size-4.5 text-ink-faint" />
              </header>

              <div className="space-y-5 p-6">
                <div className="grid gap-5 sm:grid-cols-2">
                  <InputField
                    label="Full Name"
                    value={profile.fullName}
                    error={profileErrors.fullName}
                    onChange={(event) =>
                      setProfile((p) => ({ ...p, fullName: event.target.value }))
                    }
                  />
                  <InputField
                    label="Job Title"
                    placeholder="e.g. Product Manager"
                    value={profile.jobTitle}
                    error={profileErrors.jobTitle}
                    onChange={(event) =>
                      setProfile((p) => ({ ...p, jobTitle: event.target.value }))
                    }
                  />
                </div>

                <div className="grid gap-5 sm:grid-cols-2">
                  <InputField
                    label="Email Address"
                    value={user.email}
                    disabled
                    hint="Contact an administrator to change your email."
                  />
                  <InputField
                    label="Mobile Number"
                    placeholder="+1 555 019 2837"
                    value={profile.mobile}
                    hint={
                      user.mobile
                        ? undefined
                        : "Optional — social sign-in does not provide one."
                    }
                    error={profileErrors.mobile}
                    onChange={(event) =>
                      setProfile((p) => ({ ...p, mobile: event.target.value }))
                    }
                  />
                </div>

                <TextareaField
                  label="Bio"
                  rows={4}
                  placeholder="A short introduction for your teammates."
                  value={profile.bio}
                  error={profileErrors.bio}
                  onChange={(event) =>
                    setProfile((p) => ({ ...p, bio: event.target.value }))
                  }
                />
              </div>

              <footer className="flex flex-col-reverse gap-3 border-t border-line bg-surface-muted px-6 py-4 sm:flex-row sm:justify-end">
                <Button
                  variant="outline"
                  onClick={() => {
                    setProfile({
                      fullName: user.fullName,
                      jobTitle: user.jobTitle ?? "",
                      mobile: user.mobile ?? "",
                      bio: user.bio ?? "",
                      avatarUrl: user.avatarUrl ?? "",
                    });
                    setProfileErrors({});
                  }}
                >
                  Cancel
                </Button>
                <Button onClick={saveProfile} loading={saving}>
                  Save Changes
                </Button>
              </footer>
            </section>
          )}

          {section === "appearance" && <AppearanceSection />}

          {section === "security" && (
            <>
              <section className="card overflow-hidden">
                <header className="border-b border-line px-6 py-4">
                  <h2 className="text-[15px] font-semibold text-ink">
                    {user.hasPassword ? "Change Password" : "Set a Password"}
                  </h2>
                  {user.hasPassword ? null : (
                    <p className="mt-1 text-[13px] text-ink-muted">
                      You signed up with a social provider. Adding a password
                      lets you sign in with your email as well.
                    </p>
                  )}
                </header>

                <div className="space-y-5 p-6">
                  {user.hasPassword && (
                    <InputField
                      label="Current password"
                      type="password"
                      autoComplete="current-password"
                      icon={<KeyRound />}
                      value={passwords.currentPassword}
                      error={passwordErrors.currentPassword}
                      onChange={(event) =>
                        setPasswords((p) => ({
                          ...p,
                          currentPassword: event.target.value,
                        }))
                      }
                    />
                  )}
                  <div className="grid gap-5 sm:grid-cols-2">
                    <InputField
                      label="New password"
                      type="password"
                      autoComplete="new-password"
                      value={passwords.newPassword}
                      error={passwordErrors.newPassword}
                      onChange={(event) =>
                        setPasswords((p) => ({
                          ...p,
                          newPassword: event.target.value,
                        }))
                      }
                    />
                    <InputField
                      label="Confirm new password"
                      type="password"
                      autoComplete="new-password"
                      value={passwords.confirmPassword}
                      error={passwordErrors.confirmPassword}
                      onChange={(event) =>
                        setPasswords((p) => ({
                          ...p,
                          confirmPassword: event.target.value,
                        }))
                      }
                    />
                  </div>
                </div>

                <footer className="flex justify-end border-t border-line bg-surface-muted px-6 py-4">
                  <Button onClick={savePassword} loading={changing}>
                    {user.hasPassword ? "Update password" : "Set password"}
                  </Button>
                </footer>
              </section>

              <section className="card overflow-hidden">
                <header className="border-b border-line px-6 py-4">
                  <h2 className="text-[15px] font-semibold text-ink">
                    Account Security
                  </h2>
                </header>

                <div className="space-y-4 p-6">
                  <div className="flex items-center justify-between gap-4 rounded-xl border border-line bg-surface-muted p-4">
                    <div className="flex items-center gap-3">
                      <span className="flex size-10 items-center justify-center rounded-lg bg-rose-50 text-rose-600">
                        <LogOut className="size-4.5" />
                      </span>
                      <div>
                        <p className="text-[14px] font-semibold text-ink">
                          Active session
                        </p>
                        <p className="text-[12.5px] text-ink-muted">
                          Sign out of this device
                        </p>
                      </div>
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setConfirmSignOut(true)}
                    >
                      Sign out
                    </Button>
                  </div>

                  <div className="rounded-xl border border-rose-200 bg-rose-50/50 p-5">
                    <p className="text-[15px] font-semibold text-rose-700">
                      Danger zone
                    </p>
                    <p className="mt-1.5 text-[13px] leading-relaxed text-ink-soft">
                      Account deletion is handled by an administrator. Contact
                      your workspace admin to permanently remove your data and
                      access.
                    </p>
                    <Button
                      variant="danger"
                      className="mt-4"
                      icon={<Trash2 className="size-4" />}
                      onClick={() =>
                        toast.info(
                          "Ask your workspace administrator to delete this account.",
                        )
                      }
                    >
                      Request account deletion
                    </Button>
                  </div>
                </div>
              </section>
            </>
          )}

          {section === "billing" && (
            <section className="card p-8 text-center">
              <span className="mx-auto flex size-14 items-center justify-center rounded-2xl bg-brand-50 text-brand-600">
                <CreditCard className="size-6" />
              </span>
              <h2 className="mt-5 text-lg font-semibold tracking-tight text-ink">
                Enterprise Plan
              </h2>
              <p className="mx-auto mt-2 max-w-md text-[13.5px] leading-relaxed text-ink-muted">
                Your workspace is on the Enterprise plan with unlimited groups,
                tasks and members. Billing is managed centrally by your
                organisation.
              </p>
            </section>
          )}
        </div>
      </div>

      <ConfirmDialog
        open={confirmSignOut}
        onClose={() => setConfirmSignOut(false)}
        onConfirm={handleSignOut}
        title="Sign out?"
        message="You will need to sign in again to access your groups and tasks."
        confirmLabel="Sign out"
        tone="primary"
      />
    </div>
  );
}
