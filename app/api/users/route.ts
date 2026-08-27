/* eslint-disable @typescript-eslint/no-explicit-any */
import { Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs"; // bun add bcryptjs болон bun add -d @types/bcryptjs хийгээрэй

// 1. Бүх хэрэглэгчдийг авах (GET)
export async function GET() {
  try {
    const users = await prisma.user.findMany({
      select: {
        id: true,
        email: true,
        phoneNumber: true,
        address: true,
        role: true,
        isVerified: true,
        createdAt: true,
        // password: false -> Нууц үгийг хасаж авч байна
      },
    });
    return NextResponse.json(users, { status: 200 });
  } catch (error) {
    return NextResponse.json(
      { error: "Хэрэглэгчдийн мэдээллийг авахад алдаа гарлаа" },
      { status: 500 },
    );
  }
}

// 2. Шинэ хэрэглэгч бүртгэх (POST)
export async function POST(req: NextRequest) {
  try {
    const data: Prisma.UserCreateInput = await req.json();

    // Заавал байх ёстой талбаруудыг шалгах (Validation)
    if (!data.email || !data.password) {
      return NextResponse.json(
        { error: "Мэдээлэл дутуу байна. (email, password)" },
        { status: 400 },
      );
    }

    // Нууц үгийг hash хийж нууцлах
    const hashedPassword = await bcrypt.hash(data.password, 10);

    const newUser = await prisma.user.create({
      data: {
        ...data,
        password: hashedPassword, // Нууц үгийг сольж хадгална
      },
    });

    // Буцааж хариу өгөхдөө нууц үгийг нь хасаж явуулах
    const { password, ...userWithoutPassword } = newUser;

    return NextResponse.json(userWithoutPassword, { status: 201 });
  } catch (error: any) {
    // Хэрэв ижилхэн email-тэй хэрэглэгч бүртгүүлэх гэвэл (Unique constraint error)
    if (error.code === "P2002") {
      return NextResponse.json(
        { error: "Энэ и-мэйл хаяг аль хэдийн бүртгэгдсэн байна" },
        { status: 400 },
      );
    }

    return NextResponse.json(
      { error: "Хэрэглэгч үүсгэхэд алдаа гарлаа" },
      { status: 500 },
    );
  }
}
