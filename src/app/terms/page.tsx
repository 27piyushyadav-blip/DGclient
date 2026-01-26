/*
 * File: src/app/terms/page.tsx
 * SR-DEV: Comprehensive Terms of Service (Extended Enterprise Version)
 *
 * FEATURES:
 * - Medical Disclaimer Highlight.
 * - Clear distinction between Platform and Expert responsibilities.
 * - Readable typography with Tailwind Typography plugin (prose).
 */

import type { Metadata } from "next";
import Link from "next/link";
import { 
  ArrowLeft, 
  ShieldCheck, 
  Scale, 
  FileText, 
  Mail, 
  Phone, 
  MapPin 
} from "lucide-react";

export const metadata: Metadata = {
  title: "Terms of Service | Mind Namo",
  description:
    "The definitive legal agreement governing the use of the Mind Namo platform.",
};

export default function TermsPage() {
  return (
    <div className="flex min-h-[100dvh] flex-col bg-white dark:bg-zinc-950">
      
      {/* --- Header --- */}
      <div className="bg-zinc-50/80 dark:bg-zinc-900/50 border-b border-zinc-200 dark:border-zinc-800 py-16">
        <div className="container mx-auto max-w-5xl px-6 md:px-8">
          <nav className="flex items-center gap-2 text-sm text-zinc-500 dark:text-zinc-400 mb-8">
            <Link href="/" className="hover:text-primary transition-colors">
              Home
            </Link>
            <span className="text-zinc-300 dark:text-zinc-700">/</span>
            <span className="text-zinc-900 dark:text-zinc-200 font-medium">
              Legal
            </span>
            <span className="text-zinc-300 dark:text-zinc-700">/</span>
            <span className="text-primary font-medium">Terms of Service</span>
          </nav>

          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
            <div>
              <div className="flex items-center gap-3 mb-4">
                <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg text-blue-700 dark:text-blue-400">
                  <Scale className="w-6 h-6" />
                </div>
                <span className="text-sm font-bold text-blue-700 dark:text-blue-400 uppercase tracking-wider">
                  Legal Agreement
                </span>
              </div>
              <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight text-zinc-900 dark:text-white">
                Terms of Service
              </h1>
              <p className="mt-4 text-lg text-zinc-600 dark:text-zinc-400 max-w-2xl leading-relaxed">
                Please read these terms carefully. They govern your use of our
                platform and outline your rights and responsibilities.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* --- Main Content --- */}
      <main className="container mx-auto max-w-5xl px-6 md:px-8 py-20 flex-1">
        <article className="prose prose-lg prose-zinc dark:prose-invert max-w-none selection:bg-blue-100 dark:selection:bg-blue-900/30">
          
          {/* 1. Introduction */}
          <section className="mb-20">
            <h2 className="text-3xl font-bold text-zinc-900 dark:text-white pb-4 border-b border-zinc-200 dark:border-zinc-800 mb-8">
              1. Introduction & Acceptance
            </h2>

            <div className="space-y-6 text-zinc-700 dark:text-zinc-300">
              <p>
                Welcome to <strong>Mind Namo</strong> ("we," "our," or "the
                Platform"). These Terms of Service ("Terms") govern your access
                to and use of all features, services, and digital products
                offered through our website and mobile platform.
              </p>

              <p>
                By accessing the Platform, creating an account, or booking a
                session, you agree to be bound by these Terms. If you do not
                agree with any part of these Terms, please discontinue your use
                of the Platform immediately.
              </p>

              <div className="p-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-xl">
                <p className="text-blue-800 dark:text-blue-200 font-medium">
                  <strong>Summary: </strong>
                  These terms constitute a legally binding agreement. By using
                  our services, you agree to follow the rules described here.
                </p>
              </div>
            </div>
          </section>

          {/* 2. Medical Disclaimer */}
          <section className="mb-20">
            <h2 className="text-3xl font-bold text-zinc-900 dark:text-white pb-4 border-b border-zinc-200 dark:border-zinc-800 mb-8">
              2. Medical Disclaimer
            </h2>

            <div className="p-6 bg-amber-50 dark:bg-amber-900/20 border-l-4 border-amber-500 rounded-r-xl mb-8">
              <h4 className="font-bold text-xl text-amber-900 dark:text-amber-200 mb-3 flex items-center gap-2">
                <ShieldCheck className="w-6 h-6" /> Important Notice
              </h4>
              <p className="text-amber-800 dark:text-amber-300 leading-relaxed">
                Mind Namo is a technology platform. We are <strong>not</strong>{" "}
                a medical or healthcare provider. The content on our platform
                should never be considered a substitute for professional medical
                advice, diagnosis, or treatment.
              </p>
            </div>

            <div className="space-y-8 text-zinc-700 dark:text-zinc-300">
              <div>
                <h3 className="text-xl font-semibold mb-3 text-zinc-900 dark:text-white">
                  2.1 Emergency Situations
                </h3>
                <p>
                  Our Platform must not be used during medical emergencies or
                  crisis situations. If you are experiencing thoughts of
                  self-harm, severe distress, or immediate danger:
                </p>
                <ul className="list-disc pl-6 mt-3 space-y-2">
                  <li>Contact your local emergency services immediately.</li>
                  <li>Visit the nearest hospital emergency department.</li>
                  <li>Reach out to a trusted emergency helpline.</li>
                </ul>
              </div>

              <div>
                <h3 className="text-xl font-semibold mb-3 text-zinc-900 dark:text-white">
                  2.2 No Clinical Relationship
                </h3>
                <p>
                  Using the Platform does not create any doctor–patient or
                  therapist–client relationship with Mind Namo. Any professional relationship
                  exists solely between you and the independent Expert you
                  choose to consult.
                </p>
              </div>
            </div>
          </section>

          {/* 3. User Accounts */}
          <section className="mb-20">
            <h2 className="text-3xl font-bold text-zinc-900 dark:text-white pb-4 border-b border-zinc-200 dark:border-zinc-800 mb-8">
              3. User Accounts & Eligibility
            </h2>

            <div className="space-y-8 text-zinc-700 dark:text-zinc-300">
              <div>
                <h3 className="text-xl font-semibold mb-3 text-zinc-900 dark:text-white">
                  3.1 Minimum Age Requirement
                </h3>
                <p>
                  You must be at least <strong>18 years old</strong> to create
                  an account or use the Platform.
                </p>
              </div>

              <div>
                <h3 className="text-xl font-semibold mb-3 text-zinc-900 dark:text-white">
                  3.2 Your Responsibility
                </h3>
                <p>Your account is your responsibility. You agree to:</p>
                <ul className="list-disc pl-6 mt-3 space-y-2">
                  <li>Keep your login information confidential.</li>
                  <li>Notify us immediately if your account is compromised.</li>
                  <li>
                    Use accurate and truthful information during registration.
                  </li>
                </ul>
              </div>
            </div>
          </section>

          {/* 4. Experts & Services */}
          <section className="mb-20">
            <h2 className="text-3xl font-bold text-zinc-900 dark:text-white pb-4 border-b border-zinc-200 dark:border-zinc-800 mb-8">
              4. Experts & Services
            </h2>

            <div className="space-y-6 text-zinc-700 dark:text-zinc-300">
              <p>
                Experts listed on Mind Namo are independent professionals such
                as coaches, therapists, mentors, or consultants. They are{" "}
                <strong>not</strong> employees of Mind Namo.
              </p>

              <h3 className="text-xl font-semibold text-zinc-900 dark:text-white">
                Mind Namo does not:
              </h3>
              <ul className="list-disc pl-6 mt-3 space-y-2">
                <li>
                  Guarantee the expertise, skills, or specific outcomes of any Expert.
                </li>
                <li>Provide medical or clinical supervision over Experts.</li>
                <li>Accept liability for advice given by Experts during sessions.</li>
              </ul>
            </div>
          </section>

          {/* 5. Booking & Cancellation */}
          <section className="mb-20">
            <h2 className="text-3xl font-bold text-zinc-900 dark:text-white pb-4 border-b border-zinc-200 dark:border-zinc-800 mb-8">
              5. Booking & Cancellation
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 not-prose mb-8">
              <div className="p-8 bg-zinc-100 dark:bg-zinc-900 rounded-2xl border border-zinc-200 dark:border-zinc-800">
                <h4 className="font-bold text-zinc-900 dark:text-white text-lg mb-4">
                  24+ Hours Notice
                </h4>
                <p className="text-zinc-700 dark:text-zinc-400 leading-relaxed">
                  Cancel your session at least 24 hours before it begins to
                  receive a <strong>full refund</strong>. No charges will apply.
                </p>
              </div>

              <div className="p-8 bg-zinc-100 dark:bg-zinc-900 rounded-2xl border border-zinc-200 dark:border-zinc-800">
                <h4 className="font-bold text-zinc-900 dark:text-white text-lg mb-4">
                  Less Than 24 Hours
                </h4>
                <p className="text-zinc-700 dark:text-zinc-400 leading-relaxed">
                  Cancellations made within 24 hours of the session start time
                  are <strong>non-refundable</strong> to compensate the Expert for their time.
                </p>
              </div>
            </div>
          </section>

          {/* 6. Intellectual Property */}
          <section className="mb-20">
            <h2 className="text-3xl font-bold text-zinc-900 dark:text-white pb-4 border-b border-zinc-200 dark:border-zinc-800 mb-8">
              6. Intellectual Property
            </h2>

            <div className="space-y-6 text-zinc-700 dark:text-zinc-300">
              <p>
                All content on the Platform—including text, graphics, audio,
                video, logos, icons, software, and user interface elements—is
                the exclusive property of <strong>Mind Namo</strong> or our licensors.
              </p>
              <p>
                You may access and use the Platform for personal, non-commercial purposes only. 
                Copying, reverse engineering, or using our materials for commercial purposes without permission is strictly prohibited.
              </p>
            </div>
          </section>

          {/* 7. Contact Us */}
          <section>
            <h2 className="text-3xl font-bold text-zinc-900 dark:text-white pb-4 border-b border-zinc-200 dark:border-zinc-800 mb-8">
              7. Contact Us
            </h2>

            <p className="text-zinc-700 dark:text-zinc-300 mb-6">
              For questions, feedback, legal concerns, or support related to
              these Terms, please reach out to our team using the contact
              details below.
            </p>

            <div className="p-8 rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 shadow-sm max-w-md">
              <div className="flex items-center gap-3 mb-6">
                <div className="p-2 rounded-xl bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400">
                  <FileText className="w-5 h-5" />
                </div>
                <h4 className="font-bold text-xl text-zinc-900 dark:text-white">
                  Legal Team
                </h4>
              </div>

              <ul className="space-y-6 text-sm">
                <li className="flex items-start gap-3">
                  <div className="p-1.5 rounded-lg bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 mt-0.5">
                    <Mail className="w-4 h-4" />
                  </div>
                  <div>
                    <p className="font-medium text-zinc-900 dark:text-white">
                      Email
                    </p>
                    <a
                      href="mailto:legal@mindnamo.com"
                      className="text-blue-600 dark:text-blue-400 hover:underline"
                    >
                      legal@mindnamo.com
                    </a>
                  </div>
                </li>

                <li className="flex items-start gap-3">
                  <div className="p-1.5 rounded-lg bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 mt-0.5">
                    <MapPin className="w-4 h-4" />
                  </div>
                  <div>
                    <p className="font-medium text-zinc-900 dark:text-white">
                      Address
                    </p>
                    <p className="text-zinc-600 dark:text-zinc-400 leading-relaxed">
                      123 Wellness Blvd,
                      <br />
                      Tech Park, Bangalore,
                      <br />
                      India — 560001
                    </p>
                  </div>
                </li>
              </ul>
            </div>
          </section>

        </article>
      </main>

    </div>
  );
}
