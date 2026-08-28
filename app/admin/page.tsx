/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @next/next/no-img-element */
/* eslint-disable react-hooks/set-state-in-effect */
"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { AddDishModal } from "@/app/components/AddDishModal";
import { AddCategoryModal } from "@/app/components/AddCategoryModal";
import { Toast } from "@/app/components/Toast";

interface Food {
  id: string;
  foodName: string;
  price: number;
  image: string;
  description: string;
  ingredients?: string;
}

interface Category {
  id: string;
  categoryName: string;
  foods: Food[];
}

export default function AdminDashboard() {
  const router = useRouter();
  const [categories, setCategories] = useState<Category[]>([]);
  const [activeTab, setActiveTab] = useState("All");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isCategoryModalOpen, setIsCategoryModalOpen] = useState(false);
  const [selectedCategoryForModal, setSelectedCategoryForModal] = useState({
    id: "",
    name: "",
  });
  const [editingFood, setEditingFood] = useState<any | null>(null);
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState("");

  const triggerToast = (msg: string) => {
    setToastMessage(msg);
    setShowToast(true);
    setTimeout(() => setShowToast(false), 3000);
  };

  const fetchMenuData = async () => {
    try {
      const res = await fetch("/api/categories");
      if (res.ok) {
        const data = await res.json();
        setCategories(data);
      }
    } catch (err) {
      console.error("Дата татахад алдаа гарлаа:", err);
    }
  };

  useEffect(() => {
    const token =
      typeof window !== "undefined" ? localStorage.getItem("token") : null;

    if (!token) {
      router.push("/login");
    } else {
      fetchMenuData();
    }
  }, [router]);

  const totalDishes = categories.reduce(
    (sum, cat) => sum + cat.foods.length,
    0
  );

  const openAddModal = (catId: string, catName: string) => {
    setSelectedCategoryForModal({ id: catId, name: catName });
    setIsModalOpen(true);
  };

  return (
    <div className="flex flex-col md:flex-row min-h-screen bg-[#F8F9FA] text-[#333333] font-sans">
      <div className="md:hidden sticky top-0 z-40 bg-white border-b border-neutral-200 px-4 py-3 flex items-center justify-between gap-3">
        <div
          className="flex items-center gap-2 cursor-pointer"
          onClick={() => router.push("/")}
        >
          <img src="/Logo.svg" alt="logo" className="h-7 w-8" />
          <span className="font-bold text-sm">NomNom</span>
        </div>
        <div className="flex gap-2">
          <button className="bg-black text-white px-3 py-1.5 rounded-3xl text-xs font-medium">
            Food menu
          </button>
          <button
            onClick={() => router.push("/admin/orders")}
            className="bg-neutral-100 text-neutral-600 px-3 py-1.5 rounded-3xl text-xs font-medium"
          >
            Orders
          </button>
        </div>
      </div>

      <aside className="hidden md:flex w-[240px] bg-white border-r border-neutral-200 p-6 flex-col justify-between shrink-0">
        <div className="space-y-8">
          <div
            className="flex items-center gap-3 cursor-pointer pl-4"
            onClick={() => router.push("/")}
          >
            <img src="/Logo.svg" alt="logo" className="h-[29.18px] w-[36px]" />
            <div>
              <h1 className="font-bold text-base leading-none text-[18px]">
                NomNom
              </h1>
              <span className="text-xs text-neutral-500">Swift delivery</span>
            </div>
          </div>

          <nav className="space-y-6">
            <button className="w-full flex items-center gap-[10px] bg-black text-white px-[40px] py-2.5 rounded-3xl font-medium text-sm transition shadow-sm cursor-pointer">
              <span className="text-lg">
                <img src="/DashboardIcon.svg" alt="" />
              </span>{" "}
              Food menu
            </button>
            <button
              onClick={() => router.push("/admin/orders")}
              className="w-full flex items-center gap-[10px] text-neutral-500 hover:bg-neutral-100 px-[40px] py-2.5 rounded-3xl font-medium text-sm transition shadow-sm cursor-pointer"
            >
              <img src="/TruckIcon.svg" alt="" />
              Orders
            </button>
          </nav>
        </div>
      </aside>

      <main className="flex-1 p-4 sm:p-6 md:p-8 space-y-6 md:space-y-8 overflow-y-auto max-w-[1200px] mx-auto w-full">
        <div className="bg-white p-4 sm:p-6 rounded-2xl border border-neutral-100 space-y-4 shadow-sm">
          <h2 className="font-bold text-lg">Dishes category</h2>
          <div className="flex flex-wrap gap-4 items-center">
            <button
              onClick={() => setActiveTab("All")}
              className={`px-4 py-2 rounded-full text-xs font-semibold transition cursor-pointer ${
                activeTab === "All"
                  ? "bg-red-500 text-white"
                  : "bg-neutral-100 text-neutral-600 hover:bg-neutral-200"
              }`}
            >
              All Dishes <span className="ml-1 opacity-70">{totalDishes}</span>
            </button>
            {categories.map((cat) => (
              <button
                key={cat.id}
                onClick={() => setActiveTab(cat.id)}
                className={`px-4 py-2 rounded-full text-xs font-semibold transition cursor-pointer ${
                  activeTab === cat.id
                    ? "bg-red-500 text-white"
                    : "bg-neutral-100 text-neutral-600 hover:bg-neutral-200"
                }`}
              >
                {cat.categoryName}{" "}
                <span className="ml-1 opacity-70">{cat.foods.length}</span>
              </button>
            ))}
            <button
              onClick={() => setIsCategoryModalOpen(true)}
              className="w-8 h-8 bg-red-500 text-white rounded-full flex items-center justify-center font-bold text-lg hover:bg-red-600 transition shadow-sm cursor-pointer"
            >
              +
            </button>
          </div>
        </div>

        <div className="space-y-10">
          {categories
            .filter((cat) => activeTab === "All" || activeTab === cat.id)
            .map((cat) => (
              <div key={cat.id} className="space-y-4">
                <h3 className="font-bold text-lg text-neutral-800">
                  {cat.categoryName} ({cat.foods.length})
                </h3>

                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                  <div
                    onClick={() => openAddModal(cat.id, cat.categoryName)}
                    className="border-2 border-dashed border-red-200 bg-white rounded-2xl p-6 flex flex-col items-center justify-center text-center gap-3 cursor-pointer hover:bg-red-50/30 transition aspect-[4/5]"
                  >
                    <div className="w-10 h-10 bg-red-500 text-white rounded-full flex items-center justify-center text-xl font-bold shadow-sm">
                      +
                    </div>
                    <span className="text-xs font-semibold text-neutral-500">
                      Add new Dish to
                      <br />
                      {cat.categoryName}
                    </span>
                  </div>

                  {cat.foods.map((food) => (
                    <div
                      key={food.id}
                      className="bg-white rounded-2xl p-4 border border-neutral-100 shadow-sm flex flex-col justify-between relative aspect-[4/5]"
                    >
                      <div className="space-y-3">
                        <div className="relative w-full aspect-[4/3] rounded-xl overflow-hidden bg-neutral-100">
                          <Image
                            src={food.image ? food.image : "/placeholder.jpg"}
                            alt={food.foodName}
                            fill
                            unoptimized
                            sizes="(max-width: 640px) 100vw, (max-width: 768px) 50vw, (max-width: 1024px) 33vw, 25vw"
                            className="object-cover"
                          />
                          <button
                            onClick={() => {
                              setSelectedCategoryForModal({
                                id: cat.id,
                                name: cat.categoryName,
                              });
                              setEditingFood(food);
                            }}
                            className="absolute right-3 bottom-3 w-8 h-8 bg-white rounded-full flex items-center justify-center shadow-md text-red-500 text-sm hover:scale-105 transition cursor-pointer"
                          >
                            <img
                              src="/edit.svg"
                              alt="Edit"
                              className="w-4 h-4"
                            />
                          </button>
                        </div>
                        <div className="flex justify-between items-start gap-2 pt-1">
                          <h4 className="font-bold text-sm text-red-500 leading-tight line-clamp-1">
                            {food.foodName}
                          </h4>
                          <span className="font-bold text-xs text-neutral-800 shrink-0">
                            ${food.price.toFixed(2)}
                          </span>
                        </div>
                        <p className="text-[11px] text-neutral-400 line-clamp-3 leading-relaxed">
                          {food.description}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
        </div>
      </main>

      <AddCategoryModal
        isOpen={isCategoryModalOpen}
        onClose={() => setIsCategoryModalOpen(false)}
        onSuccess={fetchMenuData}
      />
      <AddDishModal
        isOpen={isModalOpen || !!editingFood}
        onClose={() => {
          setIsModalOpen(false);
          setEditingFood(null);
        }}
        category={selectedCategoryForModal}
        categories={categories.map((cat: any) => ({
          id: cat.id,
          name: cat.categoryName,
        }))}
        foodToEdit={editingFood}
        onSuccess={() => {
          fetchMenuData();
        }}
        onDelete={async (id: string) => {
          const token = localStorage.getItem("token");

          const res = await fetch(`/api/foods/${id}`, {
            method: "DELETE",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`,
            },
          });

          if (res.ok) {
            fetchMenuData();
            setEditingFood(null);
          } else {
            const errorData = await res.json();
            triggerToast(
              `Устгах үед алдаа гарлаа: ${errorData.error || "Эрх хүрэлцэхгүй байна"}`
            );
          }
        }}
      />
      {showToast && <Toast message={toastMessage} />}
    </div>
  );
}