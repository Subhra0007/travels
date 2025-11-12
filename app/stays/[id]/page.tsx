import { headers } from "next/headers";
import Image from "next/image";
import { notFound } from "next/navigation";
import type { JSX } from "react";
import {
  FaArrowLeft,
  FaBed,
  FaCheck,
  FaMapMarkerAlt,
  FaUsers,
  FaVideo,
  FaSwimmingPool,
  FaWifi,
  FaParking,
  FaSpa,
  FaUtensils,
  FaGlassCheers,
  FaCoffee,
  FaDumbbell,
  FaConciergeBell,
  FaChild,
  FaShieldAlt,
  FaWheelchair,
  FaAccessibleIcon,
  FaBath,
  FaShower,
  FaTv,
  FaSnowflake,
  FaHotjar,
} from "react-icons/fa";
import Link from "next/link";

interface Room {
  name: string;
  description?: string;
  bedType: string;
  beds: number;
  capacity: number;
  price: number;
  size?: string;
  features: string[];
  images: string[];
}

interface Stay {
  _id: string;
  name: string;
  category: "rooms" | "hotels" | "homestays" | "bnbs";
  location: {
    address: string;
    city: string;
    state: string;
    country: string;
    postalCode?: string;
  };
  images: string[];
  gallery: string[];
  videos: { inside: string[]; outside: string[] };
  heroHighlights: string[];
  popularFacilities: string[];
  amenities: Record<string, string[]>;
  rooms: Room[];
  vendorMessage?: string;
  checkInOutRules: {
    checkIn: string;
    checkOut: string;
    rules: string[];
  };
  about: {
    heading: string;
    description: string;
  };
}

async function fetchStay(id: string): Promise<Stay | null> {
  const headersList = await Promise.resolve(headers());
  const host = headersList.get("host");
  if (!host) return null;
  const protocol = host.startsWith("localhost") || host.startsWith("127.0.0.1") ? "http" : "https";
  const res = await fetch(`${protocol}://${host}/api/vendor/stays/${id}`, {
    cache: "no-store",
  });
  if (!res.ok) return null;
  const data = await res.json();
  if (!data?.success || !data?.stay) return null;
  return data.stay as Stay;
}

