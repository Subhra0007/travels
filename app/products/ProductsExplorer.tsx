"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { FaSearch, FaShoppingCart } from "react-icons/fa";
import PageLoader from "../components/common/PageLoader";

export type ProductVariant = {
  _id?: string;
  color: string;
  size: string;
  stock: number;
  photos: string[];
  price?: number;
};

export type Product = {
  _id: string;
  name: string;
  category: "jacket" | "t-shirt"  | "book" | "other";
  description: string;
  basePrice: number;
  images: string[];
  variants?: ProductVariant[];
  tags?: string[];
  isActive: boolean;
};

type ProductCardProps = {
  product: Product;
};

const ProductCard = ({ product }: ProductCardProps) => {
  const hasVariants = product.variants && product.variants.length > 0;
  const minPrice = hasVariants && product.variants
    ? Math.min(...product.variants.map((v) => v.price || product.basePrice))
    : product.basePrice;
  const maxPrice = hasVariants && product.variants
    ? Math.max(...product.variants.map((v) => v.price || product.basePrice))
    : product.basePrice;
  const priceDisplay =
    minPrice === maxPrice
      ? `₹${minPrice.toLocaleString()}`
      : `₹${minPrice.toLocaleString()} - ₹${maxPrice.toLocaleString()}`;

  return (
    <Link
      href={`/products/${product._id}`}
      className="group flex flex-col overflow-hidden rounded-2xl bg-white shadow-md transition hover:-translate-y-1 hover:shadow-xl"
    >
      <div className="relative h-64 w-full">
        {product.images && product.images.length ? (
          <Image
            src={product.images[0]}
            alt={product.name}
            fill
            className="object-cover transition duration-500 group-hover:scale-105"
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center bg-gray-200 text-gray-500">
            No image
          </div>
        )}
        <span className="absolute left-4 top-4 rounded-full bg-white/90 px-3 py-1 text-xs font-semibold uppercase text-green-700 shadow">
          {product.category}
        </span>
        {hasVariants && product.variants && (
          <span className="absolute right-4 top-4 rounded-full bg-green-500/90 px-3 py-1 text-xs font-semibold text-white shadow">
            {product.variants.length} Variants
          </span>
        )}
      </div>

      <div className="flex flex-1 flex-col gap-3 p-5 text-gray-900">
        <h3 className="text-lg font-semibold text-gray-900 line-clamp-2">{product.name}</h3>
        <p className="text-sm text-gray-600 line-clamp-2">{product.description}</p>

        {product.tags && product.tags.length > 0 && (
          <div className="flex flex-wrap gap-2">
            {product.tags.slice(0, 3).map((tag) => (
              <span
                key={tag}
                className="rounded-full bg-green-50 px-3 py-1 text-xs font-medium text-green-700"
              >
                {tag}
              </span>
            ))}
          </div>
        )}

        <div className="mt-auto flex items-center justify-between pt-2">
          <span className="text-xl font-bold text-green-600">{priceDisplay}</span>
          <button className="rounded-full bg-green-600 p-2 text-white transition hover:bg-green-700">
            <FaShoppingCart className="text-sm" />
          </button>
        </div>
      </div>
    </Link>
  );
};

export default function ProductsExplorer() {
  const searchParams = useSearchParams();
  const initialCategory = searchParams.get("category") || "all";
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState(initialCategory);
  const [categories, setCategories] = useState<Array<{ value: string; label: string }>>([
    { value: "all", label: "All Products" },
  ]);

  useEffect(() => {
    fetchCategories();
  }, []);

  useEffect(() => {
    fetchProducts();
  }, [selectedCategory, searchQuery]);

  const fetchCategories = async () => {
    try {
      const res = await fetch("/api/categories");
      const data = await res.json();
      if (data.success && data.categories) {
        const categoryOptions = [
          { value: "all", label: "All Products" },
          ...data.categories.map((cat: any) => ({
            value: cat.slug,
            label: cat.name,
          })),
        ];
        setCategories(categoryOptions);
      }
    } catch (error) {
      console.error("Failed to fetch categories:", error);
    }
  };

  const fetchProducts = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (selectedCategory !== "all") {
        params.append("category", selectedCategory);
      }
      if (searchQuery) {
        params.append("search", searchQuery);
      }

      const res = await fetch(`/api/products?${params.toString()}`);
      const data = await res.json();
      if (data.success) {
        setProducts(data.products);
      }
    } catch (error) {
      console.error("Failed to fetch products:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 pt-24 pb-12">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8 text-center">
          <h1 className="text-4xl font-bold text-gray-900">Our Products</h1>
          <p className="mt-2 text-lg text-gray-600">Discover travel essentials and more</p>
        </div>

        {/* Search and Filters */}
        <div className="mb-8 space-y-4">
          {/* Search Bar */}
          <div className="relative">
            <FaSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Search products..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full rounded-full border border-gray-300 bg-white py-3 pl-12 pr-4 shadow-sm focus:border-green-500 focus:outline-none focus:ring-2 focus:ring-green-500 text-black"
            />
          </div>

          {/* Category Tabs */}
          <div className="flex flex-wrap gap-2">
            {categories.map((cat) => (
              <button
                key={cat.value}
                onClick={() => setSelectedCategory(cat.value)}
                className={`rounded-full px-6 py-2 text-sm font-semibold transition ${
                  selectedCategory === cat.value
                    ? "bg-green-600 text-white shadow-md"
                    : "bg-white text-gray-700 hover:bg-gray-100"
                }`}
              >
                {cat.label}
              </button>
            ))}
          </div>
        </div>

        {/* Products Grid */}
        {loading ? (
          <PageLoader fullscreen={false} className="py-20" />
        ) : products.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20">
            <FaShoppingCart className="mb-4 text-6xl text-gray-300" />
            <p className="text-lg text-gray-600">No products found</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {products.map((product) => (
              <ProductCard key={product._id} product={product} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

