import { ProductCard, type Product } from "./ProductCard";
import { prisma } from "@/lib/prisma";

async function getMenuData() {
  try {
    const categories = await prisma.foodCategory.findMany({
      include: {
        foods: true,
      },
    });
    return categories;
  } catch (error) {
    console.error("Failed to fetch menu data from NeonDB:", error);
    return [];
  }
}

export async function Menu() {
  const sections = await getMenuData();

  if (!sections || sections.length === 0) {
    return (
      <section className="bg-primary py-10 text-center text-white">
        <p>Категори одоогоор байхгүй байна.</p>
      </section>
    );
  }

  return (
    <section className="bg-primary">
      <div className="mx-auto flex max-w-[1440px] flex-col gap-10 px-4 py-10 sm:gap-14 sm:px-12 sm:py-14 lg:px-[88px]">
        {sections.map((section) => (
          <div
            key={section.id}
            id={section.categoryName}
            className="flex flex-col gap-5 scroll-mt-24 sm:gap-6"
          >
            <h2 className="text-[22px] font-semibold leading-8 tracking-tight text-white sm:text-[30px] sm:leading-9">
              {section.categoryName}
            </h2>

            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 sm:gap-9 lg:grid-cols-3">
              {section.foods.map((food) => {
                const mappedProduct: Product = {
                  id: food.id,
                  name: food.foodName,
                  description:
                    food.ingredients || "Орц найрлага байхгүй байна.",
                  price: `$${food.price.toFixed(2)}`,
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