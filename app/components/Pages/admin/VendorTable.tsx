//app/components/pages/admin/VendorTable.tsx
import React from "react";
import { FaEye, FaTrash, FaEdit, FaStar } from "react-icons/fa";

interface Vendor {
  name: string;
  person: string;
  location: string;
  date: string;
  rating: number;
}

const vendors: Vendor[] = [
  { name: "Micro Vends", person: "David Mathews", location: "Australia", date: "20-05-2023", rating: 4 },
  { name: "Synte Soles", person: "Pol Olofsson", location: "New Zealand", date: "11-03-2022", rating: 5 },
  { name: "Zoet Sells", person: "James Baran", location: "Ontario, CA", date: "21-08-2022", rating: 3 },
  { name: "Circular Sales", person: "Zuke Lauren", location: "South Africa", date: "07-11-2019", rating: 5 },
  { name: "Digitrek", person: "Duck Smith", location: "Kenya", date: "30-10-2018", rating: 4 },
];

const VendorTable: React.FC = () => {
  return (
    <div className="bg-sky-50 rounded-xl shadow p-6 mt-6">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-lg font-semibold">Vendors</h2>
        <div className="flex gap-3">
          <button className="px-4 py-2 text-sm bg-gray-100 rounded-lg">Filters</button>
          <button className="px-4 py-2 text-sm bg-green-500 text-white rounded-lg">+ Add Vendor</button>
        </div>
      </div>

      <table className="w-full text-left text-gray-600">
        <thead>
          <tr className="text-sm border-b">
            <th className="py-2">Vendor</th>
            <th>Location</th>
            <th>Associated</th>
            <th>Ratings</th>
            <th className="text-right">Actions</th>
          </tr>
        </thead>
        <tbody>
          {vendors.map((v, i) => (
            <tr key={i} className="border-b hover:bg-gray-50">
              <td className="py-3">
                <p className="font-medium text-gray-800">{v.name}</p>
                <p className="text-xs text-gray-400">{v.person}</p>
              </td>
              <td>{v.location}</td>
              <td>{v.date}</td>
              <td>
                <div className="flex">
                  {Array.from({ length: v.rating }).map((_, i) => (
                    <FaStar key={i} className="text-yellow-400" />
                  ))}
                </div>
              </td>
              <td className="flex justify-end gap-3 text-gray-500">
                <FaEye className="cursor-pointer hover:text-indigo-600" />
                <FaEdit className="cursor-pointer hover:text-green-600" />
                <FaTrash className="cursor-pointer hover:text-red-600" />
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default VendorTable;
