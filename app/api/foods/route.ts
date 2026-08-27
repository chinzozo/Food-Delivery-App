/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextResponse, NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";

// 1. Бүх хоолнуудыг авах (GET)
export async function GET() {
  try {
    const foods = await prisma.food.findMany({
      include: {
        foodCategory: true, // Шинэ скима дээрх relation нэр
      },
    });
    return NextResponse.json(foods, { status: 200 });
  } catch (error) {
    console.error("GET ERROR:", error);
    return NextResponse.json(
      { error: "Хоолны мэдээллийг уншихад алдаа гарлаа" },
      { status: 500 },
    );
  }
}

// 2. Шинэ хоол үүсгэх (POST)
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    console.log("=== БЭКЭНДЭД ИРСЭН ДАТА ===", body);

    const {
      foodName,
      price,
      image,
      description,
      ingredients,
      category,
      categoryId,
    } = body;

    // Фронтоос ирж болох бүх хувилбарын ID-г шалгаж авах
    let finalCategoryId = categoryId || category;

    // 🔑 Алхам 1: Ирсэн ID нь датабэйс дээр байна уу гэдгийг жинхэнэ утгаар нь шалгана
    let dbCategory = null;
    if (
      finalCategoryId &&
      finalCategoryId !== "default" &&
      finalCategoryId !== "All" &&
      finalCategoryId.trim() !== ""
    ) {
      dbCategory = await prisma.foodCategory.findUnique({
        where: { id: finalCategoryId },
      });
    }

    // 🔑 Алхам 2: Хэрэв фронтоос буруу эсвэл хоосон ID ирвэл датабэйсний хамгийн эхний категорийг олно
    if (!dbCategory) {
      console.log(
        "⚠️ Жинхэнэ категори олдсонгүй, эхний категорийг хайж байна...",
      );
      dbCategory = await prisma.foodCategory.findFirst();
    }

    // 🔑 Алхам 3: Хэрэв датабэйс ТАГ ХООСОН (Prisma Studio дээр юу ч байхгүй) байвал энд шууд өөрөө үүсгэнэ!
    if (!dbCategory) {
      console.log(
        "🚀 Датабэйс хоосон тул шинээр 'Үндсэн Категори' үүсгэж байна...",
      );
      dbCategory = await prisma.foodCategory.create({
        data: {
          categoryName: "Үндсэн Категори",
          // id-г энд гараар өгөх шаардлагагүй, скима дээрх cuid() өөрөө автоматаар үүсгэнэ!
        },
      });
    }

    // Олдсон эсвэл шинээр үүссэн баталгаатай категорийн ID-г онооно
    finalCategoryId = dbCategory.id;

    // Бусад датаг цэвэрлэх
    const finalPrice = price && Number(price) > 0 ? Number(price) : 12.5;
    const finalFoodName = foodName ? foodName.trim() : "Шинэ хоол";
    const foodIngredients = ingredients || description || "Амттай орц найрлага";

    // 🔑 Алхам 4: Хоолыг шинэ скима бүтцийн дагуу хадгалах
    const newFood = await prisma.food.create({
      data: {
        foodName: finalFoodName,
        price: finalPrice,
        image:
          image || "https://images.unsplash.com/photo-1546069901-ba9599a7e63c", // Хэрэв зураггүй бол default зураг
        ingredients: foodIngredients,
        foodCategoryId: finalCategoryId, // Төгс холболт
      },
    });

    return NextResponse.json(newFood, { status: 201 });
  } catch (error: any) {
    console.error("=== ХООЛ ҮҮСГЭХЭД ГАРСАН ЭЦСИЙН АЛДАА ===", error);
    return NextResponse.json(
      { error: `Хоол үүсгэж чадсангүй: ${error?.message || "Дотоод алдаа"}` },
      { status: 500 },
    );
  }
}
