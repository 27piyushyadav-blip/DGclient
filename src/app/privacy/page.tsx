/*
 * File: src/app/privacy/page.tsx
 * SR-DEV: Premium Privacy Policy Page
 *
 * FEATURES:
 * - Consistent enterprise-grade legal layout.
 * - Clear "Zero Data Selling" commitment.
 * - Sections for GDPR-style user rights.
 */

import type { Metadata } from "next";
import Link from "next/link";
import { 
  Lock, 
  ShieldCheck, 
  Mail, 
  Phone, 
  MapPin, 
  FileText 
} from "lucide-react";

export const metadata: Metadata = {
  title: "Privacy Policy | Mind Namo",
  description: "How Mind Namo collects, uses, and protects your personal data.",
};

export default function PrivacyPage() {
  return (
    <div className="flex min-h-[100dvh] flex-col bg-white dark:bg-zinc-950">
      
      {/* --- Header --- */}
      <div className="bg-zinc-50/80 dark:bg-zinc-900/50 border-b border-zinc-200 dark:border-zinc-800 py-16">
        <div className="container mx-auto max-w-5xl px-6 md:px-8">
          {/* Breadcrumbs */}
          <nav className="flex items-center gap-2 text-sm text-zinc-500 dark:text-zinc-400 mb-8">
            <Link href="/" className="hover:text-primary transition-colors">
              Home
            </Link>
            <span className="text-zinc-300 dark:text-zinc-700">/</span>
            <span className="text-zinc-900 dark:text-zinc-200 font-medium">
              Legal
            </span>
            <span className="text-zinc-300 dark:text-zinc-700">/</span>
            <span className="text-primary font-medium">Privacy Policy</span>
          </nav>

          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
            <div>
              <div className="flex items-center gap-3 mb-4">
                <div className="p-2 bg-green-100 dark:bg-green-900/30 rounded-lg text-green-700 dark:text-green-400">
                  <Lock className="w-6 h-6" />
                </div>
                <span className="text-sm font-bold text-green-700 dark:text-green-400 uppercase tracking-wider">
                  Data Protection
                </span>
              </div>
              <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight text-zinc-900 dark:text-white">
                Privacy Policy
              </h1>
              <p className="mt-4 text-lg text-zinc-600 dark:text-zinc-400 max-w-2xl leading-relaxed">
                Your privacy matters deeply to us. This page explains exactly
                how Mind Namo collects, handles, protects, and respects your
                personal information.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* --- Main Content --- */}
      <main className="container mx-auto max-w-5xl px-6 md:px-8 py-20 flex-1">
        <article className="prose prose-lg prose-zinc dark:prose-invert max-w-none selection:bg-green-100 dark:selection:bg-green-900/30">
          
          {/* 1. Introduction & Purpose */}
          <section className="mb-20">
            <h2 className="text-3xl font-bold text-zinc-900 dark:text-white pb-4 border-b border-zinc-200 dark:border-zinc-800 mb-8">
              1. Introduction & Purpose
            </h2>

            <div className="space-y-6 text-zinc-700 dark:text-zinc-300">
              <p>
                Welcome to <strong>Mind Namo</strong>. This Privacy Policy
                explains how we collect, use, disclose, and safeguard your
                information when you visit our Platform or use any of our
                services. We understand that mental wellness involves deeply
                personal matters, and we treat your privacy with the highest
                degree of responsibility and respect.
              </p>

              <p>
                The purpose of this document is to provide complete transparency
                on:
              </p>

              <ul className="list-disc pl-6 space-y-2">
                <li>What data we collect and why</li>
                <li>How your information is used internally</li>
                <li>Who we share your data with and under what conditions</li>
                <li>Your rights regarding your personal data</li>
                <li>How you can control, delete, or export your data</li>
                <li>How we maintain security and compliance</li>
              </ul>

              <p>
                By accessing our Platform, you confirm that you have read,
                understood, and agree to all aspects of this Privacy Policy. If
                you do not agree, please discontinue using our platform
                immediately.
              </p>

              <div className="p-5 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-xl">
                <p className="text-green-800 dark:text-green-200">
                  <strong>Summary: </strong>
                  We collect only the information required to run our services,
                  we do not sell your data, we use strict security measures, and
                  you may request deletion or access at any time.
                </p>
              </div>
            </div>
          </section>

          {/* 2. Information We Collect */}
          <section className="mb-20">
            <h2 className="text-3xl font-bold text-zinc-900 dark:text-white pb-4 border-b border-zinc-200 dark:border-zinc-800 mb-8">
              2. Information We Collect
            </h2>

            <p className="text-zinc-700 dark:text-zinc-300 mb-8">
              We collect information to provide services effectively, ensure
              security, personalize your experience, and improve our overall
              offerings. The information we gather falls into three major
              categories.
            </p>

            {/* 2.1 User-Provided Info */}
            <h3 className="text-2xl font-semibold mb-4 text-zinc-900 dark:text-white">
              2.1 Information You Provide Directly
            </h3>

            <p className="text-zinc-700 dark:text-zinc-300 mb-4">
              This includes information you voluntarily provide while creating
              an account, interacting with Experts, or communicating with us.
            </p>

            <ul className="list-disc pl-6 space-y-3 text-zinc-700 dark:text-zinc-300">
              <li>
                <strong>Account Details:</strong> Name, email address, and profile picture.
              </li>
              <li>
                <strong>Wellness Preferences:</strong> Categories you browse and Experts you engage with.
              </li>
              <li>
                <strong>Support Requests:</strong> Emails, messages, or calls made to our customer support team.
              </li>
              <li>
                <strong>Feedback & Surveys:</strong> Reviews, ratings, and responses provided during improvement surveys.
              </li>
            </ul>

            {/* 2.2 Automatic Data */}
            <h3 className="text-2xl font-semibold mt-10 mb-4 text-zinc-900 dark:text-white">
              2.2 Information Collected Automatically
            </h3>

            <p className="text-zinc-700 dark:text-zinc-300 mb-4">
              To ensure security, stability, and platform optimization, we
              automatically collect:
            </p>

            <ul className="list-disc pl-6 space-y-3 text-zinc-700 dark:text-zinc-300">
              <li>
                <strong>Device & Technical Data:</strong> Browser version, OS, device model, IP address.
              </li>
              <li>
                <strong>Usage Metrics:</strong> Time spent on pages, clicks, navigation flows.
              </li>
              <li>
                <strong>Error Logs:</strong> Crash reports, loading issues, failed API calls.
              </li>
              <li>
                <strong>Cookies & Identifiers:</strong> Session cookies and authentication tokens.
              </li>
            </ul>

            {/* 2.3 Sensitive Data */}
            <h3 className="text-2xl font-semibold mt-10 mb-4 text-zinc-900 dark:text-white">
              2.3 Sensitive & Session Data
            </h3>

            <div className="p-5 bg-amber-50 dark:bg-amber-900/20 border-l-4 border-amber-400 rounded-r-xl mb-4">
              <p className="text-zinc-900 dark:text-white">
                <strong>
                  We do not record, store, or access the audio/video content of
                  your sessions.
                </strong>
                WebRTC sessions are end-to-end encrypted and inaccessible to our
                servers.
              </p>
            </div>

            <p className="text-zinc-700 dark:text-zinc-300">
              We may store session metadata such as:
            </p>

            <ul className="list-disc pl-6 space-y-2 text-zinc-700 dark:text-zinc-300">
              <li>Expert selected</li>
              <li>Session duration</li>
              <li>Date & timestamps</li>
              <li>Selected topic or category</li>
            </ul>
          </section>

          {/* 3. How We Use Your Information */}
          <section className="mb-20">
            <h2 className="text-3xl font-bold text-zinc-900 dark:text-white pb-4 border-b border-zinc-200 dark:border-zinc-800 mb-8">
              3. How We Use Your Information
            </h2>

            <p className="text-zinc-700 dark:text-zinc-300 mb-8">
              We use your data to provide services, maintain security,
              personalize your experience, and continuously improve our
              offerings.
            </p>

            <h3 className="text-2xl font-semibold text-zinc-900 dark:text-white mb-4">
              3.1 Core Service Delivery
            </h3>

            <ul className="list-disc pl-6 space-y-3 text-zinc-700 dark:text-zinc-300">
              <li>Create and manage your user account.</li>
              <li>Enable secure login and authentication.</li>
              <li>Facilitate browsing, booking, and joining expert sessions.</li>
              <li>Send confirmations, reminders, and updates.</li>
            </ul>

            <h3 className="text-2xl font-semibold mt-10 text-zinc-900 dark:text-white mb-4">
              3.2 Safety, Compliance & Prevention
            </h3>

            <ul className="list-disc pl-6 space-y-3 text-zinc-700 dark:text-zinc-300">
              <li>Detect fraud and prevent unauthorized access.</li>
              <li>Monitor activity to ensure platform safety.</li>
              <li>Comply with legal requests and government regulations.</li>
              <li>Protect the integrity of user data.</li>
            </ul>
          </section>

          {/* 4. Data Sharing & Disclosure */}
          <section className="mb-20">
            <h2 className="text-3xl font-bold text-zinc-900 dark:text-white pb-4 border-b border-zinc-200 dark:border-zinc-800 mb-8">
              4. Data Sharing & Disclosure
            </h2>

            <div className="p-8 bg-green-50 dark:bg-green-900/20 border-l-4 border-green-500 rounded-r-xl mb-8">
              <h4 className="text-green-900 dark:text-green-100 font-bold text-xl mb-2">
                Zero Data Selling Commitment
              </h4>
              <p className="text-green-900 dark:text-green-200 font-medium">
                We do <strong>not</strong> sell or rent your data to
                advertisers, brokers, or any external marketing firms. Your data
                stays strictly within our operational ecosystem.
              </p>
            </div>

            <p className="text-zinc-700 dark:text-zinc-300 mb-6">
              However, we share essential information with the following
              categories of partners:
            </p>

            <h3 className="text-xl font-semibold text-zinc-900 dark:text-white mb-3">
              4.1 Service Providers
            </h3>

            <ul className="list-disc pl-6 space-y-3 text-zinc-700 dark:text-zinc-300">
              <li>
                <strong>Cloud Providers</strong> (e.g., Vercel, AWS): Hosting and database operations.
              </li>
              <li>
                <strong>Communication Tools</strong> (e.g., Nodemailer/SMTP): Sending OTPs and emails.
              </li>
              <li>
                <strong>Analytics Platforms</strong>: Understanding anonymous user behavior to improve the app.
              </li>
            </ul>

            <h3 className="text-xl font-semibold mt-10 text-zinc-900 dark:text-white mb-3">
              4.2 Expert Interactions
            </h3>

            <p className="text-zinc-700 dark:text-zinc-300">
              Experts only receive the minimum data necessary to conduct
              sessions:
            </p>

            <ul className="list-disc pl-6 space-y-2 text-zinc-700 dark:text-zinc-300">
              <li>Your name</li>
              <li>Chosen category</li>
              <li>Session details</li>
            </ul>
          </section>

          {/* 5. Data Security Measures */}
          <section className="mb-20">
            <h2 className="text-3xl font-bold text-zinc-900 dark:text-white pb-4 border-b border-zinc-200 dark:border-zinc-800 mb-8">
              5. Data Security Measures
            </h2>

            <p className="text-zinc-700 dark:text-zinc-300 mb-6">
              We employ advanced, industry-leading security protocols to
              safeguard your data throughout its lifecycle.
            </p>

            <ul className="list-disc pl-6 space-y-2 text-zinc-700 dark:text-zinc-300">
              <li>SSL/TLS encryption for all transmitted data</li>
              <li>Password hashing (Bcrypt) for account security</li>
              <li>Regular vulnerability assessments</li>
              <li>Strict role-based access controls for internal tools</li>
            </ul>

            <div className="p-5 mt-6 bg-blue-50 dark:bg-blue-900/20 border-l-4 border-blue-400 rounded-r-xl">
              <p className="text-zinc-800 dark:text-zinc-200">
                <strong>Note:</strong> While we strive for maximum security, no method of transmission over the Internet is 100% secure.
              </p>
            </div>
          </section>

          {/* 6. Your Rights */}
          <section className="mb-20">
            <h2 className="text-3xl font-bold text-zinc-900 dark:text-white pb-4 border-b border-zinc-200 dark:border-zinc-800 mb-8">
              6. Your Rights & Choices
            </h2>

            <p className="text-zinc-700 dark:text-zinc-300 mb-6">
              As a user, you retain full control over your data. You have the
              right to:
            </p>

            <ul className="list-disc pl-6 space-y-3 text-zinc-700 dark:text-zinc-300">
              <li>
                <strong>Access:</strong> Request a copy of your stored data.
              </li>
              <li>
                <strong>Correction:</strong> Update or edit inaccurate personal details via your profile.
              </li>
              <li>
                <strong>Deletion:</strong> Request full deletion of your account and data ("Right to be Forgotten").
              </li>
              <li>
                <strong>Opt-Out:</strong> Unsubscribe from non-essential communications like newsletters.
              </li>
            </ul>
          </section>

          {/* 7. Contact Us */}
          <section>
            <h2 className="text-3xl font-bold text-zinc-900 dark:text-white pb-4 border-b border-zinc-200 dark:border-zinc-800 mb-8">
              7. Contact Us
            </h2>

            <p className="text-zinc-700 dark:text-zinc-300 mb-6">
              If you have questions, concerns, or wish to exercise any privacy
              rights, please reach out to our Data Protection Officer:
            </p>

            <div className="p-8 rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 shadow-sm hover:shadow-md transition-shadow duration-200 max-w-md">
              <div className="flex items-center gap-3 mb-6">
                <div className="p-2 rounded-xl bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400">
                  <ShieldCheck className="w-5 h-5" />
                </div>
                <h4 className="font-bold text-xl text-zinc-900 dark:text-white">
                  Privacy Team
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
                      href="mailto:privacy@mindnamo.com"
                      className="text-blue-600 dark:text-blue-400 hover:underline"
                    >
                      privacy@mindnamo.com
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
