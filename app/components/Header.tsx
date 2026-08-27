/* eslint-disable react-hooks/set-state-in-effect */
/* eslint-disable react/jsx-no-undef */
/* eslint-disable @next/next/no-img-element */
"use client";
import { Container } from "./Container";
import { useState, useEffect } from "react";
import { AddressModal } from "./AddressModal";
import { UserDropdown } from "./UserDropdown";
import { useContext } from "react";
import { CartContext } from "@/context/CartContext";
import { CartDrawer } from "./CartDrawer";

export default function Header() {
  const [isAddressModalOpen, setIsAddressModalOpen] = useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [address, setAddress] = useState("");
  const { cartItems } = useContext(CartContext);

  useEffect(() => {
    // 1. Эхлээд локал сторэйжээс уншина
    const saved = localStorage.getItem("deliveryAddress");
    if (saved) setAddress(saved);

    // 2. Хэрэв нэвтэрсэн бол датабэйсээс хаягийг нь баталгаажуулж авч болно
    const fetchUserAddress = async () => {
      const token = localStorage.getItem("token");
      if (!token || saved) return; // Хэрэв хаяг локал сторэйжид байвал заавал дуудах шаардлагагүй

      try {
        const res = await fetch("/api/users/profile", {
          // Профайл мэдээлэл авдаг API байна гэж үзвэл
          headers: { Authorization: `Bearer ${token}` },
        });
        if (res.ok) {
          const data = await res.json();
          if (data.address) {
            setAddress(data.address);
            localStorage.setItem("deliveryAddress", data.address);
          }
        }
      } catch (e) {
        console.error(e);
      }
    };

    fetchUserAddress();

    const handleUpdate = () => {
      setAddress(localStorage.getItem("deliveryAddress") || "");
    };
    window.addEventListener("addressUpdated", handleUpdate);
    return () => window.removeEventListener("addressUpdated", handleUpdate);
  }, []);

  return (
    <header className="w-full h-16 sm:h-17 bg-black fixed top-0 left-0 z-50">
      <Container className="h-full">
        <div className="flex h-full items-center justify-between gap-2">
          <div
            className="flex items-center gap-2 sm:gap-3 cursor-pointer shrink-0"
            onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
          >
            <img
              src="/Logo.svg"
              alt="logo"
              className="h-8 w-10 sm:h-[37.29px] sm:w-[46px]"
            />
            <div className="hidden sm:flex flex-col justify-center gap-1">
              <img
                src="/LogoName.svg"
                alt="logo name"
                className="h-auto w-22"
              />
              <p className="text-sm text-white">Swift delivery</p>
            </div>
          </div>

          <div className="flex items-center gap-2 sm:gap-3.5 min-w-0">
            <button
              onClick={() => setIsAddressModalOpen(true)}
              className="flex justify-center items-center h-9 bg-white rounded-3xl text-sm px-2.5 sm:px-4 gap-1
              cursor-pointer min-w-0"
            >
              <img src="/LocationIcon.svg" alt="location" className="shrink-0" />
              <p className="hidden md:block text-red-500 shrink-0">
                Delivery address:
              </p>
              <p className="text-gray-500 truncate max-w-[72px] sm:max-w-[150px]">
                {address || "Add Location"}
              </p>
              <img
                src="/ChevronRight.svg"
                alt="location"
                className="hidden sm:block shrink-0"
              />
            </button>
            <button
              onClick={() => setIsCartOpen(true)}
              className="relative w-9 h-9 bg-white rounded-3xl cursor-pointer flex items-center justify-center shrink-0"
            >
              <img src="/ShoppingCart.svg" alt="shopping cart" />
              {cartItems.length > 0 && !isCartOpen && (
                <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center">
                  {cartItems.length}
                </span>
              )}
            </button>

            {/* ЗӨВ БҮТЭЦ: Dropdown-ыг товчлуурын дотор биш, гадна нь relative контейнерт хийнэ */}
            <div className="relative z-[100] shrink-0">
              <button
                onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                className="w-9 h-9 bg-red-500 rounded-3xl cursor-pointer flex items-center justify-center"
              >
                <img src="/User.svg" alt="user" />
              </button>

              {isUserMenuOpen &&
                (localStorage.getItem("token") ? (
                  <UserDropdown onClose={() => setIsUserMenuOpen(false)} />
                ) : (
                  <div className="absolute top-12 right-0 p-4 bg-white rounded-xl shadow-lg">
                    <a
                      href="/login"
                      className="text-sm font-bold text-black rounded-3xl bg-gray-100 hover:bg-gray-200 px-4 py-2"
                    >
                      Login
                    </a>
                  </div>
                ))}
            </div>
          </div>
        </div>
      </Container>

      {isAddressModalOpen && (
        <AddressModal onClose={() => setIsAddressModalOpen(false)} />
      )}

      {isCartOpen && <CartDrawer onClose={() => setIsCartOpen(false)} />}
    </header>
  );
}
