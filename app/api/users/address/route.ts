import { NextResponse, NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(request: NextRequest) {
  const authHeader = request.headers.get("Authorization");
  const token = authHeader?.split(" ")[1];

  if (!token)
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  // Токен задлах (Middleware-ээсээ хуулж аваарай)
  const payload = JSON.parse(atob(token.split(".")[1]));
  const userId = payload.id; // Token дотор 'id' байна гэж үзлээ

  const { address } = await request.json();

  try {
    await prisma.user.update({
      where: { id: userId },
      data: { address },
    });
    return NextResponse.json({ message: "Хаяг амжилттай хадгалагдлаа" });
  } catch (error) {
    return NextResponse.json({ error: "Database алдаа" }, { status: 500 });
  }
}
