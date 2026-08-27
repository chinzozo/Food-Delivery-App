/* eslint-disable react-hooks/set-state-in-effect */
/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import React, { useState, useEffect } from "react";
import { Toast } from "./Toast";

interface CategoryItem {
  id: string;
  name: string;
}

interface AddDishModalProps {
  isOpen: boolean;
  onClose: () => void;
  category: CategoryItem; // Одоогийн анхны категори
  categories: CategoryItem[]; // Системд байгаа БҮХ категориудын жагсаалт (Шинээр нэмэв)
  onSuccess: () => void;
  onDelete?: (id: string) => void;
  foodToEdit?: any;
}

export function AddDishModal({
  isOpen,
  onClose,
  category,
  categories = [], // default утга
  onSuccess,
  onDelete,
  foodToEdit,
}: AddDishModalProps) {
  const [foodName, setFoodName] = useState("");
  const [price, setPrice] = useState("");
  const [description, setDescription] = useState("");
  const [selectedCategoryId, setSelectedCategoryId] = useState(""); // Сонгосон категорийн ID хадгалах
  const [file, setFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState("");

  const triggerToast = (msg: string) => {
    setToastMessage(msg);
    setShowToast(true);
    setTimeout(() => setShowToast(false), 3000);
  };

  useEffect(() => {
    if (foodToEdit) {
      setFoodName(foodToEdit.foodName);
      setPrice(foodToEdit.price?.toString() || "");
      setDescription(foodToEdit.ingredients || "");
      setImagePreview(foodToEdit.image || null);
      // Хэрэв засаж байгаа бол тухайн хоолны өөрийнх нь categoryId-г идэвхжүүлнэ, байхгүй бол тухайн үеийн категорийг авна
      // foodCategoryId эсвэл categoryId-г шалгана
      setSelectedCategoryId(
        foodToEdit.foodCategoryId || foodToEdit.categoryId || category.id,
      );
    } else {
      setFoodName("");
      setPrice("");
      setDescription("");
      setFile(null);
      setImagePreview(null);
      setSelectedCategoryId(category.id); // Шинээр нэмж байгаа бол идэвхтэй байгаа категорийг шууд сонгоно
    }
  }, [foodToEdit, isOpen, category]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!foodName.trim() || !price || selectedCategoryId === "") {
      triggerToast("Мэдээллийг гүйцэд бөглөнө үү!");
      return;
    }

    setLoading(true);
    try {
      const token = localStorage.getItem("token");
      let imageUrl = imagePreview;

      if (file) {
        const sanitizedName = file.name.replace(/\s+/g, "-");
        // Vercel Blob руу файлыг шууд body-оор дамжуулж хуулна
        const uploadRes = await fetch(`/api/upload?filename=${sanitizedName}`, {
          method: "POST",
          body: file,
        });
        if (!uploadRes.ok) throw new Error("Зураг хуулахад алдаа гарлаа.");
        const uploadData = await uploadRes.json();
        imageUrl = uploadData.url;
      }

      const payload = {
        foodName: foodName.trim(),
        price: parseFloat(price),
        ingredients: description.trim(),
        image: imageUrl,
        categoryId: selectedCategoryId, // Сонгогдсон шинэ категорийн ID-г илгээнэ
      };

      const method = foodToEdit ? "PATCH" : "POST";
      const url = foodToEdit ? `/api/foods/${foodToEdit.id}` : "/api/foods";

      const res = await fetch(url, {
        method: method,
        headers: {
          "Content-Type": "application/json",
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify(payload),
      });

      if (res.ok) {
        onSuccess();
        onClose();
      } else {
        triggerToast("Хадгалах үед алдаа гарлаа.");
      }
    } catch (error: any) {
      triggerToast(error.message || "Алдаа гарлаа");
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteClick = () => {
    if (foodToEdit && onDelete) {
      if (confirm("Энэ хоолыг устгахдаа итгэлтэй байна уу?")) {
        onDelete(foodToEdit.id);
      }
    }
  };

  return (
    <>
      <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-[28px] w-full max-w-[472px] p-5 sm:p-6 shadow-2xl relative max-h-[90vh] overflow-y-auto">
          <button
            onClick={onClose}
            className="absolute right-6 top-6 text-neutral-400 hover:text-black w-8 h-8 flex items-center justify-center bg-neutral-100 rounded-full transition-colors cursor-pointer"
          >
            <span className="text-lg">✕</span>
          </button>

          <h3 className="font-bold text-[18px] text-neutral-900 mb-8">
            Dishes info
          </h3>

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Dish Name */}
            <div className="grid grid-cols-1 sm:grid-cols-[110px_1fr] items-center gap-2 sm:gap-4">
              <label className="text-[12px] font-medium text-neutral-400">
                Dish name
              </label>
              <input
                type="text"
                value={foodName}
                onChange={(e) => setFoodName(e.target.value)}
                placeholder="Dish name"
                className="w-full px-4 py-2 border border-neutral-200 rounded-xl text-sm focus:outline-none focus:border-neutral-400"
                required
              />
            </div>

            {/* Dish Category (СОНГОДОГ БОЛГОЖ ЗАСАВ) */}
            <div className="grid grid-cols-1 sm:grid-cols-[110px_1fr] items-center gap-2 sm:gap-4">
              <label className="text-[12px] font-medium text-neutral-400">
                Dish category
              </label>
              <div className="relative">
                <select
                  value={selectedCategoryId}
                  onChange={(e) => setSelectedCategoryId(e.target.value)}
                  className="w-full px-4 py-2 border border-neutral-200 bg-white rounded-xl text-sm appearance-none font-semibold text-neutral-800 cursor-pointer focus:outline-none focus:border-neutral-400"
                  required
                >
                  {/* Хэрэв категориуд пропсоор орж ирсэн бол жагсаалтаар харуулна */}
                  {categories.length > 0 ? (
                    categories.map((cat) => (
                      <option key={cat.id} value={cat.id}>
                        {cat.name}
                      </option>
                    ))
                  ) : (
                    // Хэрэв categories жагсаалт хоосон ирвэл алдаа гаргахгүйн тулд идэвхтэй байгаа ганцыг харуулна
                    <option value={category.id}>{category.name}</option>
                  )}
                </select>
                {/* Баруун талын сумтай дүрс */}
                <div className="pointer-events-none absolute inset-y-0 right-4 flex items-center text-neutral-400 text-xs">
                  ↕
                </div>
              </div>
            </div>

            {/* Ingredients */}
            <div className="grid grid-cols-1 sm:grid-cols-[110px_1fr] items-start gap-2 sm:gap-4">
              <label className="text-[12px] font-medium text-neutral-400 sm:pt-2">
                Ingredients
              </label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Ingredients..."
                className="w-full px-4 py-2 border border-neutral-200 rounded-xl text-sm h-28 resize-none focus:outline-none focus:border-neutral-400 leading-relaxed"
                required
              />
            </div>

            {/* Price */}
            <div className="grid grid-cols-1 sm:grid-cols-[110px_1fr] items-center gap-2 sm:gap-4">
              <label className="text-[12px] font-medium text-neutral-400">
                Price
              </label>
              <div className="relative">
                <span className="absolute left-4 inset-y-0 flex items-center text-sm text-neutral-800">
                  $
                </span>
                <input
                  type="number"
                  step="0.01"
                  value={price}
                  onChange={(e) => setPrice(e.target.value)}
                  placeholder="0.00"
                  className="w-full pl-7 pr-4 py-2 border border-neutral-200 rounded-xl text-sm focus:outline-none focus:border-neutral-400"
                  required
                />
              </div>
            </div>

            {/* Image */}
            <div className="grid grid-cols-1 sm:grid-cols-[110px_1fr] items-start gap-2 sm:gap-4">
              <label className="text-[12px] font-medium text-neutral-400 sm:pt-2">
                Image
              </label>
              <div className="relative w-full h-36 bg-neutral-50 border border-neutral-200 rounded-2xl overflow-hidden group">
                {!imagePreview ? (
                  <label className="cursor-pointer flex flex-col items-center justify-center h-full w-full hover:bg-neutral-100 transition-colors">
                    <span className="text-2xl text-neutral-400">+</span>
                    <span className="text-xs text-neutral-400 mt-1">
                      Upload Image
                    </span>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={(e) => {
                        const f = e.target.files?.[0];
                        if (f) {
                          setFile(f);
                          setImagePreview(URL.createObjectURL(f));
                        }
                      }}
                      className="hidden"
                    />
                  </label>
                ) : (
                  <>
                    <img
                      src={imagePreview}
                      alt="Preview"
                      className="w-full h-full object-cover"
                    />
                    <button
                      type="button"
                      onClick={() => {
                        setFile(null);
                        setImagePreview(null);
                      }}
                      className="absolute top-2 right-2 bg-white/90 text-neutral-800 rounded-full w-7 h-7 flex items-center justify-center shadow-md hover:bg-white transition-colors cursor-pointer"
                    >
                      ✕
                    </button>
                  </>
                )}
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex items-center justify-between pt-4 border-t border-neutral-100 mt-6">
              {foodToEdit ? (
                <button
                  type="button"
                  onClick={handleDeleteClick}
                  className="w-[48px] h-[40px] flex items-center justify-center border border-red-200 text-red-500 rounded-xl hover:bg-red-50 transition-colors cursor-pointer"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                    strokeWidth={1.5}
                    stroke="currentColor"
                    className="w-5 h-5"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="m14.74 9-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 0 1-2.244 2.077H8.084a2.25 2.25 0 0 1-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 0 0-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 0 1 3.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 0 0-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 0 0-7.5 0"
                    />
                  </svg>
                </button>
              ) : (
                <div />
              )}

              <button
                type="submit"
                disabled={loading}
                className="bg-neutral-900 text-white px-4 py-3 rounded-xl font-medium text-sm hover:bg-black transition-colors min-w-[140px] cursor-pointer"
              >
                {loading
                  ? "Saving..."
                  : foodToEdit
                    ? "Save changes"
                    : "Add Dish"}
              </button>
            </div>
          </form>
        </div>
      </div>
      {showToast && <Toast message={toastMessage} />}
    </>
  );
}
