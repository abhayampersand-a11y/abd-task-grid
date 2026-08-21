import type { Metadata } from "next";
import Link from "next/link";
import {
  Callout,
  ContactCard,
  DataTable,
  ExternalLink,
  LegalHero,
  LegalLayout,
  List,
  MailLink,
  P,
  Section,
  SubHeading,
  Term,
  type LegalSection,
} from "@/components/legal/legal-doc";

export const metadata: Metadata = {
  title: "Privacy Policy",
  description:
    "How Taskgrid (TaskFlow Pro) collects, uses, shares, stores and deletes personal information across the mobile app and the web app.",
  alternates: { canonical: "/privacy" },
};

const UPDATED = "21 August 2026";

/**
 * Identity as it appears on the Play Console developer account. A policy whose
 * publisher does not match the listing is one of the things a review actually
 * checks, so these three strings are the ones on that account — the trading
 * name, the legal name behind it (the account is a personal one, so the
 * developer is the controller), and the address Play publishes.
 */
const CONTACT_EMAIL = "abdtech.apps@gmail.com";
const DEVELOPER_NAME = "ABD Tech";
const LEGAL_NAME = "Abhay M Desai";
const POSTAL_ADDRESS =
  "A-404 Suman Srushti Apartment, Near Madhuvan Circle, Adajan Gam, Surat 395009, Gujarat, India";

const SECTIONS: LegalSection[] = [
  { id: "who-we-are", title: "Who we are and what this covers" },
  { id: "information-we-collect", title: "Information we collect" },
  { id: "device-permissions", title: "Permissions we ask for" },
  { id: "how-we-use", title: "How we use information" },
  { id: "legal-bases", title: "Legal bases for processing" },
  { id: "sharing", title: "How information is shared" },
  { id: "storage", title: "Where data is stored" },
  { id: "retention", title: "How long we keep it" },
  { id: "security", title: "How we protect it" },
  { id: "your-controls", title: "Your choices in the app" },
  { id: "your-rights", title: "Your privacy rights" },
  { id: "delete-account", title: "Deleting your account and data" },
  { id: "children", title: "Children's privacy" },
  { id: "no-ads", title: "Advertising and analytics" },
  { id: "changes", title: "Changes to this policy" },
  { id: "contact", title: "Contact us" },
];

