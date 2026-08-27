import { NextResponse, NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email, password } = body;

    // 1. И-мэйл болон нууц үг ирсэн эсэхийг шалгах
    if (!email || !password) {
      return NextResponse.json({ error: "И-мэйл болон нууц үгээ оруулна уу" }, { status: 400 });
    }

    // 2. Тухайн и-мэйлтэй хэрэглэгч датабэйст байгаа эсэхийг хайх
    const user = await prisma.user.findUnique({
      where: { email },
    });

    if (!user) {
      return NextResponse.json({ error: "И-мэйл эсвэл нууц үг буруу байна" }, { status: 401 });
    }

    // 3. Нууц үг таарч байгаа эсэхийг шалгах (хэшлэсэн нууц үгтэй харьцуулна)
    const isPasswordValid = await bcrypt.compare(password, user.password);

    if (!isPasswordValid) {
      return NextResponse.json({ error: "И-мэйл эсвэл нууц үг буруу байна" }, { status: 401 });
    }

    // 4. JWT Токен үүсгэх (Дотор нь хэрэглэгчийн ID болон Ролийг нь шингээнэ)
    const token = jwt.sign(
      { userId: user.id, role: user.role },
      process.env.JWT_SECRET as string,
      { expiresIn: "7d" } // Токен 7 хоногийн дараа хүчингүй болно
    );

    // 5. Нууц үгийг хасаж, хэрэглэгчийн мэдээллийг токентой нь буцаах
    const { password: _, ...userWithoutPassword } = user;

    return NextResponse.json({
      message: "Амжилттай нэвтэрлээ",
      token,
      user: userWithoutPassword
    }, { status: 200 });

  } catch (error) {
    return NextResponse.json({ error: "Нэвтрэх явцад алдаа гарлаа" }, { status: 500 });
  }
}