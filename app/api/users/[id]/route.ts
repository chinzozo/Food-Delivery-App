import { NextResponse, NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";

// 1. Хэрэглэгчийг устгах (DELETE)
export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;

  try {
    await prisma.user.delete({
      where: { id: id },
    });

    return NextResponse.json(
      { message: "Хэрэглэгчийг амжилттай устгалаа" },
      { status: 200 },
    );
  } catch (error) {
    return NextResponse.json(
      { error: "Хэрэглэгч олдсонгүй эсвэл устгаж чадсангүй" },
      { status: 404 },
    );
  }
}

// 2. Хэрэглэгчийн мэдээллийг шинэчлэх (PUT) - Сонголттой нэмж болно
export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;

  try {
    const body = await request.json();

    // Хэрэглэгчийн явуулсан датаг шууд Prisma-гийн update рүү дамжуулна.
    // Prisma нь зөвхөн body дотор ирсэн (зангидсан) талбаруудыг л шинэчилж,
    // ирээгүй талбаруудыг хэвээр нь үлдээдэг давуу талтай.
    const updatedUser = await prisma.user.update({
      where: { id: id },
      data: {
        email: body.email,
        phoneNumber: body.phoneNumber,
        address: body.address,
        // Хэрэв нууц үг сольж байгаа бол энд bcrypt.hash хийж оруулж болно
      },
      select: {
        id: true,
        email: true,
        phoneNumber: true,
        address: true,
        role: true,
      },
    });

    return NextResponse.json(updatedUser, { status: 200 });
  } catch (error) {
    return NextResponse.json(
      { error: "Хэрэглэгчийн мэдээллийг шинэчлэхэд алдаа гарлаа" },
      { status: 400 },
    );
  }
}
