/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// 1. Тухайн категорийг устгах (DELETE)
export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;

  try {
    await prisma.foodCategory.delete({
      where: { id: id },
    });

    return NextResponse.json(
      { message: "Категори амжилттай устгагдлаа" },
      { status: 200 },
    );
  } catch (error: any) {
    console.error("DELETE ERROR:", error);
    return NextResponse.json(
      {
        error: "Алдаа гарлаа",
        details: error.message, // Энд алдааны жинхэнэ мессеж ирэх болно
        code: error.code, // Prisma алдааны код
      },
      { status: 500 },
    );
  }
}

// 2. Категорийн нэрийг шинэчлэх (PATCH)
export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;

  try {
    const body = await request.json();
    const { categoryName } = body;

    if (!categoryName) {
      return NextResponse.json(
        { error: "Категорийн нэр заавал хэрэгтэй" },
        { status: 400 },
      );
    }

    const updatedCategory = await prisma.foodCategory.update({
      where: { id: id },
      data: { categoryName },
    });

    return NextResponse.json(updatedCategory, { status: 200 });
  } catch (error) {
    return NextResponse.json(
      { error: "Категори шинэчлэхэд алдаа гарлаа" },
      { status: 400 },
    );
  }
}
