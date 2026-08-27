import { ProductCard, type Product } from "./ProductCard";
import { prisma } from "@/lib/prisma";

async function getMenuData() {
  const categories = await prisma.foodCategory.findMany({
    include: {
      foods: true,
    },
  });
  return categories;
}

// 3. Компонентоо 'async' болгоно
export async function Menu() {
  const sections = await getMenuData();

  return (
    <section className="bg-primary">
      <div className="mx-auto flex max-w-[1440px] flex-col gap-10 px-4 py-10 sm:gap-14 sm:px-12 sm:py-14 lg:px-[88px]">
        {sections.map((section) => (
          <div
            key={section.id}
            id={section.categoryName}
            className="flex flex-col gap-5 sm:gap-6 scroll-mt-24"
          >
            {/* Категорийн нэр (Манай бэкэндээс categoryName ирнэ) */}
            <h2 className="text-[22px] sm:text-[30px] font-semibold leading-8 sm:leading-9 tracking-tight text-white">
              {section.categoryName}
            </h2>

            <div className="grid grid-cols-1 gap-5 sm:gap-9 sm:grid-cols-2 lg:grid-cols-3">
              {section.foods.map((food) => {
                const mappedProduct: Product = {
                  id: food.id,
                  name: food.foodName,
                  description:
                    food.ingredients || "Орц найрлага байхгүй байна.",
                  price: `$${food.price.toFixed(2)}`, // Тоог $12.99 формат руу хөрвүүлэх
                  image: food.image || "/placeholder.jpg",
                };

                return <ProductCard key={food.id} product={mappedProduct} />;
              })}
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
