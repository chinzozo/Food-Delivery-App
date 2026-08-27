/* eslint-disable react-hooks/set-state-in-effect */
/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";
import { useContext, useEffect, useState } from "react";
import { CartContext } from "@/context/CartContext";
import { Toast } from "./Toast";

export const CartDrawer = ({ onClose }: { onClose: () => void }) => {
  const [activeTab, setActiveTab] = useState("Cart");
  const [address, setAddress] = useState("");
  const [addressError, setAddressError] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [orders, setOrders] = useState<any[]>([]);
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState("");

  const triggerToast = (msg: string) => {
    setToastMessage(msg);
    setShowToast(true);
    setTimeout(() => setShowToast(false), 3000);
  };

  // Context-ээс хэрэгтэй функцүүдээ дуудна
  const {
    cartItems,
    removeFromCart,
    updateQuantity,
    itemsTotal,
    shipping,
    total,
    clearCart,
  } = useContext(CartContext);

  // Хуудас ачаалагдахад localStorage-оос датаг сэргээх
  useEffect(() => {
    const savedOrders = localStorage.getItem("orderHistory");
    if (savedOrders) {
      setOrders(JSON.parse(savedOrders));
    }

    const savedAddress = localStorage.getItem("deliveryAddress");
    if (savedAddress) setAddress(savedAddress);

    const handleUpdate = () => {
      setAddress(localStorage.getItem("deliveryAddress") || "");
    };
    window.addEventListener("addressUpdated", handleUpdate);
    return () => window.removeEventListener("addressUpdated", handleUpdate);
  }, []);

  const fetchOrders = async () => {
    const token = localStorage.getItem("token");
    if (!token) return;
    try {
      const res = await fetch("/api/orders/my", {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        const data = await res.json();
        setOrders(data);
        localStorage.setItem("orderHistory", JSON.stringify(data));
      }
    } catch (err) {
      console.error("Orders татахад алдаа гарлаа:", err);
    }
  };

  // Захиалгын түүхийг API-аас татах
  useEffect(() => {
    if (activeTab === "Order") fetchOrders();
  }, [activeTab]);

  const handleCheckout = async () => {
    if (cartItems.length === 0) return;
    if (!address.trim()) {
      setAddressError(true);
      return;
    }

    const token = localStorage.getItem("token");
    if (!token) {
      triggerToast("Захиалга хийхийн тулд нэвтэрнэ үү!");
      return;
    }

    try {
      // Токеноос userId-г авах
      const tokenParts = token.split(".");
      if (tokenParts.length !== 3) {
        throw new Error("Токен буруу бүтэцтэй байна.");
      }

      const base64Payload = tokenParts[1].replace(/-/g, "+").replace(/_/g, "/");
      const payload = JSON.parse(window.atob(base64Payload));

      const res = await fetch("/api/orders", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          userId: payload.userId || payload.id, // Хоёр хувилбарыг хоёуланг нь шалгана
          totalPrice: total,
          address: address,
          items: cartItems.map((item: any) => ({
            foodId: item.id,
            quantity: item.quantity,
          })),
        }),
      });

      if (res.ok) {
        const newOrder = await res.json();

        // 1. Сагсыг Context болон State түвшинд шууд цэвэрлэх
        if (clearCart) {
          clearCart();
        }

        // 2. Хаягийг цэвэрлэхгүй үлдээвэл дараагийн захиалгад ашиглахад хялбар байна.

        // 3. Захиалгын түүхийг шинэчлэх
        const updatedOrders = [newOrder, ...orders];
        setOrders(updatedOrders);
        localStorage.setItem("orderHistory", JSON.stringify(updatedOrders));

        setShowSuccess(true);
        setTimeout(() => {
          setShowSuccess(false);
          setActiveTab("Order");
        }, 3000);
      }
    } catch (err) {
      triggerToast("Захиалга илгээхэд алдаа гарлаа.");
    }
  };

  return (
    <>
      <div className="fixed inset-0 bg-black/50 z-[100]" onClick={onClose} />

      <div className="fixed top-0 right-0 h-full w-full sm:w-[535px] max-w-full bg-[#333333] z-[101] p-4 sm:p-5 shadow-2xl flex flex-col gap-4 sm:gap-[24px] rounded-none sm:rounded-l-2xl overflow-hidden">
        <div className="flex justify-between">
          <h2 className="text-white text-[20px] font-semibold flex gap-3">
            <img src="/ShoppingCartWhite.svg" alt="cart" /> Order detail
          </h2>
          <button
            onClick={onClose}
            className="text-white border rounded-3xl px-2.5 py-1 cursor-pointer"
          >
            ✕
          </button>
        </div>
        <div className="bg-white h-[44px] p-1 rounded-3xl flex">
          <button
            onClick={() => setActiveTab("Cart")}
            className={`flex-1 rounded-3xl text-[18px] font-medium transition cursor-pointer ${activeTab === "Cart" ? "bg-[#ff5252] text-white" : "text-gray-500"}`}
          >
            Cart
          </button>
          <button
            onClick={() => setActiveTab("Order")}
            className={`flex-1 rounded-3xl text-[18px] font-medium transition cursor-pointer ${activeTab === "Order" ? "bg-[#ff5252] text-white" : "text-gray-500"}`}
          >
            Order
          </button>
        </div>

        {/* 2. АГУУЛГА */}
        <div className="flex-1 bg-white rounded-3xl p-[16px] text-black overflow-y-auto">
          {activeTab === "Cart" ? (
            cartItems.length === 0 ? (
              // Хоосон үеийн загвар (Таны хүссэнээр)
              <>
                <h2 className="text-xl font-bold mb-4">My cart</h2>
                <div className="bg-gray-100 rounded-xl p-[32px] flex flex-col items-center justify-center gap-2">
                  <img
                    src="/Logo.svg"
                    alt="empty"
                    className="w-[61px] h-[50px]"
                  />
                  <h3 className="font-bold text-lg">Your cart is empty</h3>
                  <p className="text-gray-500 text-sm text-center">
                    Hungry? 🍔 Add some delicious dishes to your cart and
                    satisfy your cravings!
                  </p>
                </div>
              </>
            ) : (
              // Бараа нэмэгдсэн үеийн жагсаалт
              <>
                <h2 className="text-xl font-bold mb-4 text-gray-500">
                  My cart
                </h2>
                {cartItems.map((item: any) => (
                  <div
                    key={item.name}
                    className="flex items-center gap-4 border-b border-dashed border-gray-300 pb-4 mb-4"
                  >
                    <img
                      src={item.image}
                      className="w-20 h-20 sm:w-[124px] sm:h-[120px] rounded-xl object-cover shrink-0"
                    />
                    <div className="flex-1 flex flex-col gap-3 sm:gap-5 min-w-0">
                      <div className="flex justify-between items-start">
                        <div className="flex flex-col">
                          <h4 className="font-bold text-[16px] text-red-500 truncate">
                            {item.name}
                          </h4>
                          <p className="text-[12px] line-clamp-2">
                            {item.description}
                          </p>
                        </div>
                        <button
                          onClick={() => removeFromCart(item.name)}
                          className="text-red-500 border rounded-3xl px-2.5 py-1 cursor-pointer"
                        >
                          ✕
                        </button>
                      </div>
                      <div className="flex items-center gap-3 mt-2 text-[18px]">
                        <button
                          onClick={() => updateQuantity(item.name, -1)}
                          className="px-2 cursor-pointer"
                        >
                          -
                        </button>
                        <span className="font-bold">{item.quantity}</span>
                        <button
                          onClick={() => updateQuantity(item.name, 1)}
                          className="px-2 cursor-pointer"
                        >
                          +
                        </button>
                        <span className="ml-auto font-bold text-[18px]">
                          {item.price}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
                <div>
                  <h1 className="text-xl font-bold text-gray-500 pb-2">
                    Delivery Location
                  </h1>
                  <textarea
                    className={`w-full border p-2 rounded-lg text-[14px] outline-none transition-colors ${
                      addressError ? "border-red-500" : "border-gray-300"
                    }`}
                    placeholder="Please share your complete address"
                    value={address}
                    onChange={(e) => {
                      const val = e.target.value;
                      setAddress(val);
                      // Сагсан дотроос хаягаа өөрчилсөн ч Header-т мэдэгдэнэ
                      localStorage.setItem("deliveryAddress", val);
                      window.dispatchEvent(new Event("addressUpdated"));
                      if (addressError) setAddressError(false);
                    }}
                  />
                  {addressError && (
                    <p className="text-red-500 text-[12px] mt-1">
                      Please complete your address
                    </p>
                  )}
                </div>
              </>
            )
          ) : (
            // Order history хэсэг (Таны хүссэнээр)
            <div className="flex flex-col gap-4">
              <h2 className="text-xl font-bold mb-2">Order history</h2>
              {orders.length === 0 ? (
                <div className="bg-gray-100 rounded-xl p-[32px] flex flex-col items-center justify-center gap-2">
                  <img
                    src="/Logo.svg"
                    alt="empty"
                    className="w-[61px] h-[50px]"
                  />
                  <h3 className="font-bold text-lg">No Orders Yet?</h3>
                  <p className="text-gray-500 text-sm text-center">
                    🍕 You have not placed any orders yet. Start exploring our
                    menu and satisfy your cravings!
                  </p>
                </div>
              ) : (
                orders.map((order) => (
                  <div
                    key={order.id}
                    className="p-2 flex flex-col gap-2 border-b border-dashed border-gray-300"
                  >
                    <div className="flex justify-between items-center">
                      <div className="flex items-center gap-3">
                        <span className="font-bold text-lg">
                          ${(order.totalPrice || 0).toFixed(2)}
                        </span>
                        <span className="font-bold text-lg text-gray-400">
                          #{order.id?.slice(-5).toUpperCase()}
                        </span>
                      </div>
                      <span
                        className={`text-[12px] px-3 py-1 rounded-full font-bold border ${
                          order.status === "DELIVERED" ||
                          order.status === "Delivered"
                            ? "border-green-500 text-green-500 bg-green-50"
                            : order.status === "CANCELED" ||
                                order.status === "Canceled"
                              ? "border-gray-400 text-gray-400 bg-gray-50"
                              : "border-red-500 text-red-500 bg-red-50"
                        }`}
                      >
                        {order.status}
                      </span>
                    </div>

                    <div className="flex items-center justify-between gap-1 text-xs text-gray-500">
                      <div className="flex gap-1">
                        <img
                          src="/OrderProductIcon.svg"
                          alt="empty"
                          className="w-[12px] h-[12px]"
                        />
                        <p className="truncate w-40">
                          {order.items
                            ?.map((i: any) => i.food?.foodName || "Unknown")
                            .join(", ")}
                        </p>
                      </div>
                      <span className="ml-2 font-bold text-gray-500">
                        x{" "}
                        {order.items?.reduce(
                          (sum: number, i: any) => sum + i.quantity,
                          0,
                        ) || 0}
                      </span>
                    </div>

                    <div className="flex items-center gap-1 text-xs text-gray-500">
                      <img
                        src="/OrderProductDateIcon.svg"
                        alt="empty"
                        className="w-[12px] h-[12px]"
                      />{" "}
                      <span>{new Date(order.createdAt).toLocaleString()}</span>
                    </div>

                    <p className="flex items-center gap-1 text-xs text-gray-500">
                      <img
                        src="/OrderProductAddressIcon.svg"
                        alt="empty"
                        className="w-[12px] h-[12px]"
                      />
                      {order.address}
                    </p>
                  </div>
                ))
              )}
            </div>
          )}
        </div>

        {/* 3. PAYMENT INFO (Динамик үнийн дүнтэй) */}
        {activeTab === "Cart" && (
          <div className="bg-white text-gray-500 rounded-3xl p-4 sm:p-6 shrink-0">
            <h3 className="font-bold mb-4 text-[20px]">Payment info</h3>
            <div className="space-y-2 text-[16px]">
              <div className="flex justify-between">
                <span>Items</span>
                <span className="font-bold text-black">
                  ${itemsTotal.toFixed(2)}
                </span>
              </div>
              <div className="flex justify-between">
                <span>Shipping</span>
                <span className="font-bold text-black">
                  ${shipping.toFixed(2)}
                </span>
              </div>
              <div className="border-t border-dashed border-gray-300 my-2"></div>
              <div className="flex justify-between text-base">
                <span>Total</span>
                <span className="font-bold text-black">
                  ${total.toFixed(2)}
                </span>
              </div>
            </div>
            <button
              onClick={handleCheckout}
              disabled={cartItems.length === 0}
              className={`w-full py-3 rounded-3xl font-bold mt-6 transition-all duration-200 
    ${
      cartItems.length > 0
        ? "bg-[#ff5252] text-white hover:bg-[black] active:bg-[#e04848] cursor-pointer"
        : "bg-[#fcdbd9] text-white cursor-not-allowed"
    }`}
            >
              Checkout
            </button>
          </div>
        )}
      </div>

      {/* Success Modal */}
      {showSuccess && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center bg-black/60 animate-in fade-in duration-300">
          <div className="bg-white p-6 sm:p-10 rounded-xl shadow-2xl flex flex-col items-center justify-center text-center gap-6 animate-in zoom-in duration-300 mx-4 max-w-lg">
            <h1 className="text-lg sm:text-[24px] font-bold text-black">
              Your order has been successfully placed!
            </h1>
            <img
              src="/illustration.png"
              alt="illustration"
              className="w-auto h-auto object-contain"
            />
            <button
              onClick={onClose}
              className=" bg-gray-100 hover:bg-gray-200 text-black text-xs font-semibold rounded-2xl px-8 py-2.5"
            >
              Back to home
            </button>
          </div>
        </div>
      )}
      {showToast && <Toast message={toastMessage} />}
    </>
  );
};
