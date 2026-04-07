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
  WandSparkles,
  Heart,
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
  website_url: string | null;
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

function FilterChip({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      onClick={onClick}
      className={`rounded-full px-4 py-2 border text-sm transition ${
        active
          ? "bg-white text-black border-white"
          : "bg-white/5 text-white border-white/10 hover:bg-white/10"
      }`}
    >
      {children}
    </button>
  );
}

function PickerStage({
  spinning,
  displayText,
}: {
  spinning: boolean;
  displayText: string;
}) {
  return (
    <div className="relative rounded-[32px] border border-white/10 bg-gradient-to-b from-white/10 to-white/5 p-5 md:p-8 shadow-2xl overflow-hidden">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_rgba(255,255,255,0.12),_transparent_45%)] pointer-events-none" />
      <div className="relative">
        <div className="text-center text-xs uppercase tracking-[0.25em] text-white/50 mb-4">
          Tonight’s pick
        </div>

        <div className="mx-auto max-w-2xl rounded-[28px] border border-white/10 bg-black/30 px-6 py-10 md:px-10 md:py-14">
          <AnimatePresence mode="wait">
            <motion.div
              key={displayText + String(spinning)}
              initial={{ opacity: 0, y: 18, scale: 0.98 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -18, scale: 0.98 }}
              transition={{ duration: 0.22 }}
              className="text-center"
            >
              <div className="text-sm uppercase tracking-[0.2em] text-white/40 mb-4">
                {spinning ? "Arvotaan..." : "Valinta"}
              </div>
              <div className="text-4xl md:text-6xl font-black tracking-tight leading-none break-words">
                {displayText}
              </div>
            </motion.div>
          </AnimatePresence>
        </div>

        <div className="mt-6 flex items-center justify-center gap-3">
          <div className="h-2 w-2 rounded-full bg-white/40" />
          <div className="h-2 w-2 rounded-full bg-white/70" />
          <div className="h-2 w-2 rounded-full bg-white/40" />
        </div>
      </div>
    </div>
  );
}

