import { NextResponse, NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import jwt from "jsonwebtoken";

export async function GET(request: NextRequest) {
  try {
    // 1. Headers-оос токенийг нь барьж авах
    const authHeader = request.headers.get("Authorization");
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return NextResponse.json(
        { error: "Нэвтрэх токен олдсонгүй" },
        { status: 401 },
      );
    }

    const token = authHeader.split(" ")[1];

    // 2. Токенийг задалж, дотроос нь Хэрэглэгчийн ID-г авах
    const decoded = jwt.verify(token, process.env.JWT_SECRET as string) as {
      userId: string;
      role: string;
    };

    // 3. Зөвхөн энэ хэрэглэгчийн захиалгуудыг датабэйсээс шүүж авах
    const myOrders = await prisma.foodOrder.findMany({
      where: {
        userId: decoded.userId, // Токен дээрх нэртэй тааруулав
      },
      include: {
        items: {
          include: {
            food: true, // Захиалсан хоолнуудын мэдээллийг цуг авна
          },
        },
      },
      orderBy: {
        createdAt: "desc", // Хамгийн сүүлийн захиалга дээрээ харагдана
      },
    });

    return NextResponse.json(myOrders, { status: 200 });
  } catch (error) {
    return NextResponse.json(
      {
        error:
          "Захиалгын түүхийг авахад алдаа гарлаа эсвэл токен хүчингүй байна",
      },
      { status: 401 },
    );
  }
}
