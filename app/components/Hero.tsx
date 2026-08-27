import Image from "next/image";

export function Hero() {
  return (
    <section className="w-full bg-[#18181b] flex justify-center items-center pt-16 sm:pt-[68px]">
      <div className="w-full max-w-[1440px] relative">
        <Image
          src="/hero.jpg"
          alt="Today's Special Offer Banner"
          width={1920}
          height={1080}
          priority
          className="w-full h-auto object-contain"
        />
      </div>
    </section>
  );
}
