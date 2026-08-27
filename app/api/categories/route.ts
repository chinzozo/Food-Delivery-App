/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextResponse, NextRequest } from "next/server";
import { prisma } from "@/lib/prisma"; // Чиний түрүүний үүсгэсэн файлын зам

// 1. Ангилалуудыг авах (GET)
export async function GET() {
  try {
    const categories = await prisma.foodCategory.findMany({
      include: {
        foods: {
          select: {
            id: true,
            foodName: true,
            price: true,
            image: true,
            ingredients: true, // DB-ээс ingredients-ийг татна
          },
        },
      },
    });

    // Фронт-эндэд тохируулан талбарын нэрийг солих (Mapping)
    const formattedCategories = categories.map((cat: any) => ({
      ...cat,
      foods: cat.foods.map((food: any) => ({
        ...food,
        description: food.ingredients, // ingredients-ийг description болгож явуулна
      })),
    }));

    return NextResponse.json(formattedCategories, { status: 200 });
  } catch (error) {
    return NextResponse.json(
      { error: "Категори татахад алдаа гарлаа" },
      { status: 500 },
    );
  }
}

// 2. Шинэ ангилал нэмэх (POST)
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { categoryName } = body;

    if (!categoryName) {
      return NextResponse.json(
        { error: "Категорийн нэр оруулна уу" },
        { status: 400 },
      );
    }

    console.log("Шинэ категори нэмж байна:", categoryName);

    // Prisma-ийн шинэ бүтэц дээр id нь @default(cuid()) тул бид заавал бичих шаардлагагүй.
    // Prisma автоматаар нано ID үүсгэж өгнө.
    const newCategory = await prisma.foodCategory.create({
      data: {
        categoryName: categoryName,
      },
    });

    return NextResponse.json(newCategory, { status: 201 });
  } catch (error: any) {
    console.error("Категори нэмэхэд алдаа гарлаа:", error);
    return NextResponse.json(
      { error: `Категори үүсгэж чадсангүй: ${error.message}` },
      { status: 500 },
    );
  }
}
