"use client";

import React, { useEffect, useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Shuffle,
  MapPin,
  Music4,
  Filter,
  Sparkles,
  RefreshCw,
  ExternalLink,
} from "lucide-react";

const SUPABASE_URL = "https://hdyvkijunirzhrffeblp.supabase.co";
const SUPABASE_KEY = "sb_publishable_s2dWYa7p3Ci9zYn91UmWcQ_p1ncHfot";

type Venue = {
  id: string;
  name: string;
  area: string;
  description: string;
  price: string;
  google_maps_url: string;
  website_url: string;
  vibes: string[];
  active: boolean;
};

async function fetchPlaces(): Promise<Venue[]> {
  const res = await fetch(
    `${SUPABASE_URL}/rest/v1/places?select=*&active=eq.true`,
    {
      headers: {
        apikey: SUPABASE_KEY,
        Authorization: `Bearer ${SUPABASE_KEY}`,
      },
      cache: "no-store",
    }
  );

  if (!res.ok) {
    throw new Error("Paikkojen haku epäonnistui");
  }

  return res.json();
}

function pickRandom<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

export default function Page() {
  const [venues, setVenues] = useState<Venue[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [selectedAreas, setSelectedAreas] = useState<string[]>([]);
  const [selectedVibes, setSelectedVibes] = useState<string[]>([]);
  const [picked, setPicked] = useState<Venue | null>(null);
  const [spinning, setSpinning] = useState(false);

  useEffect(() => {
    async function load() {
      try {
        const data = await fetchPlaces();
        setVenues(data);

        const areas = [...new Set(data.map((v) => v.area))];
        setSelectedAreas(areas);
      } catch (err) {
        setError("Datan haku Supabasesta epäonnistui.");
      } finally {
        setLoading(false);
      }
    }

    load();
  }, []);

  const allAreas = useMemo(
    () => [...new Set(venues.map((v) => v.area))],
    [venues]
  );

  const allVibes = useMemo(
    () => [...new Set(venues.flatMap((v) => v.vibes || []))],
    [venues]
  );

  const filtered = useMemo(() => {
    return venues.filter((venue) => {
      const areaMatch =
        selectedAreas.length === 0 || selectedAreas.includes(venue.area);

      const vibeMatch =
        selectedVibes.length === 0 ||
        selectedVibes.some((vibe) => (venue.vibes || []).includes(vibe));

      return areaMatch && vibeMatch;
    });
  }, [venues, selectedAreas, selectedVibes]);

  function toggleArea(area: string) {
    setSelectedAreas((prev) =>
      prev.includes(area) ? prev.filter((a) => a !== area) : [...prev, area]
    );
  }

  function toggleVibe(vibe: string) {
    setSelectedVibes((prev) =>
      prev.includes(vibe) ? prev.filter((v) => v !== vibe) : [...prev, vibe]
    );
  }

  function spin() {
    if (!filtered.length) return;
    setSpinning(true);
    setPicked(null);

    setTimeout(() => {
      setPicked(pickRandom(filtered));
      setSpinning(false);
    }, 1200);
  }

  function resetFilters() {
    setSelectedAreas(allAreas);
    setSelectedVibes([]);
    setPicked(null);
  }

  return (
    <main className="min-h-screen bg-[radial-gradient(circle_at_top,_rgba(255,255,255,0.08),_transparent_30%),linear-gradient(135deg,#09090b,#111827,#000000)] text-white">
      <div className="max-w-6xl mx-auto px-4 py-6 md:px-8 md:py-10 space-y-6">
        <section className="rounded-[32px] border border-white/10 bg-white/5 p-6 md:p-8 shadow-2xl backdrop-blur-xl">
          <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs uppercase tracking-[0.25em] text-white/70 mb-4">
            <Sparkles className="h-3.5 w-3.5" />
            Barpicker
          </div>

          <h1 className="text-4xl md:text-6xl font-black tracking-tight leading-none">
            Arvo illan baari tai yökerho Helsingistä
          </h1>

          <p className="mt-4 max-w-2xl text-white/75 text-base md:text-lg leading-relaxed">
            Barpicker valitsee illan paikan puolestasi. Rajaa alueen tai fiiliksen
            mukaan tai anna sattuman päättää.
          </p>

          <div className="mt-6 flex flex-wrap gap-3">
            <button
              onClick={spin}
              disabled={!filtered.length || spinning || loading}
              className="rounded-2xl px-6 py-4 bg-white text-black font-semibold disabled:opacity-50"
            >
              <span className="inline-flex items-center">
                {spinning ? (
                  <RefreshCw className="mr-2 h-5 w-5 animate-spin" />
                ) : (
                  <Shuffle className="mr-2 h-5 w-5" />
                )}
                {spinning ? "Arvotaan..." : "Arvo illan paikka"}
              </span>
            </button>

            <button
              onClick={resetFilters}
              className="rounded-2xl px-6 py-4 bg-white/10 border border-white/10"
            >
              Nollaa suodattimet
            </button>
          </div>
        </section>

        <div className="grid gap-6 lg:grid-cols-[1.05fr_0.95fr]">
          <section className="rounded-[28px] bg-white/5 border border-white/10 p-6 shadow-xl">
            <h2 className="text-2xl font-bold flex items-center gap-2 mb-6">
              <Filter className="w-5 h-5" />
              Suodattimet
            </h2>

            {loading ? (
              <div className="text-white/70">Ladataan paikkoja...</div>
            ) : error ? (
              <div className="text-red-300">{error}</div>
            ) : (
              <>
                <div className="mb-6">
                  <h3 className="font-semibold mb-3 text-white/85">Alue</h3>
                  <div className="grid sm:grid-cols-2 gap-3">
                    {allAreas.map((area) => (
                      <label
                        key={area}
                        className="flex items-center gap-3 rounded-2xl border border-white/10 bg-black/20 px-4 py-3 cursor-pointer"
                      >
                        <input
                          type="checkbox"
                          checked={selectedAreas.includes(area)}
                          onChange={() => toggleArea(area)}
                        />
                        <span>{area}</span>
                      </label>
                    ))}
                  </div>
                </div>

                <div>
                  <h3 className="font-semibold mb-3 text-white/85">Fiilis</h3>
                  <div className="flex flex-wrap gap-3">
                    {allVibes.map((vibe) => {
                      const active = selectedVibes.includes(vibe);
                      return (
                        <button
                          key={vibe}
                          onClick={() => toggleVibe(vibe)}
                          className={`rounded-full px-4 py-2 border text-sm ${
                            active
                              ? "bg-white text-black border-white"
                              : "bg-white/5 text-white border-white/10"
                          }`}
                        >
                          {vibe}
                        </button>
                      );
                    })}
                  </div>
                </div>
              </>
            )}
          </section>

          <div className="space-y-6">
            <section className="rounded-[28px] bg-white/5 border border-white/10 p-6 shadow-xl min-h-[320px]">
              <h2 className="text-2xl font-bold mb-6">Arvonnan tulos</h2>

              <AnimatePresence mode="wait">
                {spinning ? (
                  <motion.div
                    key="spinning"
                    initial={{ opacity: 0, scale: 0.96 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.96 }}
                    className="rounded-3xl border border-dashed border-white/20 bg-black/20 p-8 text-center"
                  >
                    <div className="text-6xl mb-4">🎰</div>
                    <p className="text-2xl font-bold">Rullat pyörivät...</p>
                  </motion.div>
                ) : !picked ? (
                  <motion.div
                    key="idle"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="rounded-3xl border border-dashed border-white/20 bg-black/20 p-8 text-center"
                  >
                    <Music4 className="w-12 h-12 mx-auto mb-4 text-white/70" />
                    <p className="text-2xl font-bold">Valmis iltaa varten</p>
                    <p className="text-white/60 mt-2">
                      Paina nappia ja anna sattuman päättää.
                    </p>
                  </motion.div>
                ) : (
                  <motion.div
                    key={picked.id}
                    initial={{ opacity: 0, y: 18 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -18 }}
                    className="rounded-3xl border border-white/10 bg-gradient-to-br from-white/10 to-white/5 p-6 md:p-8"
                  >
                    <div className="text-sm uppercase tracking-[0.25em] text-white/50 mb-3">
                      Tämän illan valinta
                    </div>

                    <h2 className="text-4xl font-black tracking-tight mb-4">
                      {picked.name}
                    </h2>

                    <div className="flex flex-wrap items-center gap-3 mb-4 text-white/75">
                      <div className="flex items-center gap-2">
                        <MapPin className="w-4 h-4" />
                        <span>{picked.area}</span>
                      </div>
                      <span className="rounded-full bg-white text-black px-3 py-1 text-sm font-semibold">
                        {picked.price}
                      </span>
                    </div>

                    <p className="text-lg text-white/80 leading-relaxed mb-5">
                      {picked.description}
                    </p>

                    <div className="flex flex-wrap gap-2 mb-5">
                      {(picked.vibes || []).map((tag) => (
                        <span
                          key={tag}
                          className="rounded-full bg-white/10 border border-white/10 px-3 py-1 text-sm"
                        >
                          {tag}
                        </span>
                      ))}
                    </div>

                    <div className="flex flex-wrap gap-3">
                      <a
                        href={picked.google_maps_url}
                        target="_blank"
                        rel="noreferrer"
                        className="rounded-2xl px-4 py-3 bg-white text-black font-semibold inline-flex items-center"
                      >
                        <MapPin className="mr-2 h-4 w-4" />
                        Avaa Google Maps
                      </a>

                      <a
                        href={picked.website_url}
                        target="_blank"
                        rel="noreferrer"
                        className="rounded-2xl px-4 py-3 bg-white/10 border border-white/10 inline-flex items-center"
                      >
                        <ExternalLink className="mr-2 h-4 w-4" />
                        Paikan sivu
                      </a>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </section>

            <section className="rounded-[28px] bg-white/5 border border-white/10 p-6 shadow-xl">
              <h2 className="text-2xl font-bold mb-6">Mukana arvonnassa</h2>

              {loading ? (
                <div className="text-white/70">Ladataan...</div>
              ) : filtered.length === 0 ? (
                <div className="rounded-2xl border border-dashed border-white/15 bg-black/20 p-6 text-white/70">
                  Näillä suodattimilla ei löytynyt paikkoja.
                </div>
              ) : (
                <div className="grid sm:grid-cols-2 gap-3">
                  {filtered.map((venue) => (
                    <div
                      key={venue.id}
                      className="rounded-2xl border border-white/10 bg-black/20 p-4"
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div>
                          <div className="font-semibold text-base">{venue.name}</div>
                          <div className="text-sm text-white/60 mt-1">
                            {venue.area}
                          </div>
                        </div>
                        <div className="text-sm text-white/70">{venue.price}</div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </section>
          </div>
        </div>
      </div>
    </main>
  );
}