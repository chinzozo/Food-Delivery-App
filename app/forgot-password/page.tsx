"use client";

import { useState } from "react";
import Link from "next/link";
import { sendResetLinkAction } from "@/app/actions";

export default function ForgotPasswordPage() {
  const [step, setStep] = useState<"form" | "verify">("form");
  const [loading, setLoading] = useState(false);
  const [emailInput, setEmailInput] = useState("");
  const [error, setError] = useState<string | null>(null);

  async function handleSend(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setError(null);

    // Manually construct FormData to guarantee the email value is sent
    const formData = new FormData();
    formData.append("email", emailInput.trim());

    // Call Server Action
    const res = await sendResetLinkAction(formData);

    if (res?.error) {
      setError(res.error);
      setLoading(false);
    } else {
      setStep("verify");
      setLoading(false);
    }
  }

  const handleBackToForm = () => {
    setError(null); // Clear errors when resetting
    setStep("form");
  };

  return (
    <main className="min-h-dvh flex bg-white">
      <div className="flex-1 flex items-center justify-center p-6">
        {step === "form" ? (
          <form onSubmit={handleSend} className="w-full max-w-sm space-y-6">
            <div>
              <h1 className="text-[24px] font-semibold text-black">
                Reset your password
              </h1>
              <h2 className="text-[16px] text-zinc-500">
                Enter your email to receive a password reset link.
              </h2>
            </div>

            <input
              name="email"
              type="email"
              required
              value={emailInput}
              onChange={(e) => setEmailInput(e.target.value)}
              className="w-full rounded-md border border-zinc-300 px-3 py-2 text-sm text-black outline-none focus:border-zinc-500"
              placeholder="example@email.com"
            />

            {error && <p className="text-sm text-red-500">{error}</p>}

            <button
              type="submit"
              disabled={loading}
              className="w-full rounded-md bg-black px-3 py-2 text-sm font-medium text-white hover:bg-zinc-800 transition disabled:opacity-50"
            >
              {loading ? "Sending..." : "Send link"}
            </button>

            <p className="flex justify-center text-sm text-zinc-500 gap-2">
              Don&apos;t have an account?{" "}
              <Link href="/signup" className="text-blue-500 hover:underline">
                Sign up
              </Link>
            </p>
          </form>
        ) : (
          <div className="w-full max-w-sm space-y-6">
            <h1 className="text-[24px] font-semibold text-black">
              Please verify your email
            </h1>
            <p className="text-zinc-500">
              We just sent an email to{" "}
              <span className="font-semibold text-black">{emailInput}</span>.{" "}
              Click the link in the email to verify your account.
            </p>
            <button
              type="button"
              onClick={handleBackToForm}
              className="w-full rounded-md border border-zinc-300 px-3 py-2 text-sm font-medium text-black hover:bg-zinc-100 transition"
            >
              Back to form
            </button>
          </div>
        )}
      </div>

      <div className="hidden lg:block w-1/2 relative m-6">
        <img
          src="/main.png"
          alt="Delivery"
          className="absolute inset-0 w-full h-full object-cover rounded-2xl"
        />
      </div>
    </main>
  );
}