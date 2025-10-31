"use client";
export default function Topbar() {
  return (
    <header className="w-full h-16 bg-white border-b px-6 flex items-center justify-between sticky top-0 z-50 text-gray-900">
      <h2 className="text-lg font-semibold">Vendor Dashboard</h2>

      <div className="flex items-center space-x-4">
        <div className="w-8 h-8 bg-gray-300 rounded-full" />
      </div>
    </header>
  );
}
