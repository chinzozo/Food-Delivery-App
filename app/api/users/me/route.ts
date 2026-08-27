// app/api/users/me/route.ts
import { NextResponse, NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(request: NextRequest) {
  // 1. Токенгоос userId-г авна
  const authHeader = request.headers.get("Authorization");
  const token = authHeader?.split(" ")[1];

  if (!token)
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  // Токен задлах (Middleware-ийн аргаар)
  const payload = JSON.parse(atob(token.split(".")[1]));

  // 2. Зөвхөн өөрийн имэйлээ DB-ээс татаж авах
  const user = await prisma.user.findUnique({
    where: { id: payload.id },
    select: { email: true }, // Зөвхөн имэйлийг л авна
  });

  return NextResponse.json(user);
}
