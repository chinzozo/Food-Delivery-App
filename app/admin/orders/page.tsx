/* eslint-disable react-hooks/set-state-in-effect */
/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";
import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";

export default function AdminOrders() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedOrderId, setSelectedOrderId] = useState<string | null>(null);
  const [newStatus, setNewStatus] = useState("");
  const router = useRouter();
  const [orders, setOrders] = useState<any[]>([]);
  const [expandedOrders, setExpandedOrders] = useState<string[]>([]);
  const [selectedOrders, setSelectedOrders] = useState<string[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const ITEMS_PER_PAGE = 12;
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");

  // Хуудас ачаалагдахад localStorage-оос датаг сэргээх
  useEffect(() => {
    const savedOrders = localStorage.getItem("adminOrderCache");
    if (savedOrders) {
      setOrders(JSON.parse(savedOrders));
    }
  }, []);

  // API-аас дата татах
  const fetchOrders = async () => {
    const token = localStorage.getItem("token");
    if (!token) {
      router.push("/login");
      return;
    }
    try {
      const res = await fetch("/api/orders", {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        const data = await res.json();
        setOrders(data);
        localStorage.setItem("adminOrderCache", JSON.stringify(data));
      }
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  // Pagination логик
  // Огноогоор шүүх логик
  const filteredOrders = orders.filter((order) => {
    if (!startDate && !endDate) return true; // Шүүлтүүр хоосон бол бүгдийг харуулна

    const orderTime = new Date(order.createdAt).getTime();

    // Эхлэх огноо (00:00:00)
    const startTime = startDate ? new Date(startDate).setHours(0, 0, 0, 0) : 0;

    // Дуусах огноо (23:59:59)
    const endTime = endDate
      ? new Date(endDate).setHours(23, 59, 59, 999)
      : 9999999999999;

    return orderTime >= startTime && orderTime <= endTime;
  });

  // Pagination-ийг filteredOrders ашигладаг болгох

  const totalPages = Math.max(
    1,
    Math.ceil(filteredOrders.length / ITEMS_PER_PAGE),
  );
  const currentOrders = filteredOrders.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE,
  );

  // Шүүлтүүр өөрчлөгдөхөд хуудсыг 1 рүү буцаана
  useEffect(() => {
    setCurrentPage(1);
  }, [startDate, endDate]);

  const toggleSelectAll = () => {
    setSelectedOrders(
      selectedOrders.length === orders.length ? [] : orders.map((o) => o.id),
    );
  };

  const handleStatusChange = async (id: string, newStatus: string) => {
    const token = localStorage.getItem("token");
    if (!token) {
      router.push("/login");
      return;
    }
    try {
      const res = await fetch("/api/orders", {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ id, status: newStatus }),
      });

      if (res.ok) {
        setOrders((prev) => {
          const updated = prev.map((o) =>
            o.id === id ? { ...o, status: newStatus } : o,
          );
          localStorage.setItem("adminOrderCache", JSON.stringify(updated));
          return updated;
        });
      } else if (res.status === 401) {
        router.push("/login");
      }
    } catch (err) {
      console.error("Status update error:", err);
    }
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
          <button
            onClick={() => router.push("/admin")}
            className="bg-neutral-100 text-neutral-600 px-3 py-1.5 rounded-3xl text-xs font-medium"
          >
            Food menu
          </button>
          <button className="bg-black text-white px-3 py-1.5 rounded-3xl text-xs font-medium">
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
            <button
              onClick={() => router.push("/admin")}
              className="w-full flex items-center gap-[10px] text-neutral-500 hover:bg-neutral-100 px-[40px] py-2.5 rounded-3xl font-medium text-sm transition shadow-sm cursor-pointer"
            >
              <img src="/DashboardIcon.svg" alt="" /> Food menu
            </button>
            <button
              onClick={() => router.push("/admin/orders")}
              className="w-full flex items-center gap-[10px] bg-black text-white px-[40px] py-2.5 rounded-3xl font-medium text-sm transition shadow-sm cursor-pointer"
            >
              <img src="/TruckIcon.svg" alt="" />
              Orders
            </button>
          </nav>
        </div>
      </aside>

      <main className="flex-1 p-4 sm:p-6 md:p-8 space-y-6 md:space-y-8 overflow-y-auto max-w-[1200px] mx-auto w-full">
        <div className="bg-white p-4 sm:p-6 md:p-8 rounded-2xl border border-neutral-100 shadow-sm overflow-x-auto">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
            <div className=" ml-4 mb-6">
              <h1 className="text-2xl font-bold">Orders</h1>
              <span className="text-sm text-neutral-500">
                {orders.length} items total
              </span>
            </div>
            <div className="ml-4 mb-6 flex flex-wrap gap-4 items-end">
              <div className="flex items-center gap-2 bg-white border border-neutral-200 px-4 py-2 rounded-3xl shadow-sm">
                <input
                  type="date"
                  className="outline-none text-sm text-neutral-600"
                  onChange={(e) => setStartDate(e.target.value)}
                  value={startDate}
                />
                <span className="text-neutral-300">-</span>
                <input
                  type="date"
                  className="outline-none text-sm text-neutral-600"
                  onChange={(e) => setEndDate(e.target.value)}
                  value={endDate}
                />
              </div>

              {(startDate || endDate) && (
                <button
                  onClick={() => {
                    setStartDate("");
                    setEndDate("");
                  }}
                  className="text-xs text-red-500 hover:underline px-2 cursor-pointer"
                >
                  Clear
                </button>
              )}
              <div>
                <button
                  disabled={selectedOrders.length === 0}
                  onClick={() => {
                    setSelectedOrderId(null); // Олноор засах горим
                    setNewStatus("PENDING");
                    setIsModalOpen(true);
                  }}
                  className={` flex items-center px-4 py-2 rounded-full text-[14px] font-semibold shadow-sm transition-all ${
                    selectedOrders.length > 0
                      ? "bg-black text-white hover:bg-neutral-800 cursor-pointer"
                      : "bg-neutral-100 text-neutral-400 cursor-not-allowed border border-neutral-200"
                  }`}
                >
                  Change delivery state{" "}
                  {selectedOrders.length > 0
                    ? `(${selectedOrders.length})`
                    : ""}
                </button>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-[40px_80px_160px_120px_150px_100px_1fr_150px] min-w-[1000px] gap-4 px-4 pb-4 border-b border-neutral-100 text-[14px] font-bold text-neutral-400">
            <div>
              <input
                type="checkbox"
                onChange={toggleSelectAll}
                checked={
                  selectedOrders.length === orders.length && orders.length > 0
                }
              />
            </div>
            <div>№</div>
            <div>Customer</div>
            <div>Food</div>
            <div>Date</div>
            <div>Total</div>
            <div className="flex ">Delivery Address</div>
            <div className="text-right"> Delivery State</div>
          </div>

          {currentOrders.map((order: any) => (
            <React.Fragment key={order.id}>
              <div className="grid grid-cols-[40px_80px_160px_120px_150px_100px_1fr_150px] min-w-[1000px] gap-4 items-center px-4 py-6 border-b border-neutral-50 text-sm">
                <div>
                  <input
                    type="checkbox"
                    checked={selectedOrders.includes(order.id)}
                    onChange={() =>
                      setSelectedOrders((prev) =>
                        prev.includes(order.id)
                          ? prev.filter((i) => i !== order.id)
                          : [...prev, order.id],
                      )
                    }
                  />
                </div>
                <div className="font-bold text-neutral-400">
                  #{order.id.slice(-5).toUpperCase()}
                </div>
                <div className="truncate font-medium">
                  {order.buyer?.email || "Anonymous"}
                </div>
                <div
                  className="flex items-center gap-2 cursor-pointer"
                  onClick={() =>
                    setExpandedOrders((prev) =>
                      prev.includes(order.id)
                        ? prev.filter((id) => id !== order.id)
                        : [...prev, order.id],
                    )
                  }
                >
                  {order.items?.length} foods{" "}
                  <span className="text-[10px]">
                    <img src="/chevrondown.svg" alt="" />
                  </span>
                </div>
                <div>{new Date(order.createdAt).toLocaleDateString()}</div>
                <div className="">${(order.totalPrice || 0).toFixed(2)}</div>
                <div className="text-neutral-500 truncate text-xs">
                  {order.address || "No address provided"}
                </div>
                <div className="text-right">
                  <select
                    value={order.status}
                    onChange={(e) =>
                      handleStatusChange(order.id, e.target.value)
                    }
                    className={`text-[10px] font-bold px-3 py-2 rounded-full cursor-pointer outline-none border transition-all ${
                      order.status === "PENDING"
                        ? "border-red-500 text-red-500 bg-red-50"
                        : order.status === "DELIVERED"
                          ? "border-green-500 text-green-500 bg-green-50"
                          : "border-gray-400 text-gray-400 bg-gray-50"
                    }`}
                  >
                    <option value="PENDING">PENDING</option>
                    <option value="DELIVERED">DELIVERED</option>
                    <option value="CANCELED">CANCELED</option>
                  </select>
                </div>
              </div>

              {expandedOrders.includes(order.id) && (
                <div className="px-12 py-4 bg-neutral-50 border-b border-neutral-100 min-w-[1000px]">
                  <div className="flex gap-4">
                    {order.items?.map((item: any) => (
                      <div
                        key={item.food.id}
                        className="flex flex-col items-center gap-1 w-20"
                      >
                        <Image
                          src={
                            item.food.image
                              ? item.food.image
                              : "/placeholder.jpg"
                          }
                          alt={item.food.foodName}
                          width={48}
                          height={48}
                          unoptimized
                          className="w-12 h-12 rounded-lg object-cover"
                        />
                        <span className="text-[9px] text-center truncate w-full">
                          {item.food.foodName}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </React.Fragment>
          ))}

          {/* Pagination Controls */}
          {orders.length > 0 && (
            <div className="flex justify-end items-center gap-3 mt-8 pb-4">
              <button
                onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                disabled={currentPage === 1}
                className="px-4 py-2 text-sm font-medium text-neutral-500 bg-white border border-neutral-200 rounded-xl hover:bg-neutral-50 disabled:opacity-50 transition-all shadow-sm cursor-pointer"
              >
                Previous
              </button>

              <div className="flex gap-2">
                {Array.from({ length: totalPages }, (_, i) => i + 1).map(
                  (page) => (
                    <button
                      key={page}
                      onClick={() => setCurrentPage(page)}
                      className={`w-10 h-10 flex items-center justify-center rounded-xl text-sm font-bold transition-all cursor-pointer ${
                        currentPage === page
                          ? "bg-black text-white shadow-md scale-105"
                          : "bg-white text-neutral-500 border border-neutral-100 hover:bg-neutral-50"
                      }`}
                    >
                      {page}
                    </button>
                  ),
                )}
              </div>

              <button
                onClick={() =>
                  setCurrentPage((p) => Math.min(totalPages, p + 1))
                }
                disabled={currentPage === totalPages}
                className="px-4 py-2 text-sm font-medium text-neutral-500 bg-white border border-neutral-200 rounded-xl hover:bg-neutral-50 disabled:opacity-50 transition-all shadow-sm cursor-pointer"
              >
                Next
              </button>
            </div>
          )}
        </div>
      </main>
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white p-6 sm:p-8 rounded-2xl shadow-xl w-full max-w-md">
            <div className="flex justify-between items-center mb-6">
              <p className="text-[14px] font-bold">Change delivery state</p>{" "}
              <button
                onClick={() => setIsModalOpen(false)}
                className="text-neutral-400 hover:text-black w-8 h-8 flex items-center justify-center bg-neutral-100 rounded-full transition-colors ml-4"
              >
                <span className="text-lg">✕</span>
              </button>
            </div>
            <div className="flex flex-wrap gap-3 mb-8 text-[12px]">
              {["DELIVERED", "PENDING", "CANCELED"].map((status) => (
                <button
                  key={status}
                  onClick={() => setNewStatus(status)}
                  className={`px-4 py-2 rounded-full font-bold transition-all border cursor-pointer ${
                    newStatus === status
                      ? status === "PENDING"
                        ? "border-red-500 text-red-500 bg-red-50"
                        : status === "DELIVERED"
                          ? "border-green-500 text-green-500 bg-green-50"
                          : "border-gray-400 text-gray-400 bg-gray-50"
                      : "bg-neutral-50 border-transparent text-neutral-400"
                  }`}
                >
                  {status}
                </button>
              ))}
            </div>

            <button
              onClick={async () => {
                if (selectedOrderId) {
                  await handleStatusChange(selectedOrderId, newStatus);
                } else if (selectedOrders.length > 0) {
                  // Сонгосон бүх захиалгыг шинэчлэх
                  await Promise.all(
                    selectedOrders.map((id) =>
                      handleStatusChange(id, newStatus),
                    ),
                  );
                  setSelectedOrders([]); // Сонголтыг цэвэрлэх
                }
                setIsModalOpen(false);
              }}
              className="w-full bg-black text-white py-2 rounded-3xl font-semibold cursor-pointer hover:bg-neutral-800 transition-all shadow-sm"
            >
              Save
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
