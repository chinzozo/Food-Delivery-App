/* eslint-disable @typescript-eslint/no-explicit-any */
import { useState } from "react";
import { Toast } from "./Toast";

export const AddressModal = ({ onClose }: any) => {
  const [address, setAddress] = useState("");
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState("");

  const triggerToast = (msg: string) => {
    setToastMessage(msg);
    setShowToast(true);
    setTimeout(() => setShowToast(false), 3000);
  };

  const handleSave = async () => {
    const token = localStorage.getItem("token");

    if (!token) {
      triggerToast("Та нэвтэрч орно уу!");
      return;
    }

    try {
      const res = await fetch("/api/users/address", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ address: address }),
      });

      if (!res.ok) throw new Error("Хаяг хадгалж чадсангүй");

      // Хаягийг локал болон бусад компонентуудад синхрончлох
      localStorage.setItem("deliveryAddress", address);
      window.dispatchEvent(new Event("addressUpdated"));

      triggerToast("Хаяг амжилттай хадгалагдлаа!");
      setTimeout(() => {
        onClose();
      }, 1500);
    } catch (err: any) {
      triggerToast(err.message);
    }
  };

  return (
    <>
      <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 text-black p-4">
        <div className="bg-white p-5 sm:p-6 rounded-2xl w-full max-w-[460px] space-y-4">
          <div className="flex justify-between items-center gap-3">
            <h2 className="font-bold text-base sm:text-lg">
              Please write your delivery address!
            </h2>

            <button
              onClick={onClose}
              className=" text-neutral-400 hover:text-black w-8 h-8 flex items-center justify-center bg-neutral-100 rounded-full transition-colors cursor-pointer"
            >
              <span className="text-lg">✕</span>
            </button>
          </div>
          <textarea
            className="w-full border border-gray-300 p-2 rounded-lg text-[14px]"
            placeholder="Please share your complete address"
            onChange={(e) => setAddress(e.target.value)}
          />
          <div className="flex justify-end gap-2 text-[14px]">
            <button
              onClick={onClose}
              className="px-4 py-2 border border-gray-300 rounded-lg cursor-pointer"
            >
              Cancel
            </button>
            <button
              onClick={handleSave}
              className="px-4 py-2 bg-black text-white rounded-lg cursor-pointer"
            >
              Deliver Here
            </button>
          </div>
        </div>
      </div>
      {showToast && <Toast message={toastMessage} />}
    </>
  );
};