export default async function StayDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const stay = await fetchStay(id);
  if (!stay) notFound();

  const mainImage = stay.images?.[0] || "https://images.unsplash.com/photo-1505691938895-1758d7feb511?auto=format&fit=crop&w=1600&q=80";
  const secondaryImages = stay.images?.slice(1, 4) || [];
  const highlights = stay.heroHighlights || [];
  const facilityBadges = stay.popularFacilities || [];
  const rooms = stay.rooms || [];
  const amenitiesEntries = Object.entries(stay.amenities || {});
  const facilityIconMap: Record<string, JSX.Element> = {
    pool: <FaSwimmingPool />,
    swimming: <FaSwimmingPool />,
    wifi: <FaWifi />,
    internet: <FaWifi />,
    parking: <FaParking />,
    spa: <FaSpa />,
    restaurant: <FaUtensils />,
    bar: <FaGlassCheers />,
    lounge: <FaGlassCheers />,
    breakfast: <FaCoffee />,
    gym: <FaDumbbell />,
    fitness: <FaDumbbell />,
    concierge: <FaConciergeBell />,
    family: <FaChild />,
    security: <FaShieldAlt />,
    safety: <FaShieldAlt />,
    wheelchair: <FaWheelchair />,
    accessible: <FaAccessibleIcon />,
    bathroom: <FaBath />,
    shower: <FaShower />,
    tv: <FaTv />,
    air: <FaSnowflake />,
    conditioning: <FaSnowflake />,
    sauna: <FaHotjar />,
  };

  const getFacilityIcon = (label: string) => {
    const key = label.toLowerCase();
    const match = Object.entries(facilityIconMap).find(([term]) => key.includes(term));
    return match ? match[1] : <FaCheck />;
  };

  return (
    <div className="min-h-screen bg-sky-50 text-black">
      <header className="relative isolate overflow-hidden bg-linear-to-br from-green-600 via-green-500 to-lime-400 pb-16 pt-20 text-white">
        <div className="absolute inset-0 opacity-20" style={{ backgroundImage: "url('https://images.unsplash.com/photo-1528909514045-2fa4ac7a08ba?auto=format&fit=crop&w=1600&q=80')", backgroundSize: "cover", backgroundPosition: "center" }} />
        <div className="relative mx-auto flex max-w-6xl flex-col gap-10 px-6">
          <Link href="/stays" className="inline-flex w-fit items-center gap-2 rounded-full bg-white/15 px-4 py-2 text-sm text-white backdrop-blur">
            <FaArrowLeft /> Back to stays
          </Link>

          <div className="flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
            <div className="max-w-3xl">
              <p className="uppercase tracking-wide text-white/80">{stay.category}</p>
              <h1 className="mt-2 text-3xl font-bold leading-snug sm:text-4xl md:text-5xl">{stay.name}</h1>
              <p className="mt-3 flex items-center text-base text-white/90">
                <FaMapMarkerAlt className="mr-2" />
                {stay.location.address}, {stay.location.city}, {stay.location.state}
              </p>
              {highlights.length > 0 && (
                <div className="mt-4 flex flex-wrap gap-2">
                  {highlights.slice(0, 4).map((highlight) => (
                    <span
                      key={highlight}
                      className="rounded-full bg-white/20 px-3 py-1 text-xs font-medium text-white shadow"
                    >
                      {highlight}
                    </span>
                  ))}
                </div>
              )}
            </div>

            <form className="w-full max-w-xl rounded-2xl bg-white/95 p-6 text-gray-900 shadow-lg backdrop-blur">
              <h2 className="text-lg font-semibold text-gray-900">Quick availability check</h2>
              <p className="mt-1 text-sm text-gray-600">Default search set to stays.</p>
              <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2">
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wide text-gray-600">Check-in</label>
                  <input type="date" className="mt-1 w-full rounded-lg border border-gray-200 px-3 py-2 text-gray-900 focus:border-green-500 focus:outline-none" />
                </div>
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wide text-gray-600">Check-out</label>
                  <input type="date" className="mt-1 w-full rounded-lg border border-gray-200 px-3 py-2 text-gray-900 focus:border-green-500 focus:outline-none" />
                </div>
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wide text-gray-600">Guests</label>
                  <input type="number" min={1} defaultValue={2} className="mt-1 w-full rounded-lg border border-gray-200 px-3 py-2 text-gray-900 focus:border-green-500 focus:outline-none" />
                </div>
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wide text-gray-600">Email</label>
                  <input type="email" placeholder="you@example.com" className="mt-1 w-full rounded-lg border border-gray-200 px-3 py-2 text-gray-900 focus:border-green-500 focus:outline-none" />
                </div>
                <div className="sm:col-span-2">
                  <button
                    type="button"
                    className="mt-2 w-full rounded-lg bg-green-600 px-4 py-2 text-center text-sm font-semibold text-white shadow hover:bg-green-700"
                  >
                    Enquire availability
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      </header>

      <main className="mx-auto -mt-12 flex max-w-6xl flex-col gap-12 px-6 pb-16">
        <section className="grid gap-4 rounded-3xl bg-white p-6 shadow-xl md:grid-cols-5">
          <div className="relative h-64 w-full overflow-hidden rounded-2xl md:col-span-3">
            <Image src={mainImage} alt={stay.name} fill className="object-cover" priority sizes="(max-width: 768px) 100vw, 60vw" />
          </div>
          <div className="grid gap-4 md:col-span-2">
            {secondaryImages.length ? (
              secondaryImages.map((image, idx) => (
                <div key={image + idx} className="relative h-32 overflow-hidden rounded-2xl">
                  <Image src={image} alt={`Gallery ${idx + 1}`} fill className="object-cover" sizes="(max-width: 768px) 100vw, 40vw" />
                </div>
              ))
            ) : (
              <div className="flex h-full items-center justify-center rounded-2xl bg-gray-100 text-gray-500">
                More images coming soon
              </div>
            )}
          </div>
        </section>

        {facilityBadges.length > 0 && (
          <section className="rounded-3xl bg-white p-6 shadow">
            <h2 className="text-xl font-semibold text-gray-900">Most popular facilities</h2>
            <div className="mt-4 flex flex-wrap gap-3">
              {facilityBadges.map((badge) => (
                <span
                  key={badge}
                  className="inline-flex items-center gap-2 rounded-full bg-green-50 px-4 py-1 text-sm font-medium text-green-700"
                >
                  <span className="text-base leading-none">{getFacilityIcon(badge)}</span>
                  {badge}
                </span>
              ))}
            </div>
          </section>
        )}

        <section className="grid gap-6 rounded-3xl bg-white p-6 shadow md:grid-cols-2">
          <div>
            <h2 className="text-xl font-semibold text-gray-900">About this stay</h2>
            <h3 className="mt-2 text-lg font-semibold text-gray-800">{stay.about.heading}</h3>
            <p className="mt-3 text-sm leading-relaxed text-gray-700 whitespace-pre-line">
              {stay.about.description}
            </p>
            {stay.vendorMessage && (
              <div className="mt-4 rounded-2xl bg-green-50 p-4 text-sm text-green-800">
                <p className="font-semibold">Vendor message</p>
                <p className="mt-2 whitespace-pre-line">{stay.vendorMessage}</p>
              </div>
            )}
          </div>
          <div>
            <h2 className="text-xl font-semibold text-gray-900">Check-in & rules</h2>
            <div className="mt-3 space-y-3 rounded-2xl bg-gray-50 p-4 text-sm text-gray-700">
              <p>
                <span className="font-semibold text-gray-900">Check-in:</span> {stay.checkInOutRules.checkIn}
              </p>
              <p>
                <span className="font-semibold text-gray-900">Check-out:</span> {stay.checkInOutRules.checkOut}
              </p>
              {stay.checkInOutRules.rules?.length > 0 && (
                <ul className="mt-2 list-disc space-y-1 pl-5">
                  {stay.checkInOutRules.rules.map((rule, idx) => (
                    <li key={rule + idx}>{rule}</li>
                  ))}
                </ul>
              )}
            </div>
          </div>
        </section>

        <section className="space-y-6">
          <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
            <h2 className="text-xl font-semibold text-gray-900">Room options</h2>
            <p className="text-sm text-gray-600">
              Choose from {rooms.length} curated room{rooms.length === 1 ? "" : "s"} with detailed amenities.
            </p>
          </div>
          <div className="grid gap-6 md:grid-cols-2">
            {rooms.map((room, idx) => (
              <div key={room.name + idx} className="rounded-3xl bg-white p-5 shadow">
                <div className="relative h-48 w-full overflow-hidden rounded-2xl">
                  {room.images?.length ? (
                    <Image
                      src={room.images[0]}
                      alt={room.name}
                      fill
                      className="object-cover"
                      sizes="(max-width: 768px) 100vw, 50vw"
                    />
                  ) : (
                    <div className="flex h-full items-center justify-center bg-gray-100 text-gray-500">
                      Room image coming soon
                    </div>
                  )}
                </div>
                <div className="mt-4 space-y-3 text-gray-800">
                  <div className="flex items-center justify-between">
                    <h3 className="text-lg font-semibold text-gray-900">{room.name}</h3>
                    <span className="rounded-full bg-green-100 px-3 py-1 text-sm font-semibold text-green-700">
                      ₹{room.price.toLocaleString()} / night
                    </span>
                  </div>
                  <div className="flex flex-wrap items-center gap-3 text-sm text-gray-600">
                    <span className="inline-flex items-center gap-1">
                      <FaBed /> {room.bedType} ({room.beds})
                    </span>
                    <span className="inline-flex items-center gap-1">
                      <FaUsers /> Sleeps {room.capacity}
                    </span>
                    {room.size && <span>{room.size}</span>}
                  </div>
                  {room.description && (
                    <p className="text-sm leading-relaxed text-gray-700">{room.description}</p>
                  )}
                  {room.features?.length > 0 && (
                    <div>
                      <p className="text-xs font-semibold uppercase tracking-wide text-gray-600">Highlights</p>
                      <div className="mt-2 flex flex-wrap gap-2 text-xs text-gray-600">
                        {room.features.map((feature) => (
                          <span key={feature} className="rounded-full bg-gray-100 px-3 py-1">
                            {feature}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                  {room.images?.length > 1 && (
                    <div className="mt-3 grid grid-cols-4 gap-2">
                      {room.images.slice(1, 5).map((image, imageIdx) => (
                        <div key={image + imageIdx} className="relative h-20 overflow-hidden rounded-xl">
                          <Image src={image} alt={`${room.name} ${imageIdx + 2}`} fill className="object-cover" />
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </section>

        {amenitiesEntries.length > 0 && (
          <section className="rounded-3xl bg-white p-6 shadow">
            <h2 className="text-xl font-semibold text-gray-900">Amenities & facilities</h2>
            <div className="mt-4 grid gap-6 md:grid-cols-2">
              {amenitiesEntries.map(([category, items]) => (
                <div key={category}>
                  <h3 className="text-sm font-semibold uppercase tracking-wide text-gray-600">{category}</h3>
                  <ul className="mt-3 space-y-2 text-sm text-gray-700">
                    {items.map((item, idx) => (
                      <li key={item + idx} className="flex items-start gap-3">
                        <span className="mt-0.5 text-green-600">{getFacilityIcon(item)}</span>
                        <span className="text-gray-700">{item}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </section>
        )}

        {(stay.videos?.inside?.length || stay.videos?.outside?.length) && (
          <section className="rounded-3xl bg-white p-6 shadow">
            <h2 className="text-xl font-semibold text-gray-900">Experience in motion</h2>
            <div className="mt-4 grid gap-4 md:grid-cols-2">
              {["inside", "outside"].map((key) => (
                <div key={key} className="space-y-3">
                  <h3 className="flex items-center gap-2 text-sm font-semibold uppercase tracking-wide text-gray-600">
                    <FaVideo /> {key === "inside" ? "Inside" : "Outside"} walk-through
                  </h3>
                  {(stay.videos as any)?.[key]?.length ? (
                    (stay.videos as any)[key].map((videoUrl: string, idx: number) => (
                      <video
                        key={videoUrl + idx}
                        controls
                        className="h-48 w-full overflow-hidden rounded-2xl bg-black"
                      >
                        <source src={videoUrl} />
                        Your browser does not support the video tag.
                      </video>
                    ))
                  ) : (
                    <p className="text-sm text-gray-500">Video coming soon.</p>
                  )}
                </div>
              ))}
            </div>
          </section>
        )}
      </main>
    </div>
  );
}
