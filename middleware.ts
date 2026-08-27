import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // 🔑 1. ЗУРАГ ХУУЛАХ API-ИЙГ ХАМГААЛАЛТААС ШУУД ЧӨЛӨӨЛӨХ (BYPASS)
  // Үүнийг хамгийн дээр нь тавьснаар доор байгаа токен шалгах логик руу орохгүй шууд нэвтрүүлнэ.
  if (pathname.startsWith("/api/upload")) {
    return NextResponse.next();
  }

  // 2. Хэрэв админ эрх шаардлагатай замууд бол:
  // Хоол нэмэх/устгах (POST, PATCH, DELETE /api/foods эсвэл /api/categories)
  const isApiAction =
    pathname.startsWith("/api/foods") || pathname.startsWith("/api/categories");
  const isModifyAction = request.method !== "GET"; // GET-ээс бусад нь засах үйлдэл

  if (isApiAction && isModifyAction) {
    const authHeader = request.headers.get("Authorization");

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return NextResponse.json(
        { error: "Нэвтрэх токен олдсонгүй" },
        { status: 401 },
      );
    }

    const token = authHeader.split(" ")[1];

    try {
      // Токенийг уншиж шалгах
      const base64Url = token.split(".")[1];
      const base64 = base64Url.replace(/-/g, "+").replace(/_/g, "/");
      const jsonPayload = decodeURIComponent(
        atob(base64)
          .split("")
          .map((c) => "%" + ("00" + c.charCodeAt(0).toString(16)).slice(-2))
          .join(""),
      );

      const payload = JSON.parse(jsonPayload);

      // Хэрэв АДМИН биш бол хоол нэмэх, засах эрх өгөхгүй
      // if (payload.role !== "ADMIN") {
      //   return NextResponse.json(
      //     { error: "Танд энэ үйлдлийг хийх админ эрх байхгүй байна" },
      //     { status: 403 },
      //   );
      // }
    } catch (error) {
      return NextResponse.json(
        { error: "Хүчингүй токен байна" },
        { status: 401 },
      );
    }
  }

  // 3. Захиалга үүсгэх эсвэл харах үед (Заавал нэвтэрсэн байх ёстой)
  if (pathname.startsWith("/api/orders") || pathname === "/api/users/address") {
    const authHeader = request.headers.get("Authorization");

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return NextResponse.json(
        { error: "Захиалга хийхийн тулд заавал нэвтэрнэ үү" },
        { status: 401 },
      );
    }
  }

  return NextResponse.next();
}

// Middleware-ийг яг аль замууд дээр ажиллуулахыг зааж өгнө
export const config = {
  matcher: [
    "/api/foods/:path*",
    "/api/categories/:path*",
    "/api/orders/:path*",
    "/api/orders",
    "/api/upload/:path*",
    "/api/users/address",
  ],
};
