//app/admin/page.tsx
"use client";
import { useEffect } from "react";
import { useRouter } from "next/navigation";
import Sidebar from "../components/Pages/admin/Sidebar";
import Dashboard from "../components/Pages/admin/Dashboard";

const AdminPage = () => {
  const router = useRouter();

  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    if (!storedUser) {
      router.push("/login");
      return;
    }

    const user = JSON.parse(storedUser);
    if (user.accountType !== "admin") {
      router.push("/login");
    }
  }, [router]);

  return (
    <div className="flex h-screen bg-gray-50">
      <Sidebar />
      <div className="flex-1 flex flex-col">
        <main className="flex-1 overflow-y-auto mt-15">
          <Dashboard />
        </main>
      </div>
    </div>
  );
};

export default AdminPage;
