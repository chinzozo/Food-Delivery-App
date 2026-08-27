/* eslint-disable @next/next/no-img-element */
"use client";

import { useState } from "react";
import Link from "next/link";
import { loginAction } from "@/app/actions";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [status, setStatus] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setStatus(null);

    const formData = new FormData(e.currentTarget);
    const email = formData.get("email") as string;
    const password = formData.get("password") as string;

    // 1. Email бүтэц шалгах (Regex)
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      setStatus("Invalid email. Use a format like example@email.com.");
      setLoading(false);
      return;
    }

    // 2. Нууц үг хоосон эсэхийг шалгах
    if (!password) {
      setStatus("Please enter your password.");
      setLoading(false);
      return;
    }

    try {
      // 3. Сервер ажиллуулах (Server Action)
      const result = await loginAction(formData);

      if (result?.error) {
        setStatus(`✗ ${result.error}`);
        setLoading(false);
      } else {
        // 🔑 АРГА 1: Серверээс токен ирсэн эсэхийг шалгах
        if (result?.token) {
          // localStorage-д токеноо хадгална
          localStorage.setItem("token", result.token);

          localStorage.setItem("userEmail", email);

          try {
            // Токеныг фронт-энд талд гар аргаар задлах (Decode JWT)
            const base64Url = result.token.split(".")[1];
            const base64 = base64Url.replace(/-/g, "+").replace(/_/g, "/");
            const jsonPayload = decodeURIComponent(
              atob(base64)
                .split("")
                .map(
                  (c) => "%" + ("00" + c.charCodeAt(0).toString(16)).slice(-2),
                )
                .join(""),
            );

            const payload = JSON.parse(jsonPayload);

            // 🎯 Хэрэглэгчийн эрхийг (role) шалгаж зөв замаар нь чиглүүлэх
            if (payload.role === "ADMIN") {
              window.location.href = "/admin"; // Админ бол админ панель руу
            } else {
              window.location.href = "/"; // Энгийн хэрэглэгч бол үндсэн сайт руу
            }
          } catch (decodeError) {
            console.error("Токен уншихад алдаа гарлаа:", decodeError);
            // Хэрэв токен задрахгүй ямар нэг асуудал гарвал хамгаалалт үүднээс үндсэн сайт руу шиднэ
            window.location.href = "/";
          }
        } else {
          // Хэрэв токен күүкигээр (Cookie) цаанаа хадгалагдсан бол шууд үндсэн сайт руу шиднэ
          window.location.href = "/";
        }
      }
    } catch (err) {
      console.error("Нэвтрэх үед алдаа гарлаа:", err);
      setStatus("✗ Системийн алдаа гарлаа. Түр хүлээгээд дахин туршина уу.");
      setLoading(false);
    }
  }

  return (
    <main className="min-h-dvh flex bg-white">
      {/* Зүүн талын Form хэсэг */}
      <div className="flex-1 flex items-center justify-center p-6">
        <form onSubmit={onSubmit} className="w-full max-w-sm space-y-6">
          <div>
            <h1 className="text-[24px] font-semibold text-black">Log in</h1>
            <h2 className="text-[16px] text-zinc-500">
              Log in to enjoy your favorite dishes.
            </h2>
          </div>
          <input
            name="email"
            className={`w-full rounded-md border px-3 py-2 text-sm text-black outline-none ${
              status
                ? "border-red-500"
                : "border-zinc-300 focus:border-zinc-500"
            }`}
            placeholder="Enter your email address"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />

          <input
            name="password"
            className="w-full rounded-md border border-zinc-300 px-3 py-2 text-black text-sm outline-none focus:border-zinc-400"
            placeholder="Password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
          {status && <p className="text-sm text-red-500 mt-1">{status}</p>}

          <Link
            href="/forgot-password"
            className="text-sm text-black hover:underline"
          >
            Forgot password?
          </Link>

          <button
            type="submit"
            disabled={loading || password.length < 8}
            className={`w-full rounded-md px-3 py-2 text-sm font-medium text-white transition-colors duration-200 cursor-pointer ${
              password.length >= 8 ? "bg-black" : "bg-zinc-300"
            } disabled:opacity-50 mt-6`}
          >
            {loading ? "..." : "Let's Go"}
          </button>

          <p className="flex justify-center text-sm text-zinc-500 gap-2">
            Don`t have an account?{" "}
            <Link href="/signup" className="text-blue-500">
              Sign up
            </Link>
          </p>
        </form>
      </div>

      {/* Баруун талын Зураг хэсэг */}
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
