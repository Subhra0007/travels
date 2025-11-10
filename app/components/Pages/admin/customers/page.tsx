"use client";
import React, { useEffect, useState } from "react";

interface User {
  _id: string;
  fullName: string;
  email: string;
  contactNumber: string;
  age: number;
  createdAt: string;
}

const UserTable: React.FC = () => {
  const [users, setUsers] = useState<User[]>([]);

  useEffect(() => {
    const fetchUsers = async () => {
      const res = await fetch("/api/admin/users");
      const data = await res.json();
      if (data.success) setUsers(data.users);
    };
    fetchUsers();
  }, []);

  return (
    <div className="bg-white rounded-xl shadow p-6 mt-6">
      <h2 className="text-lg font-semibold mb-4">All Customers</h2>

      <table className="w-full text-left text-gray-600">
        <thead>
          <tr className="border-b text-sm text-gray-700">
            <th className="py-2">Name</th>
            <th>Email</th>
            <th>Mobile</th>
            <th>Age</th>
            <th>Signup Date</th>
          </tr>
        </thead>
        <tbody>
          {users.map((u) => (
            <tr key={u._id} className="border-b hover:bg-gray-50">
              <td className="py-3 font-medium text-gray-800">{u.fullName}</td>
              <td>{u.email}</td>
              <td>{u.contactNumber}</td>
              <td>{u.age}</td>
              <td>{new Date(u.createdAt).toLocaleString("en-IN")}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default UserTable;
