/* eslint-disable @typescript-eslint/no-explicit-any */
"use server";

import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";
import { Resend } from "resend";
import jwt from "jsonwebtoken"; // 🔑 Токен үүсгэхэд хэрэгтэй сан
import { cookies, headers } from "next/headers"; // 🔑 Күүки болон Header ашиглах

const resend = new Resend(process.env.NEXT_PUBLIC_RESEND_API_KEY);

const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const passwordRegex =
  /^(?=.*[A-Z])(?=.*[a-z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;

// 🔐 JWT Нууц үг (Продюшн дээр .env-ээс уншина, байхгүй бол түр ашиглах утга)
const JWT_SECRET = process.env.JWT_SECRET || "super-secret-key-123";

export async function loginAction(formData: FormData) {
  try {
    const email = formData.get("email") as string;
    const password = formData.get("password") as string;

    if (!email || !password) {
      return { error: "Enter your email and password." };
    }

    const user = await prisma.user.findUnique({ where: { email } });

    if (!user) {
      return { error: "Invalid email. Use a format like example@email.com." };
    }

    const isMatch = await bcrypt.compare(password, user.password || "");

    if (!isMatch) {
      return { error: "Incorrect password. Please try again." };
    }

    // 🔑 1. УХААЛАГ ШАЛГАЛТ: Хэрэв чиний нэвтэрсэн имэйл чинь Prisma Studio дээр сольсон админ имэйл мөн бол
    // Эсвэл датабэйс дээрээс role-ийг нь уншиж чадвал ADMIN эрх өгнө.
    // (Жишээ нь: Чиний админ имэйл 'admin@email.com' бол доорхийг өөрийнхөөрөө солиорой)
    const userRole =
      (user as any).role ||
      (email === "btsolmon.mn@gmail.com" ? "ADMIN" : "USER");

    // 🔑 2. Одоо userRole-ийг токен руу шингээнэ
    const token = jwt.sign({ id: user.id, role: userRole }, JWT_SECRET, {
      expiresIn: "1d",
    });

    // 🔑 3. Токенийг Күүки (Cookie) рүү хадгалах
    const cookieStore = await cookies();
    cookieStore.set("token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      path: "/",
      maxAge: 60 * 60 * 24,
    });

    // 🔑 4. Фронт-энд рүү зөв ролийг буцаах
    return {
      success: true,
      token: token,
      role: userRole,
      address: user.address,
    };
  } catch (error) {
    console.error("Login Server Action Error:", error);
    return { error: "Internal server error occurred." };
  }
}

export async function registerAction(formData: FormData) {
  const email = formData.get("email")?.toString() || "";
  const password = formData.get("password")?.toString() || "";
  const confirm = formData.get("confirm")?.toString() || "";

  // Тухайн үед ажиллаж байгаа домэйн хаягийг (host) авах
  const host = (await headers()).get("host");
  const protocol = process.env.NODE_ENV === "production" ? "https" : "http";
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || `${protocol}://${host}`;

  // 1. Validation
  if (!email || !password || !confirm) {
    return { error: "Fill in all fields." };
  }

  if (!emailRegex.test(email)) {
    return { error: "Invalid email. Use a format like example@email.com" };
  }

  if (password !== confirm) {
    return { error: "Those password did’t match, Try again" };
  }

  if (!passwordRegex.test(password)) {
    return {
      error:
        "Password must be at least 8 characters, include a number, capital letter, and a symbol.",
    };
  }

  // 2. Хэрэглэгч бүртгэгдсэн эсэхийг шалгах
  const existingUser = await prisma.user.findUnique({
    where: { email },
  });

  if (existingUser) {
    return { error: "Энэ имэйл хаяг аль хэдийн бүртгэгдсэн байна." };
  }

  // 3. Нууц үгийг hash хийх
  const hashedPassword = await bcrypt.hash(password, 10);

  // 4. Шинэ хэрэглэгч үүсгэх
  try {
    await prisma.user.create({
      data: {
        email,
        password: hashedPassword,
        phoneNumber: "",
        address: "",
        role: "USER", // Анх бүртгүүлэхэд энгийн USER эрхтэй үүснэ
      },
    });

    // 5. ИМЭЙЛ ИЛГЭЭХ
    await resend.emails.send({
      from: "onboarding@resend.dev",
      to: email,
      subject: "Verify your email",
      html: `<p>Click <a href="${baseUrl}/verify?email=${email}">here</a> to verify your account</p>`,
    });
  } catch (error) {
    console.error("Registration error:", error);
    return { error: "Something went wrong, please try again." };
  }

  return { success: true };
}

export async function sendResetLinkAction(formData: FormData) {
  const email = formData.get("email")?.toString().toLowerCase().trim() || "";

  // Тухайн үед ажиллаж байгаа домэйн хаягийг (host) авах
  const host = (await headers()).get("host");
  const protocol = process.env.NODE_ENV === "production" ? "https" : "http";
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || `${protocol}://${host}`;

  if (!emailRegex.test(email)) {
    return { error: "Invalid email. Use a format like example@email.com" };
  }

  try {
    const user = await prisma.user.findUnique({
      where: { email },
    });

    if (!user) {
      return { error: "User not found." };
    }

    await resend.emails.send({
      from: "onboarding@resend.dev",
      to: email,
      subject: "Reset your password",
      html: `
        <h1>Reset your password</h1>
        <p>You requested a password reset. Click the link below to continue:</p>
        <a href="${baseUrl}/reset-password?email=${email}">Reset Password</a>
        <p>If you didn't request this, please ignore this email.</p>
      `,
    });

    return { success: true };
  } catch (error) {
    console.error("Password reset error:", error);
    return { error: "Failed to send reset link. Please try again." };
  }
}

export async function updatePasswordAction(formData: FormData) {
  const email = formData.get("email") as string;
  const password = formData.get("password") as string;

  if (!passwordRegex.test(password)) {
    return {
      error:
        "Password must be at least 8 characters, include a number, capital letter, and a symbol.",
    };
  }

  const hashedPassword = await bcrypt.hash(password, 10);

  try {
    await prisma.user.update({
      where: { email },
      data: { password: hashedPassword },
    });
    return { success: true };
  } catch (error) {
    return { error: "Failed to update password." };
  }
}
