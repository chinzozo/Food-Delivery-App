"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { registerAction } from "@/app/actions";

export default function RegisterPage() {
  const router = useRouter();
  const [step, setStep] = useState(1); // 1: Email, 2: Password
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState<string | null>(null);
  const [show, setShow] = useState(false);
  // input-ийн type-ыг {show ? "text" : "password"} болгоно.

  async function handleNextStep(formData: FormData) {
    const emailInput = formData.get("email") as string;

    // Энд и-мэйл шалгах логик (Regex)
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(emailInput)) {
      setStatus("Invalid email. Use a format like example@email.com");
      return;
    }

    setEmail(emailInput);
    setStep(2); // Дараагийн алхам руу шилжих
    setStatus(null);
  }
  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setStatus(null);

    const formData = new FormData(e.currentTarget);
    const password = formData.get("password") as string;
    const confirm = formData.get("confirm") as string;

    // 1. Password хоорондоо таарч байгаа эсэхийг шалгах
    if (password !== confirm) {
      setStatus("Those password did’t match, Try again");
      setLoading(false);
      return;
    }

    // 2. Password хүчтэй эсэхийг (Regex) шалгах
    const passwordRegex =
      /^(?=.*[A-Z])(?=.*[a-z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
    if (!passwordRegex.test(password)) {
      setStatus("Weak password. Use numbers and symbols.");
      setLoading(false);
      return;
    }

    // 3. Бүх юм зүгээр бол server action-аа дуудна
    const res = await registerAction(formData);

    if (res?.error) {
      setStatus(`✗ ${res.error}`);
      setLoading(false);
      return;
    }

    if (res?.success) {
      router.push("/login");
    }
    setLoading(false);
  }

  return (
    <main className="min-h-dvh flex bg-white">
      <div className="flex-1 flex items-center justify-center p-6">
        {step === 1 ? (
          <form
            onSubmit={(e) => {
              e.preventDefault();
              const formData = new FormData(e.currentTarget);
              handleNextStep(formData);
            }}
            className="w-full max-w-sm space-y-6"
          >
            <div>
              <h1 className="text-[24px] font-semibold text-black ">
                Create your account
              </h1>
              <h2 className="text-[16px] text-zinc-500">
                Sign up to explore your favorite dishes.
              </h2>
            </div>
            <div className="space-y-2">
              <input
                name="email"
                className={`w-full rounded-md border px-3 py-2 text-black text-sm outline-none ${
                  status
                    ? "border-red-300"
                    : "border-zinc-300 focus:border-zinc-500"
                }`}
                placeholder="Enter your email address"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />

              {status && (
                <p className="text-[14px] whitespace-pre-wrap text-red-400">
                  {status}
                </p>
              )}
            </div>
            <button
              type="submit"
              disabled={loading}
              className={`w-full rounded-md px-3 py-2 text-sm font-medium text-white transition-colors duration-200 ${
                email.length > 10 ? "bg-black" : "bg-zinc-300"
              } disabled:opacity-50`}
            >
              {loading ? "..." : "Let's Go"}
            </button>

            <p className=" flex justify-center text-sm text-zinc-500 gap-2">
              Already have an account?{" "}
              <Link href="/login" className="text-blue-500">
                Log in
              </Link>
            </p>
          </form>
        ) : (
          <form onSubmit={onSubmit} className="w-full max-w-sm space-y-6">
            <div>
              <h1 className="text-[24px] font-semibold text-black">
                Create a strong password
              </h1>
              <h2 className="text-[16px] text-zinc-500">
                Create a strong password with letters, numbers.
              </h2>
            </div>

            <div className="space-y-4">
              {/* ЭНД ЭНЭ INPUT-ИЙГ ЗААВАЛ НЭМЭХ ХЭРЭГТЭЙ */}
              <input type="hidden" name="email" value={email} />

              <input
                name="password"
                type={show ? "text" : "password"} // show state-ээ ашиглана
                className="w-full rounded-md border border-zinc-300 px-3 py-2 text-black text-sm outline-none"
                placeholder="Password"
                required
              />
              <input
                name="confirm"
                type={show ? "text" : "password"}
                className="w-full rounded-md border border-zinc-300 px-3 py-2 text-black text-sm outline-none"
                placeholder="Confirm"
                required
              />
              {status && <p className="text-[14px] text-red-400">{status}</p>}

              <label className="flex items-center gap-2 text-sm text-zinc-600">
                <input
                  type="checkbox"
                  onChange={(e) => setShow(e.target.checked)}
                />
                Show password
              </label>
            </div>

            <button
              type="submit"
              disabled={loading}
              className={`w-full rounded-md px-3 py-2 text-sm font-medium text-white transition-colors duration-200 ${
                email.length > 10 ? "bg-black" : "bg-zinc-300"
              } disabled:opacity-50`}
            >
              {loading ? "..." : "Let's Go"}
            </button>
            <p className=" flex justify-center text-sm text-zinc-500 gap-2">
              Already have an account?{" "}
              <Link href="/login" className="text-blue-500">
                Log in
              </Link>
            </p>
          </form>
        )}
      </div>

      <div className="hidden lg:block w-1/2 relative m-6 ">
        <img
          src="/main.png"
          alt="Delivery"
          className="absolute inset-0 w-full h-full object-cover rounded-2xl"
        />
      </div>
    </main>
  );
}
