import Image from "next/image";

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-white text-gray-800">
      {/* Hero */}
      <section className="relative h-[400px] flex items-center justify-center">
        <Image
          src="/images/about-hero.jpg"
          alt="About travel"
          fill
          className="object-cover"
        />
        <div className="absolute inset-0 bg-black/50" />
        <h1 className="relative z-10 text-4xl md:text-6xl font-bold text-white">
          About Us
        </h1>
      </section>

      {/* Mission */}
      <section className="max-w-5xl mx-auto px-6 py-16">
        <h2 className="text-3xl font-semibold mb-4">Who We Are</h2>
        <p className="text-gray-600 leading-relaxed mb-6">
          We are passionate travel creators helping explorers discover unique
          destinations, curated experiences, and unforgettable journeys across
          the world.
        </p>
        <p className="text-gray-600 leading-relaxed">
          Our mission is to make travel simple, personal, and extraordinary with
          trusted guidance and crafted itineraries made for every explorer.
        </p>
      </section>

      {/* Stats */}
      <section className="bg-blue-50 py-12">
        <div className="max-w-5xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
          {[
            ["10k+", "Happy Travelers"],
            ["200+", "Destinations"],
            ["8+", "Years Experience"],
            ["500+", "Tours Hosted"],
          ].map(([num, label]) => (
            <div key={num}>
              <p className="text-3xl font-bold text-blue-600">{num}</p>
              <p className="text-gray-600 text-sm">{label}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Team */}
      <section className="max-w-5xl mx-auto px-6 py-16">
        <h2 className="text-3xl font-semibold mb-8">Meet Our Team</h2>
        <div className="grid md:grid-cols-3 gap-8">
          {["team1.jpg", "team2.jpg", "team3.jpg"].map((img) => (
            <div key={img} className="text-center">
              <Image
                src={`/images/${img}`}
                alt="Team Member"
                width={260}
                height={260}
                className="rounded-xl object-cover h-60 w-full"
              />
              <h3 className="font-semibold mt-4">Travel Expert</h3>
              <p className="text-gray-500 text-sm">Tour Planner & Guide</p>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