export default function PrivacyPolicyPage() {
  return (
    <>
      <LegalHero
        eyebrow="Legal"
        title="Privacy Policy"
        summary="Taskgrid is a team task manager. This policy explains exactly what personal information the app collects, why we collect it, who it is shared with, how long it is kept, and how you can get it deleted. It applies to the Android app and to the web app, which are one account and one database."
        updated={UPDATED}
        effective={UPDATED}
      />

      <LegalLayout sections={SECTIONS}>
        <Section index={1} id="who-we-are" title="Who we are and what this covers">
          <P>
            This policy is issued by <Term>{DEVELOPER_NAME}</Term>, the Google
            Play developer account of <Term>{LEGAL_NAME}</Term> (the
            &ldquo;we&rdquo;, &ldquo;us&rdquo;), which publishes{" "}
            <Term>Taskgrid</Term> (the &ldquo;app&rdquo;). Taskgrid is
            distributed on Google Play under the package name{" "}
            <Term>com.taskflowpro.app</Term> and is also available on the web as{" "}
            <Term>TaskFlow Pro</Term> at{" "}
            <ExternalLink href="https://abd-task-grid.vercel.app">
              abd-task-grid.vercel.app
            </ExternalLink>
            . Both are the same service, backed by the same account and the same
            database, and this policy covers both.
          </P>

          <ContactCard
            lines={[
              {
                label: "Data controller",
                value: `${DEVELOPER_NAME} (${LEGAL_NAME}) — sole developer and operator of Taskgrid`,
              },
              { label: "Contact", value: <MailLink address={CONTACT_EMAIL} /> },
              { label: "Postal address", value: POSTAL_ADDRESS },
              {
                label: "App",
                value:
                  "Taskgrid — com.taskflowpro.app (Android), TaskFlow Pro (web)",
              },
              {
                label: "Policy URL",
                value: (
                  <ExternalLink href="https://abd-task-grid.vercel.app/privacy">
                    abd-task-grid.vercel.app/privacy
                  </ExternalLink>
                ),
              },
            ]}
          />

          <P>
            Taskgrid is a workplace tool for adults. It is not designed for, and
            is not directed at, children — see{" "}
            <Link
              href="#children"
              className="font-medium text-brand-600 underline decoration-brand-300 underline-offset-4"
            >
              Children&rsquo;s privacy
            </Link>
            .
          </P>
        </Section>

        <Section index={2} id="information-we-collect" title="Information we collect">
          <P>
            We collect only what the app needs to run. There is no advertising
            SDK, no third-party analytics or tracking SDK, and no data broker in
            the picture. The table below is the complete list.
          </P>

          <SubHeading>Information you give us</SubHeading>
          <DataTable
            head={["Category", "What it includes", "Why we collect it"]}
            rows={[
              [
                "Account details",
                "Your full name, email address, and — only if you set one — a mobile number. If you sign up with a password, we store a one-way bcrypt hash of it, never the password itself.",
                "To create your account, identify you at sign-in, and let teammates find you in the member directory.",
              ],
              [
                "Profile details",
                "Optional profile photo, job title and short bio.",
                "To show who you are on tasks, comments and group member lists. All three are optional and can be cleared at any time.",
              ],
              [
                "Content you create",
                "Groups (name, description, visibility, icon), tasks (title, description, assignee, priority, status, progress, due date), checklist items, comments, and files you attach to a task.",
                "This is the product. It is stored so your team can see it and so it is there when you come back.",
              ],
              [
                "Membership and invitations",
                "Which groups you belong to, your role in each, and invitations you send or receive.",
                "To decide what you are allowed to see. Tasks are readable only by members of the group they live in.",
              ],
              [
                "Support messages",
                "Anything you write to us by email, including your email address.",
                "To answer you and keep a record of the request.",
              ],
            ]}
          />

          <SubHeading>Information from a sign-in provider</SubHeading>
          <P>
            If you choose to sign in with Google, Microsoft or LinkedIn, that
            provider sends us your name, email address, profile picture URL and
            a stable account identifier. We store that identifier so the same
            provider account maps to the same Taskgrid account next time, plus
            the date you last used it. We never receive your password with that
            provider, and we do not get access to your mail, files, contacts or
            calendar.
          </P>

          <SubHeading>Information collected automatically</SubHeading>
          <DataTable
            head={["Category", "What it includes", "Why we collect it"]}
            rows={[
              [
                "Push token",
                "The notification token issued by your device, the platform (“ios” or “android”) and the device name, stored only after you allow notifications.",
                "To deliver a notification to the right device. The token is deleted the moment your device revokes it, and it is moved off your account if someone else signs in on the same handset.",
              ],
              [
                "Session data",
                "A signed session token, held in an HTTP-only cookie on the web and in the operating system's encrypted keystore in the app.",
                "To keep you signed in without asking for your password on every screen. It expires after 7 days, or 28 days if you tick “remember me”.",
              ],
              [
                "Technical logs",
                "IP address, timestamp, request path and user-agent, recorded by our hosting provider for a short, rolling window.",
                "Security, abuse prevention and debugging. We do not use these logs to build a profile of you.",
              ],
            ]}
          />

          <Callout title="What we deliberately do not collect">
            <P>
              No precise or approximate location, no contact list, no SMS or
              call log, no health or financial data, no biometrics, no
              advertising identifier, and no browsing activity outside the app.
            </P>
          </Callout>
        </Section>

        <Section index={3} id="device-permissions" title="Permissions we ask for">
          <P>
            The Android app asks for three things, each at the moment it is
            needed and each refusable. Declining any of them leaves the rest of
            the app fully usable.
          </P>
          <DataTable
            head={["Permission", "When we ask", "What it is used for"]}
            rows={[
              [
                "Notifications",
                "The first time you open the app after signing in.",
                "Delivering alerts for tasks assigned to you, comments on your work, and group invitations. Nothing else is ever sent to your tray.",
              ],
              [
                "Photos",
                "Only when you tap to change a profile picture or a group icon.",
                "Reading the single image you pick. We do not scan, index or upload your photo library.",
              ],
              [
                "Camera",
                "Only when you choose to take a new picture instead of picking one.",
                "Capturing that one photo. No background or silent capture ever happens.",
              ],
            ]}
          />
          <P>
            You can withdraw any of these at any time in your device settings.
            Internet access is required for the app to reach our server; that is
            a normal permission and is granted at install.
          </P>
        </Section>

        <Section index={4} id="how-we-use" title="How we use information">
          <P>We use personal information only for these purposes:</P>
          <List
            items={[
              <>
                <Term>Providing the service</Term> — creating your account,
                signing you in, showing your groups and tasks, and saving the
                work you do.
              </>,
              <>
                <Term>Collaboration</Term> — showing your name and picture to
                other members of groups you belong to, so they know who assigned
                a task or left a comment.
              </>,
              <>
                <Term>Notifications</Term> — sending push and in-app alerts for
                events that involve you. These are service messages, not
                marketing.
              </>,
              <>
                <Term>Security and integrity</Term> — detecting abuse,
                preventing unauthorised access, and enforcing our{" "}
                <Link
                  href="/terms"
                  className="font-medium text-brand-600 underline decoration-brand-300 underline-offset-4"
                >
                  Terms of Service
                </Link>
                .
              </>,
              <>
                <Term>Support</Term> — answering your questions and
                investigating problems you report.
              </>,
              <>
                <Term>Legal obligations</Term> — responding to a valid legal
                request where we are required to.
              </>,
            ]}
          />
          <P>
            We do not sell personal information, we do not share it for
            behavioural advertising, and we do not use it to train machine
            learning models.
          </P>
        </Section>

        <Section index={5} id="legal-bases" title="Legal bases for processing">
          <P>
            If you are in the European Economic Area or the United Kingdom, we
            rely on the following legal bases under the GDPR:
          </P>
          <List
            items={[
              <>
                <Term>Performance of a contract</Term> — for everything needed
                to give you the account and features you signed up for.
              </>,
              <>
                <Term>Legitimate interests</Term> — for keeping the service
                secure, preventing abuse and fixing faults, balanced against
                your rights.
              </>,
              <>
                <Term>Consent</Term> — for device permissions such as
                notifications, the camera and photos. You can withdraw consent
                in your device settings at any time.
              </>,
              <>
                <Term>Legal obligation</Term> — where the law requires us to
                retain or disclose information.
              </>,
            ]}
          />
          <P>
            If you are in India, we process personal data under the Digital
            Personal Data Protection Act, 2023 on the basis of your consent and
            for the legitimate uses it recognises.
          </P>
        </Section>

        <Section index={6} id="sharing" title="How information is shared">
          <SubHeading>With other people in the app</SubHeading>
          <P>
            Taskgrid is collaborative by design. Members of a group can see your
            name, profile picture, job title and bio, and everything you post in
            that group — tasks, comments, checklists and attachments. Your email
            address and mobile number are visible in the member directory so
            teammates can identify and invite you. Content in a group is not
            visible to anyone who is not a member of that group.
          </P>
          <P>
            An administrator of the service can see account-level details —
            name, email, role, status and signup date — and can enable, disable
            or delete an account.
          </P>

          <SubHeading>With service providers</SubHeading>
          <P>
            These companies process data strictly on our instructions, to run
            the service. They are not permitted to use it for their own
            purposes.
          </P>
          <DataTable
            head={["Provider", "What it handles", "Where"]}
            rows={[
              [
                "Vercel Inc.",
                "Hosting for the web app and the API; short-lived request logs.",
                "United States",
              ],
              [
                "Neon Inc.",
                "The managed PostgreSQL database holding accounts, groups, tasks and notifications.",
                "United States",
              ],
              [
                "Cloudflare, Inc.",
                "Object storage (R2) for profile pictures, group icons and task attachments.",
                "Global edge network",
              ],
              [
                "Expo, Inc.",
                "Relays push notifications to Google and Apple. Receives the notification title, body and destination token.",
                "United States",
              ],
              [
                "Google LLC (Firebase Cloud Messaging) and Apple Inc. (APNs)",
                "Final delivery of a push notification to your device.",
                "United States",
              ],
              [
                "Google, Microsoft, LinkedIn",
                "Identity verification — only if you choose to sign in with that provider.",
                "United States",
              ],
            ]}
          />

          <SubHeading>For legal reasons</SubHeading>
          <P>
            We may disclose information if we believe in good faith that it is
            required by law, or that it is necessary to protect the rights,
            safety or property of our users or of us. If the service is ever
            transferred to another owner, your information would move with it,
            and we would tell you before that happened.
          </P>
        </Section>

        <Section index={7} id="storage" title="Where data is stored">
          <P>
            Your data is stored on servers operated by the providers listed
            above, primarily in the United States. If you use Taskgrid from
            outside the United States, your information is transferred there and
            processed under laws that may differ from those in your country.
            Where such a transfer involves personal data from the EEA or the UK,
            it is made under the European Commission&rsquo;s Standard
            Contractual Clauses as incorporated in our providers&rsquo; terms.
          </P>
          <P>
            All traffic between your device and our servers travels over HTTPS
            with TLS.
          </P>
        </Section>

        <Section index={8} id="retention" title="How long we keep it">
          <DataTable
            head={["Data", "Retention"]}
            rows={[
              [
                "Account and profile",
                "For as long as your account exists. Deleted within 30 days of a verified deletion request.",
              ],
              [
                "Groups, tasks, comments and attachments",
                "Until deleted in the app, or until the owning account is deleted. Note that content you posted in a shared group may remain visible to that group as part of its history if the group itself is not deleted.",
              ],
              [
                "Push tokens",
                "Until you turn notifications off, sign out, or the device revokes the token — whichever comes first. Revoked tokens are deleted automatically on the next send.",
              ],
              [
                "Session tokens",
                "7 days, or 28 days with “remember me”. Cleared immediately when you sign out.",
              ],
              [
                "Technical logs",
                "A short rolling window set by our hosting provider, typically no more than 30 days.",
              ],
            ]}
          />
        </Section>

        <Section index={9} id="security" title="How we protect it">
          <List
            items={[
              "Passwords are stored only as a bcrypt hash with a per-password salt. Nobody, including us, can read your password.",
              "Sessions use a signed token in an HTTP-only, secure cookie on the web, and the operating system's encrypted keystore in the mobile app.",
              "Every API request is authorised on the server before any data is returned. Membership of a group is checked on the server, not in the app.",
              "All network traffic is encrypted in transit with TLS, and data at rest is encrypted by our database and storage providers.",
              "Uploads are limited by type and size, and files are stored under unguessable keys.",
            ]}
          />
          <P>
            No system is perfectly secure. If we ever become aware of a breach
            affecting your personal information, we will notify you and the
            relevant authority as required by law.
          </P>
        </Section>

        <Section index={10} id="your-controls" title="Your choices in the app">
          <List
            items={[
              <>
                <Term>Edit or remove your details</Term> — your name, mobile
                number, job title, bio and profile picture can all be changed or
                cleared on the Profile screen.
              </>,
              <>
                <Term>Change your password</Term> — also on the Profile screen.
              </>,
              <>
                <Term>Turn notifications off</Term> — in your device settings.
                Your push token stops being used and is removed on the next
                delivery attempt.
              </>,
              <>
                <Term>Delete content</Term> — tasks, comments, checklist items,
                attachments and groups you own can be deleted in the app.
              </>,
              <>
                <Term>Leave a group</Term> — this stops new content in that
                group from being shared with you.
              </>,
              <>
                <Term>Sign out</Term> — clears the session on that device.
              </>,
              <>
                <Term>Delete your account</Term> — Profile → Security → Danger
                zone, in both the app and the web app. Immediate and permanent.
              </>,
            ]}
          />
        </Section>

        <Section index={11} id="your-rights" title="Your privacy rights">
          <P>
            Depending on where you live, you have some or all of the following
            rights over your personal information:
          </P>
          <List
            items={[
              "Access — a copy of the personal information we hold about you.",
              "Correction — fix anything inaccurate or incomplete.",
              "Deletion — have your account and personal information erased.",
              "Portability — receive your data in a machine-readable format.",
              "Objection and restriction — object to, or ask us to pause, processing based on our legitimate interests.",
              "Withdraw consent — at any time, without affecting processing already carried out.",
              "Complain — to your local data protection authority.",
            ]}
          />
          <P>
            To exercise any of these, email{" "}
            <MailLink address={CONTACT_EMAIL} /> from the address on your
            account. We respond within 30 days and never charge for it. We do
            not sell or share personal information as those terms are defined
            under California law, so there is nothing to opt out of, and we do
            not discriminate against anyone who exercises a privacy right.
          </P>
        </Section>

        <Section index={12} id="delete-account" title="Deleting your account and data">
          <Callout title="Delete it yourself, in the app">
            <P>
              Open <Term>Profile → Security → Danger zone</Term> and tap{" "}
              <Term>Delete my account</Term>. You confirm with your password, or
              — if you signed up with Google, Microsoft or LinkedIn and never
              set one — by typing your email address. The deletion happens
              immediately and you are signed out. The same option is on the same
              screen in the web app.
            </P>
          </Callout>

          <P>
            The moment you confirm, the following is erased permanently and
            cannot be restored:
          </P>
          <List
            items={[
              "Your name, email address, mobile number, password hash, profile picture, job title and bio.",
              "Your linked Google, Microsoft or LinkedIn sign-in records.",
              "Your group memberships and invitations.",
              "Your comments, attachments, activity entries and notifications.",
              "Every push token registered to you, so notifications stop immediately.",
              "Groups you created, together with the tasks inside them.",
              "Tasks you created in any group, wherever they live.",
            ]}
          />
          <P>
            Tasks that were assigned to you but created by somebody else stay
            with their group and are simply left unassigned, so your team does
            not lose work in progress. Content you posted in a group somebody
            else owns — a comment on their task, for instance — is deleted with
            your account.
          </P>

          <SubHeading>If you cannot use the in-app option</SubHeading>
          <P>
            Email <MailLink address={CONTACT_EMAIL} /> from the address
            registered on your account, with the subject{" "}
            <Term>Delete my account</Term>. We use the sending address to verify
            the request. We confirm receipt within 5 working days and complete
            the deletion within 30 days. Administrator accounts can only be
            removed this way, or by another administrator.
          </P>
          <P>
            If you want a partial deletion instead of the whole account — just
            your profile picture and mobile number, say — you can clear those
            fields yourself on the Profile screen, or ask us by email.
          </P>
          <P>
            Backups are cycled out within 90 days of deletion. We may retain a
            minimal record of the deletion request itself where the law requires
            it.
          </P>
        </Section>

        <Section index={13} id="children" title="Children's privacy">
          <P>
            Taskgrid is intended for people aged 18 and over and is not directed
            to children. We do not knowingly collect personal information from
            anyone under 13 (or under the minimum age of digital consent in your
            country). If you believe a child has given us personal information,
            email <MailLink address={CONTACT_EMAIL} /> and we will delete the
            account.
          </P>
        </Section>

        <Section index={14} id="no-ads" title="Advertising and analytics">
          <P>
            Taskgrid contains no advertising, no in-app purchases, and no
            third-party analytics, attribution or tracking SDK. We do not use
            advertising identifiers, we do not fingerprint devices, and we do
            not track you across other apps or websites. The web app sets no
            cookies other than the one that keeps you signed in and, if you
            change it, the one that remembers your light or dark theme
            preference — both strictly necessary, neither used for tracking.
          </P>
        </Section>

        <Section index={15} id="changes" title="Changes to this policy">
          <P>
            If we change how we handle personal information, we will update this
            page and move the &ldquo;Last updated&rdquo; date at the top. For a
            change that materially affects your rights, we will give notice in
            the app or by email before it takes effect. Continuing to use
            Taskgrid after a change means you accept the updated policy.
          </P>
        </Section>

        <Section index={16} id="contact" title="Contact us">
          <P>
            Questions about this policy, a privacy request, or a suspected
            security issue — one address handles all three, and a person reads
            it.
          </P>
          <ContactCard
            lines={[
              { label: "Controller", value: `${DEVELOPER_NAME} (${LEGAL_NAME})` },
              { label: "Email", value: <MailLink address={CONTACT_EMAIL} /> },
              { label: "Post", value: POSTAL_ADDRESS },
              {
                label: "Response time",
                value:
                  "Within 5 working days; privacy requests completed within 30 days",
              },
              {
                label: "Terms",
                value: (
                  <Link
                    href="/terms"
                    className="font-medium text-brand-600 underline decoration-brand-300 underline-offset-4 transition-colors hover:text-brand-700"
                  >
                    Read the Terms of Service
                  </Link>
                ),
              },
            ]}
          />
        </Section>
      </LegalLayout>
    </>
  );
}
