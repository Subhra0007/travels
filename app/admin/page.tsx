import React from "react";
import Sidebar from "../components/Pages/admin/Sidebar";
import Topbar from "../components/Pages/admin/Topbar";
import Dashboard from "../components/Pages/admin/Dashboard";

const AdminPage = () => {
  return (
    <div className="flex h-screen bg-gray-50">
      <Sidebar />
      <div className="flex-1 flex flex-col">
        <Topbar />
        <main className="flex-1 overflow-y-auto">
          <Dashboard />
        </main>
      </div>
    </div>
  );
};

export default AdminPage;
