/* eslint-disable @typescript-eslint/no-explicit-any */
"use server";


import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";
import { Resend } from "resend";
import jwt from "jsonwebtoken";
import { cookies, headers } from "next/headers";

const apiKey = process.env.RESEND_API_KEY || process.env.NEXT_PUBLIC_RESEND_API_KEY;

// Log the key format to your terminal (masks most characters for security)
console.log("=== DEBUG RESEND KEY ===", apiKey ? `${apiKey.slice(0, 5)}... (Length: ${apiKey.length})` : "UNDEFINED");

const resend = new Resend(apiKey);




const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const passwordRegex =
  /^(?=.*[A-Z])(?=.*[a-z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;

const JWT_SECRET = process.env.JWT_SECRET || "super-secret-key-123";

export async function loginAction(formData: FormData) {
  try {
    const email = formData.get("email")?.toString().toLowerCase().trim() || "";
    const password = formData.get("password")?.toString() || "";

    if (!email || !password) {
      return { error: "Enter your email and password." };
    }

    const user = await prisma.user.findUnique({ where: { email } });

    if (!user) {
      return { error: "Invalid email or password." };
    }

    const isMatch = await bcrypt.compare(password, user.password || "");

    if (!isMatch) {
      return { error: "Incorrect password. Please try again." };
    }

    const userRole =
      (user as any).role ||
      (email === "chinz@gmail.com" ? "ADMIN" : "USER");

    const token = jwt.sign({ id: user.id, role: userRole }, JWT_SECRET, {
      expiresIn: "1d",
    });

    const cookieStore = await cookies();
    cookieStore.set("token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      path: "/",
      maxAge: 60 * 60 * 24,
    });

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
  const email = formData.get("email")?.toString().toLowerCase().trim() || "";
  const password = formData.get("password")?.toString() || "";
  const confirm = formData.get("confirm")?.toString() || "";

  if (!email || !password || !confirm) {
    return { error: "Fill in all fields." };
  }

  if (!emailRegex.test(email)) {
    return { error: "Invalid email. Use a format like example@email.com" };
  }

  if (password !== confirm) {
    return { error: "Those passwords didn’t match. Try again." };
  }

  if (!passwordRegex.test(password)) {
    return {
      error:
        "Password must be at least 8 characters, include a number, capital letter, and a symbol.",
    };
  }

  try {
    const headersList = await headers();
    const host = headersList.get("host");
    const protocol = process.env.NODE_ENV === "production" ? "https" : "http";
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || `${protocol}://${host}`;

    const existingUser = await prisma.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      return { error: "Энэ имэйл хаяг аль хэдийн бүртгэгдсэн байна." };
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    await prisma.user.create({
      data: {
        email,
        password: hashedPassword,
        phoneNumber: "",
        address: "",
        role: "USER",
      },
    });

    const { error: sendError } = await resend.emails.send({
      from: "onboarding@resend.dev",
      to: email,
      subject: "Verify your email",
      html: `<p>Click <a href="${baseUrl}/verify?email=${encodeURIComponent(email)}">here</a> to verify your account</p>`,
    });

    if (sendError) {
      console.error("=== RESEND REGISTER ERROR ===", sendError);
      return { error: sendError.message };
    }

    return { success: true };
  } catch (error: any) {
    console.error("Registration error:", error);
    return { error: "Something went wrong, please try again." };
  }
}

export async function sendResetLinkAction(formData: FormData) {
  const email = formData.get("email")?.toString().toLowerCase().trim() || "";

  if (!emailRegex.test(email)) {
    return { error: "Invalid email. Use a format like example@email.com" };
  }

  try {
    const headersList = await headers();
    const host = headersList.get("host");
    const protocol = process.env.NODE_ENV === "production" ? "https" : "http";
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || `${protocol}://${host}`;

    const user = await prisma.user.findUnique({
      where: { email },
    });

    if (!user) {
      return { error: "User not found." };
    }

    const { error: sendError } = await resend.emails.send({
      from: "onboarding@resend.dev",
      to: email,
      subject: "Reset your password",
      html: `
        <h1>Reset your password</h1>
        <p>You requested a password reset. Click the link below to continue:</p>
        <a href="${baseUrl}/reset-password?email=${encodeURIComponent(email)}">Reset Password</a>
        <p>If you didn't request this, please ignore this email.</p>
      `,
    });

    if (sendError) {
      console.error("=== RESEND RESET ERROR ===", sendError);
      return { error: sendError.message };
    }

    return { success: true };
  } catch (error: any) {
    console.error("=== PASSWORD RESET SERVER ERROR ===", error);
    return { error: "Failed to send reset link. Please try again." };
  }
}

export async function updatePasswordAction(formData: FormData) {
  const email = formData.get("email")?.toString().toLowerCase().trim() || "";
  const password = formData.get("password")?.toString() || "";

  if (!email) {
    return { error: "Missing email address." };
  }

  if (!passwordRegex.test(password)) {
    return {
      error:
        "Password must be at least 8 characters, include a number, capital letter, and a symbol.",
    };
  }

  try {
    const user = await prisma.user.findUnique({ where: { email } });

    if (!user) {
      return { error: "User does not exist." };
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    await prisma.user.update({
      where: { email },
      data: { password: hashedPassword },
    });

    return { success: true };
  } catch (error: any) {
    console.error("Update password error:", error);
    return { error: "Failed to update password." };
  }
}