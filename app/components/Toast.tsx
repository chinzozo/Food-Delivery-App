// components/Toast.tsx
export const Toast = ({ message }: { message: string }) => {
  return (
    <div className="fixed top-5 left-1/2 -translate-x-1/2 z-[300] bg-white border border-gray-200 shadow-xl px-4 sm:px-6 py-3 rounded-full flex items-center gap-2 animate-in fade-in slide-in-from-top-4 max-w-[calc(100%-2rem)]">
      <span className="text-green-500">✓</span>
      <p className="font-medium text-black text-sm sm:text-base">{message}</p>
    </div>
  );
};