export default function Page() {
  const [venues, setVenues] = useState<Venue[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [selectedAreas, setSelectedAreas] = useState<string[]>([]);
  const [selectedVibes, setSelectedVibes] = useState<string[]>([]);
  const [picked, setPicked] = useState<Venue | null>(null);
  const [spinning, setSpinning] = useState(false);
  const [displayText, setDisplayText] = useState("Barpicker");
  const [favoriteIds, setFavoriteIds] = useState<string[]>([]);

  useEffect(() => {
    async function load() {
      try {
        const data = await fetchPlaces();
        setVenues(data);

        const areas = [...new Set(data.map((v) => v.area))];
        setSelectedAreas(areas);
      } catch {
        setError("Datan haku Supabasesta epäonnistui.");
      } finally {
        setLoading(false);
      }
    }

    load();
  }, []);

  useEffect(() => {
    const raw = window.localStorage.getItem("barpicker-favorites");
    if (!raw) return;
    try {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed)) {
        setFavoriteIds(parsed);
      }
    } catch {}
  }, []);

  useEffect(() => {
    window.localStorage.setItem(
      "barpicker-favorites",
      JSON.stringify(favoriteIds)
    );
  }, [favoriteIds]);

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

  const favorites = useMemo(
    () => venues.filter((venue) => favoriteIds.includes(venue.id)),
    [venues, favoriteIds]
  );

  useEffect(() => {
    if (!spinning && !picked) {
      if (filtered.length > 0) {
        setDisplayText("Minne tänään?");
      } else {
        setDisplayText("Ei tuloksia");
      }
    }
  }, [filtered, spinning, picked]);

  function toggleArea(area: string) {
    setSelectedAreas((prev) =>
      prev.includes(area) ? prev.filter((a) => a !== area) : [...prev, area]
    );
    setPicked(null);
  }

  function toggleVibe(vibe: string) {
    setSelectedVibes((prev) =>
      prev.includes(vibe) ? prev.filter((v) => v !== vibe) : [...prev, vibe]
    );
    setPicked(null);
  }

  function resetFilters() {
    setSelectedAreas(allAreas);
    setSelectedVibes([]);
    setPicked(null);
    setDisplayText("Minne tänään?");
  }

  function surpriseMe() {
    if (!venues.length) return;

    const validCombos: { area: string; vibe: string; matches: Venue[] }[] = [];

    for (const area of allAreas) {
      for (const vibe of allVibes) {
        const matches = venues.filter((venue) => {
          return venue.area === area && (venue.vibes || []).includes(vibe);
        });

        if (matches.length > 0) {
          validCombos.push({ area, vibe, matches });
        }
      }
    }

    if (validCombos.length === 0) return;

    const combo = pickRandom(validCombos);

    setSelectedAreas([combo.area]);
    setSelectedVibes([combo.vibe]);
    setPicked(null);
    setSpinning(true);

    const pool = combo.matches.map((v) => v.name);
    let tick = 0;

    const interval = window.setInterval(() => {
      setDisplayText(pool[tick % pool.length]);
      tick += 1;
    }, 90);

    window.setTimeout(() => {
      window.clearInterval(interval);
      const winner = pickRandom(combo.matches);
      setPicked(winner);
      setDisplayText(winner.name);
      setSpinning(false);
    }, 1700);
  }

  function spin() {
    if (!filtered.length || spinning) return;

    setSpinning(true);
    setPicked(null);

    const pool = filtered.map((v) => v.name);
    let tick = 0;

    const interval = window.setInterval(() => {
      setDisplayText(pool[tick % pool.length]);
      tick += 1;
    }, 90);

    window.setTimeout(() => {
      window.clearInterval(interval);
      const winner = pickRandom(filtered);
      setPicked(winner);
      setDisplayText(winner.name);
      setSpinning(false);
    }, 1700);
  }

  function toggleFavorite(venueId: string) {
    setFavoriteIds((prev) =>
      prev.includes(venueId)
        ? prev.filter((id) => id !== venueId)
        : [...prev, venueId]
    );
  }

  function isFavorite(venueId: string) {
    return favoriteIds.includes(venueId);
  }

  return (
    <main className="min-h-screen bg-[radial-gradient(circle_at_top,_rgba(255,255,255,0.08),_transparent_30%),linear-gradient(135deg,#09090b,#111827,#000000)] text-white">
      <div className="max-w-6xl mx-auto px-4 py-6 md:px-8 md:py-10 space-y-6">
        <section className="rounded-[32px] border border-white/10 bg-white/5 backdrop-blur-xl p-5 md:p-8 shadow-2xl">
          <div className="text-center">
            <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-1 text-[11px] uppercase tracking-[0.25em] text-white/70 mb-4">
              <Sparkles className="h-3.5 w-3.5" />
              Barpicker
            </div>

            <h1 className="text-4xl md:text-6xl font-black tracking-tight leading-none max-w-4xl mx-auto">
              Arvo illan baari tai yökerho Helsingistä
            </h1>

            <p className="mt-4 max-w-2xl mx-auto text-white/75 text-base md:text-lg leading-relaxed">
              Barpicker valitsee illan paikan puolestasi. Rajaa alueen tai
              fiiliksen mukaan tai anna sattuman päättää.
            </p>

            <div className="mt-6 flex flex-wrap justify-center gap-3">
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
                onClick={surpriseMe}
                disabled={loading || allAreas.length === 0}
                className="rounded-2xl px-6 py-4 bg-white/10 border border-white/10 hover:bg-white/15 transition"
              >
                <span className="inline-flex items-center">
                  <WandSparkles className="mr-2 h-5 w-5" />
                  Surprise me
                </span>
              </button>

              <button
                onClick={resetFilters}
                className="rounded-2xl px-6 py-4 bg-white/10 border border-white/10 hover:bg-white/15 transition"
              >
                Nollaa suodattimet
              </button>
            </div>
          </div>
        </section>

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
            <div className="space-y-6">
              <div>
                <div className="flex items-center justify-between gap-3 mb-3">
                  <h3 className="font-semibold text-white/85">Alue</h3>
                  <div className="text-sm text-white/50">
                    {selectedAreas.length}/{allAreas.length} valittu
                  </div>
                </div>

                <div className="flex flex-wrap gap-3">
                  {allAreas.map((area) => (
                    <FilterChip
                      key={area}
                      active={selectedAreas.includes(area)}
                      onClick={() => toggleArea(area)}
                    >
                      {area}
                    </FilterChip>
                  ))}
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between gap-3 mb-3">
                  <h3 className="font-semibold text-white/85">Fiilis</h3>
                  <div className="text-sm text-white/50">
                    {selectedVibes.length} valittu
                  </div>
                </div>

                <div className="flex flex-wrap gap-3">
                  {allVibes.map((vibe) => (
                    <FilterChip
                      key={vibe}
                      active={selectedVibes.includes(vibe)}
                      onClick={() => toggleVibe(vibe)}
                    >
                      {vibe}
                    </FilterChip>
                  ))}
                </div>
              </div>
            </div>
          )}
        </section>

        <PickerStage spinning={spinning} displayText={displayText} />

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
                <p className="text-white/60 mt-2">
                  Valitaan illalle sopiva mesta.
                </p>
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
                initial={{ opacity: 0, y: 18, scale: 0.98 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: -18, scale: 0.98 }}
                className="rounded-3xl border border-white/10 bg-gradient-to-br from-white/10 to-white/5 p-6 md:p-8"
              >
                <div className="flex items-start justify-between gap-4 mb-3">
                  <div className="text-sm uppercase tracking-[0.25em] text-white/50">
                    Tämän illan valinta
                  </div>
                  <button
                    onClick={() => toggleFavorite(picked.id)}
                    className={`rounded-full border px-3 py-2 transition ${
                      isFavorite(picked.id)
                        ? "border-white bg-white text-black"
                        : "border-white/10 bg-white/5 text-white hover:bg-white/10"
                    }`}
                    aria-label="Tallenna suosikiksi"
                  >
                    <Heart className={`h-4 w-4 ${isFavorite(picked.id) ? "fill-current" : ""}`} />
                  </button>
                </div>

                <h2 className="text-5xl md:text-6xl font-black tracking-tight mb-4">
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

                <p className="text-lg text-white/80 leading-relaxed mb-5 max-w-2xl">
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

                  {picked.website_url && (
                    <a
                      href={picked.website_url}
                      target="_blank"
                      rel="noreferrer"
                      className="rounded-2xl px-4 py-3 bg-white/10 border border-white/10 inline-flex items-center hover:bg-white/15 transition"
                    >
                      <ExternalLink className="mr-2 h-4 w-4" />
                      Paikan sivu
                    </a>
                  )}

                  <button
                    onClick={spin}
                    className="rounded-2xl px-4 py-3 bg-white/10 border border-white/10 hover:bg-white/15 transition"
                  >
                    Spin again
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </section>

        <section className="rounded-[28px] bg-white/5 border border-white/10 p-6 shadow-xl">
          <div className="flex items-center justify-between gap-3 mb-6">
            <h2 className="text-2xl font-bold">Suosikit</h2>
            <div className="text-sm text-white/50">{favorites.length} tallennettu</div>
          </div>

          {favorites.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-white/15 bg-black/20 p-6 text-white/70">
              Et ole vielä tallentanut suosikkeja. Paina sydäntä voittajakortissa.
            </div>
          ) : (
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {favorites.map((venue) => (
                <div
                  key={venue.id}
                  className="rounded-2xl border border-white/10 bg-black/20 p-4"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <div className="font-semibold text-base">{venue.name}</div>
                      <div className="text-sm text-white/60 mt-1">{venue.area}</div>
                    </div>
                    <button
                      onClick={() => toggleFavorite(venue.id)}
                      className="rounded-full border border-white/10 bg-white/5 p-2 hover:bg-white/10 transition"
                      aria-label="Poista suosikeista"
                    >
                      <Heart className="h-4 w-4 fill-current" />
                    </button>
                  </div>

                  <div className="mt-3 flex flex-wrap gap-2">
                    {(venue.vibes || []).slice(0, 3).map((tag) => (
                      <span
                        key={tag}
                        className="rounded-full bg-white/10 border border-white/10 px-2.5 py-1 text-xs"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>

                  <div className="mt-4 flex flex-wrap gap-2">
                    <a
                      href={venue.google_maps_url}
                      target="_blank"
                      rel="noreferrer"
                      className="rounded-xl px-3 py-2 bg-white text-black text-sm font-semibold inline-flex items-center"
                    >
                      <MapPin className="mr-2 h-4 w-4" />
                      Maps
                    </a>

                    {venue.website_url && (
                      <a
                        href={venue.website_url}
                        target="_blank"
                        rel="noreferrer"
                        className="rounded-xl px-3 py-2 bg-white/10 border border-white/10 text-sm inline-flex items-center hover:bg-white/15 transition"
                      >
                        <ExternalLink className="mr-2 h-4 w-4" />
                        Sivu
                      </a>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
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
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {filtered.map((venue) => (
                <div
                  key={venue.id}
                  className="rounded-2xl border border-white/10 bg-black/20 p-4"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <div className="font-semibold text-base">
                        {venue.name}
                      </div>
                      <div className="text-sm text-white/60 mt-1">
                        {venue.area}
                      </div>
                    </div>
                    <div className="text-sm text-white/70">{venue.price}</div>
                  </div>

                  <div className="mt-3 flex flex-wrap gap-2">
                    {(venue.vibes || []).slice(0, 3).map((tag) => (
                      <span
                        key={tag}
                        className="rounded-full bg-white/10 border border-white/10 px-2.5 py-1 text-xs"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>
      </div>
    </main>
  );
}