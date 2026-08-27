import { NextResponse, NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";

// 1. Бүх захиалгуудыг харах (GET) - Админы панелд хэрэг болно
export async function GET() {
  try {
    const orders = await prisma.foodOrder.findMany({
      include: {
        buyer: {
          select: { id: true, email: true, phoneNumber: true, address: true },
        },
        items: {
          include: {
            food: true, // Захиалсан хоолны дэлгэрэнгүй мэдээллийг цуг авна
          },
        },
      },
      orderBy: {
        createdAt: "desc", // Хамгийн сүүлийн захиалгыг дээр нь харуулна
      },
    });
    return NextResponse.json(orders, { status: 200 });
  } catch (error) {
    return NextResponse.json(
      { error: "Захиалгуудыг уншихад алдаа гарлаа" },
      { status: 500 },
    );
  }
}

// 2. Шинэ захиалга үүсгэх (POST) - Хэрэглэгч захиалга хийхэд
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { userId, totalPrice, items, address } = body;
    // items нь ийм бүтэцтэй байна: [{ foodId: "uuid-1", quantity: 2 }, { foodId: "uuid-2", quantity: 1 }]

    if (!userId || !totalPrice || !items || items.length === 0) {
      return NextResponse.json(
        { error: "userId, totalPrice, болон items (хоолнууд) заавал хэрэгтэй" },
        { status: 400 },
      );
    }

    // Prisma-гийн Nested Write ашиглан Order болон OrderItem-ийг цуг үүсгэх
    const newOrder = await prisma.foodOrder.create({
      data: {
        userId,
        totalPrice: Number(totalPrice),
        address: address,
        status: "PENDING", // Анх үүсэхдээ хүлээгдэж буй төлөвтэй байна
        items: {
          create: items.map((item: { foodId: string; quantity: number }) => ({
            foodId: item.foodId,
            quantity: Number(item.quantity),
          })),
        },
      },
      include: {
        items: {
          include: {
            food: true, // Хоолны нэр, зураг зэргийг хариунд цуг авч "Unknown" алдааг засна
          },
        },
      },
    });

    return NextResponse.json(newOrder, { status: 201 });
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { error: "Захиалга үүсгэхэд алдаа гарлаа" },
      { status: 500 },
    );
  }
}

// 3. Захиалгын төлөв шинэчлэх (PATCH) - Админ төлөв солиход
export async function PATCH(request: NextRequest) {
  try {
    const body = await request.json();
    const { id, status } = body;

    if (!id || !status) {
      return NextResponse.json(
        { error: "ID болон Status заавал хэрэгтэй" },
        { status: 400 },
      );
    }

    const updatedOrder = await prisma.foodOrder.update({
      where: { id },
      data: { status },
    });

    return NextResponse.json(updatedOrder, { status: 200 });
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { error: "Төлөв шинэчлэхэд алдаа гарлаа" },
      { status: 500 },
    );
  }
}
