/* eslint-disable @next/next/no-img-element */
import { Container } from "./Container";

const menuSections = [
  { title: "Nomnom", links: ["Home", "Contact us", "Delivery zone"] },
  {
    title: "Menu",
    links: [
      "Appetizers",
      "Salads",
      "Lunch Favorites",
      "Main dishes",
      "Fish & Sea Foods",
    ],
  },
  {
    title: "",
    links: ["Brunch", "Side Dishes", "Desserts", "Beverages"],
  },
];

const footerLinks = ["Privacy policy", "Terms and condition", "Cookie policy"];

export default function Footer() {
  return (
    <footer className="w-full pb-16 sm:pb-30 bg-[#18181b] text-white">
      <div className="w-full h-14 sm:h-23 bg-[#ef4444] mt-10 sm:mt-15 flex items-center overflow-hidden whitespace-nowrap">
        <div className="flex items-center animate-marquee-custom text-white text-xl sm:text-3xl font-semibold">
          {Array(15)
            .fill("Fresh fast delivered")
            .map((text, i) => (
              <span key={i} className="mx-8">
                {text}
              </span>
            ))}
        </div>
      </div>
      <Container>
        <div className="flex flex-col md:flex-row justify-between items-start flex-wrap gap-8 mb-1 pt-10 sm:pt-16 pb-8">
          <div className="flex flex-col items-center gap-3 cursor-pointer w-full md:w-auto">
            <img src="/Logo.svg" alt="logo" className="h-[37px] w-[46px]" />
            <div className="flex flex-col text-white gap-1">
              <img src="/LogoName.svg" alt="NomNom" className="h-auto w-22" />
              <p className="text-sm">Swift delivery</p>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-8 w-full md:contents">
            {menuSections.map((section, id) => (
              <div key={id} className={section.title ? "" : "md:pt-10"}>
                {section.title && (
                  <h3 className="text-4 text-gray-500 tracking-widest uppercase mb-4">
                    {section.title}
                  </h3>
                )}
                <ul className="space-y-3 text-4 font-medium">
                  {section.links.map((link) => (
                    <li key={link}>
                      <a
                        href={link === "Home" ? "/" : `/#${link}`}
                        className="hover:text-white transition-colors"
                      >
                        {link}
                      </a>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
            <div>
              <h3 className="text-4 text-gray-500 tracking-widest uppercase mb-4">
                Follow us
              </h3>
              <div className="flex space-x-4 text-xl">
                <img src="/Instagram.svg" alt="Instagram" className="h-6 w-6" />
                <img src="/Facebook.svg" alt="Facebook" className="h-6 w-6" />
              </div>
            </div>
          </div>
        </div>
        <hr className="border-zinc-800 my-6" />
        <div className="flex justify-between items-center text-[14px] text-gray-500">
          <div className="flex flex-col sm:flex-row flex-wrap gap-3 sm:gap-10">
            <span>Copy right 2024 © Nomnom LLC</span>
            {footerLinks.map((link) => (
              <a
                key={link}
                href="#"
                className="hover:text-gray-400 transition-colors"
              >
                {link}
              </a>
            ))}
          </div>
        </div>
      </Container>
    </footer>
  );
}
