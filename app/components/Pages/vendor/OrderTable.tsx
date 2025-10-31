export default function OrderTable() {
  const data = [
    { product: "BoAt 220 Wireless", status: "Pending", price: "₹1,399" },
    { product: "Fitbit Inspire", status: "Delivered", price: "₹4,499" },
    { product: "Men Polo T-Shirt", status: "Delivered", price: "₹1,174" },
  ];

  return (
    <div className="bg-white p-6 rounded-lg shadow text-gray-900">
      <h3 className="font-semibold mb-4">Recent Orders</h3>
      <table className="w-full text-sm">
        <thead className="border-b">
          <tr>
            <th className="py-2 text-left">Product</th>
            <th>Status</th>
            <th>Price</th>
          </tr>
        </thead>
        <tbody>
          {data.map((row, i) => (
            <tr key={i} className="border-b last:border-none">
              <td className="py-2">{row.product}</td>
              <td>
                <span
                  className={`px-2 py-1 rounded text-xs ${
                    row.status === "Delivered"
                      ? "bg-green-100 text-green-600"
                      : "bg-yellow-100 text-yellow-600"
                  }`}
                >
                  {row.status}
                </span>
              </td>
              <td>{row.price}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
