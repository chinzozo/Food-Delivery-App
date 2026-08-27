/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";
import { CartContext } from "@/context/CartContext";
import { useContext, useState } from "react";

export const ProductModal = ({
  product,
  onClose,
  onSuccess,
}: {
  product: any;
  onClose: () => void;
  onSuccess?: () => void;
}) => {
  const [count, setCount] = useState(1);
  const { addToCart } = useContext(CartContext);

  return (
    <>
      {/* Арын бүдэг хэсэг */}
      <div className="fixed inset-0 bg-black/50 z-[200]" onClick={onClose} />

      {/* Цонхны гол хэсэг */}
      <div className="fixed inset-4 sm:inset-auto sm:top-1/2 sm:left-1/2 sm:-translate-x-1/2 sm:-translate-y-1/2 bg-white p-4 sm:p-6 rounded-3xl w-auto sm:w-[700px] max-h-[calc(100vh-2rem)] overflow-y-auto z-[201] flex flex-col sm:flex-row gap-4 sm:gap-6">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 sm:hidden w-8 h-8 bg-neutral-100 rounded-full text-neutral-500"
          aria-label="Close"
        >
          ✕
        </button>
        <img
          src={product.image}
          className="w-full h-52 sm:w-[300px] sm:h-[300px] object-cover rounded-2xl shrink-0"
        />
        <div className="flex-1 flex flex-col gap-4 min-w-0">
          <h2 className="text-xl sm:text-2xl font-bold text-red-500 pr-8 sm:pr-0">
            {product.name}
          </h2>
          <p className="text-gray-600 text-sm">{product.description}</p>

          <div className="mt-auto text-black">
            <div className="flex justify-between items-end gap-3">
              <div>
                <p className="text-sm">Total price</p>
                <p className="text-xl font-bold">{product.price}</p>
              </div>
              <div className="flex items-center gap-4 mt-2">
                <button
                  onClick={() => setCount(Math.max(1, count - 1))}
                  className="border px-3 py-1 rounded-full cursor-pointer"
                >
                  -
                </button>
                <span className="font-bold">{count}</span>
                <button
                  onClick={() => setCount(count + 1)}
                  className="border px-3 py-1 rounded-full cursor-pointer"
                >
                  +
                </button>
              </div>
            </div>
            <button
              onClick={() => {
                addToCart(product, count);
                if (onSuccess) onSuccess();
                onClose();
              }}
              className="w-full bg-black text-white mt-4 py-3 rounded-3xl cursor-pointer"
            >
              Add to cart
            </button>
          </div>
        </div>
      </div>
    </>
  );
};
