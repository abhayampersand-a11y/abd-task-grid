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
  title: "Terms of Service",
  description:
    "The agreement between you and Taskgrid (TaskFlow Pro): who may use the service, what you may and may not do with it, who owns your content, and how the account can end.",
  alternates: { canonical: "/terms" },
};

const UPDATED = "21 August 2026";

/** Kept identical to the Privacy Policy's block — same publisher, same account. */
const CONTACT_EMAIL = "abdtech.apps@gmail.com";
const DEVELOPER_NAME = "ABD Tech";
const LEGAL_NAME = "Abhay M Desai";
const POSTAL_ADDRESS =
  "A-404 Suman Srushti Apartment, Near Madhuvan Circle, Adajan Gam, Surat 395009, Gujarat, India";

const SECTIONS: LegalSection[] = [
  { id: "agreement", title: "Agreement to these terms" },
  { id: "eligibility", title: "Who may use Taskgrid" },
  { id: "account", title: "Your account" },
  { id: "acceptable-use", title: "Acceptable use" },
  { id: "your-content", title: "Your content" },
  { id: "groups", title: "Groups, owners and admins" },
  { id: "notifications", title: "Notifications and service messages" },
  { id: "availability", title: "Availability and changes" },
  { id: "fees", title: "Fees" },
  { id: "third-party", title: "Third-party services" },
  { id: "our-ip", title: "Our intellectual property" },
  { id: "feedback", title: "Feedback" },
  { id: "termination", title: "Suspension and termination" },
  { id: "disclaimer", title: "Disclaimer of warranties" },
  { id: "liability", title: "Limitation of liability" },
  { id: "indemnity", title: "Indemnity" },
  { id: "governing-law", title: "Governing law and disputes" },
  { id: "changes", title: "Changes to these terms" },
  { id: "general", title: "General" },
  { id: "contact", title: "Contact" },
];

