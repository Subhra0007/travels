"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { FaShoppingCart, FaArrowLeft, FaBolt } from "react-icons/fa";
import PageLoader from "../../components/common/PageLoader";
import { useCart } from "../../hooks/useCart";

type ProductVariant = {
  _id?: string;
  color: string;
  size: string;
  stock: number;
  photos: string[];
  price?: number;
};

type Product = {
  _id: string;
  name: string;
  category: string;
  description: string;
  basePrice: number;
  images: string[];
  variants?: ProductVariant[];
  tags?: string[];
  stock?: number; // Add stock field for non-variant products
  outOfStock?: boolean;
};

export default function ProductDetailPage() {
  const params = useParams();
  const productId = params.id as string;
  const [loading, setLoading] = useState(true);
  const [product, setProduct] = useState<Product | null>(null);
  const [selectedVariant, setSelectedVariant] = useState<ProductVariant | null>(null);
  const [selectedImage, setSelectedImage] = useState(0);
  const { addToCart } = useCart();
  const [adding, setAdding] = useState(false);

  useEffect(() => {
    loadProduct();
  }, [productId]);

  const loadProduct = async () => {
    if (!productId) {
      setLoading(false);
      return;
    }

    try {
      const res = await fetch(`/api/products/${productId}`, {
        cache: "no-store",
      });
      
      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        throw new Error(errorData?.message || `Failed to load product: ${res.status} ${res.statusText}`);
      }

      const data = await res.json();
      if (!data.success) {
        throw new Error(data?.message || "Failed to load product");
      }

      if (!data.product) {
        throw new Error("Product data is missing");
      }

      setProduct(data.product);
      if (data.product.variants && data.product.variants.length > 0) {
        const firstAvailable = data.product.variants.find((variant: ProductVariant) => variant.stock > 0) || data.product.variants[0];
        setSelectedVariant(firstAvailable);
      }
      } catch (error: unknown) {
      console.error("Failed to load product:", error);
      setProduct(null);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <PageLoader />;
  }

  if (!product) {
    return (
      <div className="min-h-screen bg-gray-50 pt-24 pb-12 flex items-center justify-center">
        <div className="text-center">
          <p className="text-lg text-gray-600 mb-4">Product not found</p>
          <Link
            href="/services/products"
            className="inline-flex items-center gap-2 text-green-600 hover:text-green-700"
          >
            <FaArrowLeft /> Back to Products
          </Link>
        </div>
      </div>
    );
  }

  const displayImages = selectedVariant?.photos?.length
    ? selectedVariant.photos
    : product.images;
  const displayPrice = selectedVariant?.price || product.basePrice;
  const hasVariants = product.variants && product.variants.length > 0;
  const baseStock = typeof product.stock === "number" ? product.stock : null;
  const variantAvailable = hasVariants ? Boolean(selectedVariant && selectedVariant.stock > 0) : true;
  const baseProductAvailable = !hasVariants ? !(product.outOfStock || (baseStock !== null && baseStock <= 0)) : true;
  const isPurchasable = hasVariants ? variantAvailable : baseProductAvailable;

  // Format category name
  const getCategoryName = (category: string) => {
    return category
      .split("-")
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(" ");
  };

  const COLOR_MAP: Record<string, string> = {
    red: "#ff0000",
    blue: "#0000ff",
    green: "#008000",
    black: "#000000",
    white: "#ffffff",
    yellow: "#ffff00",
    purple: "#800080",
    orange: "#ffa500",
    pink: "#ffc0cb",
    gray: "#808080",
    grey: "#808080",
    brown: "#a52a2a",
    cyan: "#00ffff",
    magenta: "#ff00ff",
    teal: "#008080",
    violet: "#8a2be2",
    indigo: "#4b0082",
  };

  const getColorValue = (color: string) => {
    const c = (color || "").trim().toLowerCase();
    if (/^#([0-9a-f]{3}|[0-9a-f]{6})$/i.test(c)) return c;
    return COLOR_MAP[c] || c || "transparent";
  };

  return (
    <div className="min-h-screen bg-gray-50 pt-24 pb-12">
      <div className="mx-auto max-w-7xl px-6  lg:px-2">
        <Link
          href="/services/products"
          className="inline-flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-6"
        >
          <FaArrowLeft /> Back to Products
        </Link>

        <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 p-8">
            {/* Images */}
            <div className="space-y-4">
              <div className="relative aspect-square w-full rounded-lg overflow-hidden bg-gray-100">
                {displayImages && displayImages.length > 0 ? (
                  <Image
                    src={displayImages[selectedImage]}
                    alt={product.name}
                    fill
                    className="object-cover"
                    sizes="(max-width: 768px) 100vw, 50vw"
                  />
                ) : (
                  <div className="flex items-center justify-center h-full text-gray-400">
                    No image
                  </div>
                )}
              </div>
              {displayImages && displayImages.length > 1 && (
                <div className="grid grid-cols-4 gap-2">
                  {displayImages.map((img, idx) => (
                    <button
                      key={idx}
                      onClick={() => setSelectedImage(idx)}
                      className={`relative aspect-square rounded-lg overflow-hidden border-2 ${
                        selectedImage === idx ? "border-green-600" : "border-gray-200"
                      }`}
                    >
                      <Image
                        src={img}
                        alt={`${product.name} ${idx + 1}`}
                        fill
                        className="object-cover"
                        sizes="(max-width: 768px) 25vw, 12.5vw"
                      />
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Product Info */}
            <div className="space-y-6">
              <div>
                <span className="inline-block rounded-full bg-green-100 px-4 py-1 text-sm font-semibold text-green-700 mb-3">
                  {getCategoryName(product.category)}
                </span>
                <h1 className="text-3xl font-bold text-gray-900 mb-4">{product.name}</h1>
                <div className="mb-4 flex flex-wrap items-center gap-3">
                  <p className="text-2xl font-bold text-green-600">₹{displayPrice.toLocaleString()}</p>
                  {!isPurchasable && (
                    <span className="inline-flex items-center rounded-full bg-red-100 px-4 py-1 text-sm font-semibold uppercase tracking-wide text-red-700">
                      Out of Stock
                    </span>
                  )}
                </div>
                <div className="prose max-w-none">
                  <p className="text-gray-700 leading-relaxed text-base mb-4">{product.description}</p>
                </div>
              </div>

              {/* Variants */}
              {hasVariants && (
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold text-gray-900">Select Variant</h3>
                  
                  {/* Color Selection */}
                  <div>
                    <label className="block text-sm font-medium text-gray-900 mb-2">Color</label>
                    <div className="flex flex-wrap gap-2">
                      {Array.from(new Set(product.variants?.map((v) => v.color))).map((color) => {
                        const isSelected = selectedVariant?.color === color;
                        return (
                          <button
                            key={color}
                            onClick={() => {
                              const newVariant = product.variants?.find((v) => v.color === color);
                              if (newVariant) {
                                setSelectedVariant(newVariant);
                                setSelectedImage(0);
                              }
                            }}
                            className={`px-4 py-2 rounded-lg border-2 text-black border-gray-400 ${
                              isSelected
                                ? "border-green-600 bg-green-50"
                                : "border-gray-200 hover:border-gray-500"
                            }`}
                          >
                            <span className="inline-flex items-center gap-2">
                              <span
                                className="h-4 w-4 rounded-full border border-gray-300"
                                style={{ backgroundColor: getColorValue(color) }}
                              />
                              {color}
                            </span>
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {/* Size Selection */}
                  {selectedVariant && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Size</label>
                      <div className="flex flex-wrap gap-2">
                        {product.variants
                          ?.filter((v) => v.color === selectedVariant.color)
                          .map((variant) => {
                            const isSelected = selectedVariant.size === variant.size;
                            return (
                              <button
                                key={variant.size}
                                onClick={() => {
                                  setSelectedVariant(variant);
                                  setSelectedImage(0);
                                }}
                                disabled={variant.stock === 0}
                                className={`px-4 py-2 rounded-lg border-2 text-black border-gray-400 ${
                                  variant.stock === 0
                                    ? "border-gray-200 bg-gray-100 text-gray-400 cursor-not-allowed"
                                    : isSelected
                                    ? "border-green-600 bg-green-50"
                                    : "border-gray-200 hover:border-gray-500"
                                }`}
                              >
                                {variant.size} {variant.stock === 0 && "(Out of Stock)"}
                              </button>
                            );
                          })}
                      </div>
                    </div>
                  )}

                  {selectedVariant && (
                    <div className="bg-gray-50 rounded-lg p-4 space-y-2">
                      <div className="flex justify-between items-center">
                        <span className="text-sm font-medium text-gray-700">Stock Available:</span>
                        <span className={`text-sm font-semibold ${selectedVariant.stock > 0 ? "text-green-600" : "text-red-600"}`}>
                          {selectedVariant.stock} {selectedVariant.stock === 1 ? "item" : "items"}
                        </span>
                      </div>
                      {selectedVariant.price && selectedVariant.price !== product.basePrice && (
                        <div className="flex justify-between items-center">
                          <span className="text-sm font-medium text-gray-700">Variant Price:</span>
                          <span className="text-sm font-semibold text-green-600">₹{selectedVariant.price.toLocaleString()}</span>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              )}

              {/* Product Details Section */}
              <div className="border-t pt-6 space-y-4">
                <h3 className="text-lg font-semibold text-gray-900">Product Details</h3>
                <div className="space-y-3 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Category:</span>
                    <span className="font-medium text-gray-900">{getCategoryName(product.category)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Base Price:</span>
                    <span className="font-medium text-gray-900">₹{product.basePrice.toLocaleString()}</span>
                  </div>
                  {hasVariants && (
                    <div className="flex justify-between">
                      <span className="text-gray-600">Total Variants:</span>
                      <span className="font-medium text-gray-900">{product.variants?.length || 0}</span>
                    </div>
                  )}
                  {!hasVariants && (
                    <div className="flex justify-between">
                      <span className="text-gray-600">Stock:</span>
                      <span className={`font-medium ${baseProductAvailable ? "text-green-600" : "text-red-600"}`}>
                        {product.stock !== undefined
                          ? product.stock > 0
                            ? `${product.stock} in stock`
                            : "Out of stock"
                          : product.outOfStock
                          ? "Out of stock"
                          : "Available"}
                      </span>
                    </div>
                  )}
                </div>
              </div>

              {/* Tags */}
              {product.tags && product.tags.length > 0 && (
                <div className="border-t pt-6">
                  <h3 className="text-sm font-medium text-gray-700 mb-3">Tags</h3>
                  <div className="flex flex-wrap gap-2">
                    {product.tags.map((tag) => (
                      <span
                        key={tag}
                        className="rounded-full bg-green-50 px-3 py-1 text-xs font-medium text-green-700"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Add to Cart and Buy Now Buttons */}
              <div className="space-y-3">
                <button
                  disabled={!isPurchasable || adding}
                  onClick={async () => {
                    if (!isPurchasable) {
                      alert("This product is currently out of stock.");
                      return;
                    }
                    if (product?.variants?.length && !selectedVariant) {
                      alert("Please select a variant before adding to cart.");
                      return;
                    }
                    setAdding(true);
                    try {
                      await addToCart(productId, "Product", 1, selectedVariant?._id);
                      alert("Added to cart!");
                    } catch (err: any) {
                      console.error("Add to cart error:", err);
                      alert(err?.message || "Failed to add to cart. Please log in.");
                    } finally {
                      setAdding(false);
                    }
                  }}
                  className="w-full flex items-center justify-center gap-2 rounded-lg bg-green-600 px-6 py-3 text-white font-semibold hover:bg-green-700 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  <FaShoppingCart /> {adding ? "Adding..." : "Add to Cart"}
                </button>
                <button
                  disabled={!isPurchasable}
                  onClick={() => {
                    if (!isPurchasable) {
                      alert("This product is currently out of stock.");
                      return;
                    }
                    if (product?.variants?.length && !selectedVariant) {
                      alert("Please select a variant before proceeding.");
                      return;
                    }
                    const variantQuery = selectedVariant?._id ? `&variant=${selectedVariant._id}` : "";
                    window.location.href = `/checkout?item=${productId}&type=Product&quantity=1${variantQuery}`;
                  }}
                  className="w-full flex items-center justify-center gap-2 rounded-lg bg-orange-600 px-6 py-3 text-white font-semibold hover:bg-orange-700 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  <FaBolt /> Buy Now
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

