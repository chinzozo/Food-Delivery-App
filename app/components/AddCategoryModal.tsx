/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";
import { useState } from "react";
import { Toast } from "./Toast";

export const AddCategoryModal = ({ isOpen, onClose, onSuccess }: any) => {
  const [name, setName] = useState("");
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState("");

  if (!isOpen) return null;

  const triggerToast = (msg: string) => {
    setToastMessage(msg);
    setShowToast(true);
    setTimeout(() => setShowToast(false), 3000);
  };

  const handleSubmit = async () => {
    // 1. Локаль сторэйжээс токеноо авна
    const token = localStorage.getItem("token");

    try {
      const res = await fetch("/api/categories", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          // 2. Энэ хэсгийг заавал нэмэх ёстой!
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ categoryName: name }),
      });

      if (!res.ok) {
        if (res.status === 401) {
          throw new Error(
            "Таны эрх хүрэлцэхгүй байна эсвэл дахин нэвтэрнэ үү.",
          );
        }
        throw new Error("Категори нэмэхэд алдаа гарлаа.");
      }

      onSuccess();
      onClose();
      setName("");
    } catch (err: any) {
      triggerToast(err.message);
    }
  };

  return (
    <>
      <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
        <div className="bg-white p-6 rounded-2xl w-full max-w-[460px] space-y-7">
          <div className="flex items-center justify-between">
            <h2 className="font-bold text-lg">Add new category</h2>
            <button
              onClick={onClose}
              className=" w-[36px] h-[36px] bg-neutral-100 rounded-3xl cursor-pointer"
            >
              ✕
            </button>
          </div>
          <div>
            <p className="text-[14px] pb-[8px]">Category name</p>
            <input
              className="w-full border p-1.5 rounded-lg text-[14px] border-gray-300"
              placeholder="Type category name..."
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
          </div>
          <div className="flex justify-end gap-2">
            <button
              onClick={handleSubmit}
              className="px-4 py-2 bg-black text-white rounded-lg cursor-pointer"
            >
              Add category
            </button>
          </div>
        </div>
      </div>
      {showToast && <Toast message={toastMessage} />}
    </>
  );
};