export default function TermsOfServicePage() {
  return (
    <>
      <LegalHero
        eyebrow="Legal"
        title="Terms of Service"
        summary="These terms are the agreement between you and Taskgrid. They set out who may use the service, what you can and cannot do with it, who owns the content you post, and what happens if an account ends. Please read them — using Taskgrid means you accept them."
        updated={UPDATED}
        effective={UPDATED}
      />

      <LegalLayout sections={SECTIONS}>
        <Section index={1} id="agreement" title="Agreement to these terms">
          <P>
            These Terms of Service (&ldquo;Terms&rdquo;) form a binding
            agreement between you and <Term>{DEVELOPER_NAME}</Term>, the Google
            Play developer account of <Term>{LEGAL_NAME}</Term>{" "}
            (&ldquo;we&rdquo;, &ldquo;us&rdquo;), covering the Android app
            published as <Term>com.taskgrid.app</Term> and the web app published
            as <Term>TaskFlow Pro</Term> at{" "}
            <ExternalLink href="https://abd-task-grid.vercel.app">
              abd-task-grid.vercel.app
            </ExternalLink>{" "}
            (together, the &ldquo;Service&rdquo;).
          </P>
          <P>
            By creating an account, signing in, or using the Service in any way,
            you agree to these Terms and to our{" "}
            <Link
              href="/privacy"
              className="font-medium text-brand-600 underline decoration-brand-300 underline-offset-4 transition-colors hover:text-brand-700"
            >
              Privacy Policy
            </Link>
            , which is incorporated here by reference. If you do not agree, do
            not use the Service.
          </P>
          <P>
            If you accept these Terms on behalf of an employer or another
            organisation, you confirm you have the authority to bind that
            organisation, and &ldquo;you&rdquo; means that organisation.
          </P>
        </Section>

        <Section index={2} id="eligibility" title="Who may use Taskgrid">
          <List
            items={[
              "You must be at least 18 years old. The Service is a workplace tool and is not offered to children.",
              "You must be able to form a binding contract under the law that applies to you.",
              "You must not be barred from using the Service under any applicable law or sanctions regime.",
              "You must not have been previously removed from the Service for a breach of these Terms.",
            ]}
          />
        </Section>

        <Section index={3} id="account" title="Your account">
          <P>
            You need an account to use the Service. You can create one with an
            email address and password, or by signing in with Google, Microsoft
            or LinkedIn.
          </P>
          <List
            items={[
              <>
                <Term>Give accurate details.</Term> Register with real,
                current information and keep it up to date.
              </>,
              <>
                <Term>Keep it secure.</Term> Your password and your signed-in
                devices are your responsibility. Choose a password you do not
                use elsewhere, and sign out on any device you no longer control.
              </>,
              <>
                <Term>One account, one person.</Term> Do not share your
                credentials, and do not let anyone else use your account.
              </>,
              <>
                <Term>Tell us about a problem.</Term> Email us straight away if
                you suspect unauthorised access to your account.
              </>,
            ]}
          />
          <P>
            You are responsible for everything that happens under your account,
            except to the extent it results from our own failure.
          </P>
        </Section>

        <Section index={4} id="acceptable-use" title="Acceptable use">
          <P>
            The Service is for organising work with your team. When you use it,
            you must not:
          </P>
          <List
            items={[
              "Break the law, infringe anyone's intellectual property, or violate anyone's privacy.",
              "Upload or post content that is unlawful, defamatory, harassing, hateful, threatening, sexually explicit, or that depicts or promotes violence.",
              "Upload malware, or any file intended to damage, disable or gain unauthorised access to a system.",
              "Try to access data, accounts, groups or tasks you have not been given access to, or probe, scan or test the security of the Service.",
              "Interfere with the Service — overload it, circumvent rate limits, or disrupt it for other users.",
              "Scrape, crawl or bulk-extract data from the Service by automated means, or resell or redistribute the Service.",
              "Reverse-engineer, decompile or attempt to derive the source code of the app, except where the law expressly permits it.",
              "Impersonate another person, or misrepresent your affiliation with any person or organisation.",
              "Use the Service to send spam or unsolicited messages, including through group invitations.",
              "Use another person's personal information — including uploading their photo or details — without their permission.",
            ]}
          />
          <P>
            The Service carries user-generated content, including comments and
            attachments written by other members of your groups. We do not
            pre-screen that content. If you see something that breaches these
            Terms, report it to <MailLink address={CONTACT_EMAIL} /> and we will
            review it, and remove content or suspend accounts where we judge it
            necessary.
          </P>
        </Section>

        <Section index={5} id="your-content" title="Your content">
          <SubHeading>You own it</SubHeading>
          <P>
            Groups, tasks, descriptions, checklists, comments and files you
            upload are yours (&ldquo;Your Content&rdquo;). We claim no ownership
            in them.
          </P>

          <SubHeading>The permission you give us</SubHeading>
          <P>
            To run the Service, you grant us a worldwide, non-exclusive,
            royalty-free licence to host, store, reproduce, transmit and display
            Your Content — strictly for the purpose of operating, maintaining
            and improving the Service and delivering it to you and to the people
            you share it with. This licence exists only so the software can
            work; it ends when you delete the content or your account, subject
            to the retention periods in the{" "}
            <Link
              href="/privacy#retention"
              className="font-medium text-brand-600 underline decoration-brand-300 underline-offset-4 transition-colors hover:text-brand-700"
            >
              Privacy Policy
            </Link>
            . We do not sell Your Content and we do not use it to train machine
            learning models.
          </P>

          <SubHeading>What you promise about it</SubHeading>
          <P>
            You confirm you have the rights needed to post Your Content and that
            it does not breach these Terms or anyone else&rsquo;s rights. You
            are responsible for what you post, including anything you upload
            that contains someone else&rsquo;s personal information.
          </P>

          <Callout title="Content is only as private as the group it lives in" tone="neutral">
            <P>
              Anything you post inside a group is visible to every member of
              that group, and stays visible to them as part of the group&rsquo;s
              history even if you later leave. Do not post anything in a shared
              group that you would not want its members to keep.
            </P>
          </Callout>

          <SubHeading>Backups</SubHeading>
          <P>
            We keep operational backups, but they are for disaster recovery, not
            for restoring content you deleted. Keep your own copy of anything
            you cannot afford to lose.
          </P>
        </Section>

        <Section index={6} id="groups" title="Groups, owners and admins">
          <DataTable
            head={["Role", "What they can do"]}
            rows={[
              [
                "Group owner",
                "Creates the group, invites and removes members, edits the group's name, description, icon and visibility, and can delete the group along with every task inside it.",
              ],
              [
                "Group member",
                "Sees and works on the tasks in that group: creating, assigning, commenting and attaching files.",
              ],
              [
                "Service administrator",
                "Sees account-level details for every user — name, email, role, status and signup date — and can enable, disable, promote or delete an account where it is needed to operate the Service, enforce these Terms, or comply with the law.",
              ],
            ]}
          />
          <P>
            Deleting a group deletes the tasks, comments, checklists and
            attachments inside it for everyone. That cannot be undone, so a
            group owner should confirm with their members first.
          </P>
        </Section>

        <Section index={7} id="notifications" title="Notifications and service messages">
          <P>
            When you allow notifications, we send you alerts about events that
            involve you — a task assigned to you, a comment on your work, or an
            invitation to a group. These are service messages tied to your
            account, not marketing. You can turn them off in your device
            settings at any time; the in-app notification list keeps working
            either way.
          </P>
          <P>
            We may also email you about your account, security, or material
            changes to these Terms. You cannot opt out of those while you hold
            an account, because they are part of providing the Service.
          </P>
        </Section>

        <Section index={8} id="availability" title="Availability and changes">
          <P>
            We work to keep the Service running, but we do not promise
            uninterrupted or error-free availability. Maintenance, provider
            outages and faults happen. We may add, change or remove features at
            any time. If we plan to discontinue the Service or remove a feature
            you rely on, we will give you reasonable notice and, where we can, a
            way to export your data first.
          </P>
        </Section>

        <Section index={9} id="fees" title="Fees">
          <P>
            The Service is currently provided free of charge. There are no
            in-app purchases and no subscription. If we ever introduce paid
            features, we will publish the pricing and terms in advance, and no
            charge will apply to you without your clear, prior agreement.
          </P>
        </Section>

        <Section index={10} id="third-party" title="Third-party services">
          <P>
            Signing in with Google, Microsoft or LinkedIn is governed by that
            provider&rsquo;s own terms and privacy policy, in addition to these
            Terms. The Android app is distributed through Google Play and your
            use of it is also subject to the Google Play Terms of Service.
            Notifications are delivered through Expo, Firebase Cloud Messaging
            and Apple Push Notification service. We are not responsible for the
            acts, omissions or availability of these third parties. Links or
            files pointing outside the Service are not endorsed by us.
          </P>
        </Section>

        <Section index={11} id="our-ip" title="Our intellectual property">
          <P>
            The Service — its software, design, layout, text, graphics, logos
            and the Taskgrid and TaskFlow Pro names — belongs to us and is
            protected by intellectual property law. These Terms give you a
            limited, personal, non-exclusive, non-transferable, revocable
            licence to use the Service as it is intended to be used. Nothing
            here transfers ownership of anything to you, and you must not use
            our names or branding without written permission.
          </P>
        </Section>

        <Section index={12} id="feedback" title="Feedback">
          <P>
            If you send us a suggestion, bug report or idea, we may use it
            freely, without obligation, payment or attribution to you. You keep
            any rights you have in it; you are simply giving us permission to
            act on it.
          </P>
        </Section>

        <Section index={13} id="termination" title="Suspension and termination">
          <SubHeading>Ending it yourself</SubHeading>
          <P>
            You can stop using the Service at any time. To close your account,
            open <Term>Profile → Security → Danger zone</Term> and choose{" "}
            <Term>Delete my account</Term> — in the app or on the web. It takes
            effect immediately and cannot be undone. What is erased, and what
            stays with your team, is set out in{" "}
            <Link
              href="/privacy#delete-account"
              className="font-medium text-brand-600 underline decoration-brand-300 underline-offset-4 transition-colors hover:text-brand-700"
            >
              the Privacy Policy
            </Link>
            .
          </P>

          <SubHeading>Ending it on our side</SubHeading>
          <P>
            We may suspend or terminate your access if you breach these Terms,
            if your use puts the Service or other users at risk, or if we are
            required to by law. Where circumstances reasonably allow, we will
            tell you why and give you a chance to put it right first. For a
            serious breach — unlawful content, an attack on the Service, or
            harm to another user — suspension may be immediate.
          </P>

          <SubHeading>What survives</SubHeading>
          <P>
            When an account ends, the licence in section 11 ends with it and you
            must stop using the Service. Sections covering your content
            warranties, our intellectual property, disclaimers, limitation of
            liability, indemnity and governing law survive termination.
          </P>
        </Section>

        <Section index={14} id="disclaimer" title="Disclaimer of warranties">
          <P>
            The Service is provided <Term>&ldquo;as is&rdquo;</Term> and{" "}
            <Term>&ldquo;as available&rdquo;</Term>. To the fullest extent
            permitted by law, we disclaim all warranties, express or implied,
            including merchantability, fitness for a particular purpose,
            non-infringement, and any warranty that the Service will be
            uninterrupted, secure, accurate or free of errors. Taskgrid is a
            task management tool; it is not a system of record for legal,
            medical, financial or safety-critical purposes, and you should not
            rely on it as one.
          </P>
          <P>
            Some jurisdictions do not allow the exclusion of certain warranties.
            Where that is the case, this section applies to you only as far as
            the law allows, and nothing in these Terms limits any consumer
            rights you have that cannot be waived.
          </P>
        </Section>

        <Section index={15} id="liability" title="Limitation of liability">
          <P>
            To the fullest extent permitted by law, we are not liable for any
            indirect, incidental, special, consequential or punitive damages, or
            for any loss of profits, revenue, data, goodwill or business
            opportunity, arising out of or in connection with the Service —
            whether the claim is in contract, tort or otherwise, and even if we
            were told such damages were possible.
          </P>
          <P>
            Our total aggregate liability for all claims relating to the Service
            is limited to the greater of the amount you paid us in the twelve
            months before the claim arose, or fifty US dollars (US$50). Because
            the Service is currently free, this will usually be US$50.
          </P>
          <P>
            Nothing in these Terms excludes or limits liability for fraud,
            fraudulent misrepresentation, death or personal injury caused by
            negligence, or any other liability that cannot lawfully be excluded.
          </P>
        </Section>

        <Section index={16} id="indemnity" title="Indemnity">
          <P>
            You agree to indemnify and hold us harmless from any claim, demand,
            loss or expense — including reasonable legal fees — arising out of
            your content, your use of the Service, or your breach of these Terms
            or of any law or third-party right. We will notify you of any such
            claim and you may control the defence, provided any settlement that
            imposes an obligation on us needs our written consent.
          </P>
        </Section>

        <Section index={17} id="governing-law" title="Governing law and disputes">
          <P>
            These Terms are governed by the laws of India, without regard to
            conflict-of-laws rules. The courts at Surat, Gujarat, India have
            exclusive jurisdiction over any dispute arising from them, and you
            consent to that jurisdiction and venue.
          </P>
          <P>
            If you are a consumer resident in the European Union, the United
            Kingdom, or another jurisdiction whose law gives you the right to
            bring proceedings in your local courts, this section does not take
            that right away from you.
          </P>
          <P>
            Before starting formal proceedings, please email us at{" "}
            <MailLink address={CONTACT_EMAIL} />. Most disputes are resolved
            faster that way.
          </P>
        </Section>

        <Section index={18} id="changes" title="Changes to these terms">
          <P>
            We may update these Terms as the Service develops or the law
            changes. The &ldquo;Last updated&rdquo; date at the top always
            reflects the current version. For a material change, we will give
            notice in the app or by email before it takes effect. Continuing to
            use the Service after a change means you accept the revised Terms;
            if you do not accept them, stop using the Service and request
            deletion of your account.
          </P>
        </Section>

        <Section index={19} id="general" title="General">
          <List
            items={[
              <>
                <Term>Entire agreement.</Term> These Terms and the Privacy
                Policy are the whole agreement between you and us about the
                Service, and replace anything said before.
              </>,
              <>
                <Term>Severability.</Term> If a provision is found
                unenforceable, it is limited or removed to the minimum extent
                necessary and the rest stays in force.
              </>,
              <>
                <Term>No waiver.</Term> If we do not enforce a right, we have
                not given it up.
              </>,
              <>
                <Term>Assignment.</Term> You may not assign these Terms without
                our written consent. We may assign them to a successor in
                connection with a merger, acquisition or sale of assets.
              </>,
              <>
                <Term>No third-party rights.</Term> These Terms create rights
                only for you and us.
              </>,
              <>
                <Term>Force majeure.</Term> Neither party is liable for delay or
                failure caused by events beyond its reasonable control.
              </>,
              <>
                <Term>Language.</Term> These Terms are written in English; an
                English version prevails over any translation.
              </>,
            ]}
          />
        </Section>

        <Section index={20} id="contact" title="Contact">
          <ContactCard
            lines={[
              {
                label: "Service",
                value:
                  "Taskgrid — com.taskgrid.app (Android), TaskFlow Pro (web)",
              },
              {
                label: "Operated by",
                value: `${DEVELOPER_NAME} (${LEGAL_NAME})`,
              },
              { label: "Email", value: <MailLink address={CONTACT_EMAIL} /> },
              { label: "Post", value: POSTAL_ADDRESS },
              {
                label: "Privacy",
                value: (
                  <Link
                    href="/privacy"
                    className="font-medium text-brand-600 underline decoration-brand-300 underline-offset-4 transition-colors hover:text-brand-700"
                  >
                    Read the Privacy Policy
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
