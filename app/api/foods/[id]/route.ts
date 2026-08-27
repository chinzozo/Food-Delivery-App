/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextResponse, NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";

// 1. Хоолыг устгах (DELETE)
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;

  try {
    // Устгахаас өмнө хамааралтай (relation) өгөгдлүүд байгаа эсэхийг шалгах шаардлагагүй,
    // учир нь бид скима дээр 'onDelete: Cascade' тохируулсан тул автоматаар устгана.
    await prisma.food.delete({
      where: { id: id },
    });

    return NextResponse.json(
      { message: "Хоол амжилттай устлаа" },
      { status: 200 },
    );
  } catch (error: any) {
    console.error("DELETE ERROR:", error);
    return NextResponse.json(
      { error: "Хоол олдсонгүй эсвэл устгах явцад алдаа гарлаа" },
      { status: 404 },
    );
  }
}

// 2. Хоолны мэдээлэл засах (PATCH)
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;

  try {
    const body = await request.json();
    const { foodName, price, image, ingredients, categoryId } = body;

    // Шинэ скима дээр 'category' гэдэг талбар байхгүй, 'foodCategoryId' байна.
    // Хэрэв фронтоос шинэ категорийн ID ирвэл түүнийг нь шинэчилнэ.
    const updatedFood = await prisma.food.update({
      where: { id: id },
      data: {
        foodName: foodName,
        price: price ? Number(price) : undefined,
        image: image,
        ingredients: ingredients,
        // Категорийн холболтыг шинэчлэхдээ foodCategoryId-г ашиглана
        foodCategoryId: categoryId ? categoryId : undefined,
      },
    });

    return NextResponse.json(updatedFood, { status: 200 });
  } catch (error: any) {
    console.error("PATCH ERROR:", error);
    return NextResponse.json(
      { error: "Хоолны мэдээллийг шинэчлэхэд алдаа гарлаа: " + error.message },
      { status: 400 },
    );
  }
}
