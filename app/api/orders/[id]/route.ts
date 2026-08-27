import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// Захиалгын төлөв засах (PATCH)
export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;

  try {
    const body = await request.json();
    const { status } = body; // "PENDING", "CANCELED", "DELIVERED" гэсэн утгууд ирнэ

    if (!status) {
      return NextResponse.json(
        { error: "status (төлөв) заавал хэрэгтэй" },
        { status: 400 },
      );
    }

    const updatedOrder = await prisma.foodOrder.update({
      where: { id: id },
      data: { status },
    });

    return NextResponse.json(updatedOrder, { status: 200 });
  } catch (error) {
    return NextResponse.json(
      { error: "Захиалгыг шинэчлэхэд алдаа гарлаа" },
      { status: 400 },
    );
  }
}
