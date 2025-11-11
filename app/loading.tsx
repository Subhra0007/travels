"use client";

export default function RootLoading() {
  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-white">
      <div className="h-12 w-12 animate-spin rounded-full border-4 border-green-500 border-t-transparent" />
    </div>
  );
}


