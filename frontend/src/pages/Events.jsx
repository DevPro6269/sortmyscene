import { useEffect, useState } from "react";
import client from "../api/client";
import EventCard from "../components/EventCard";
import Banner from "../components/Banner";

export default function Events() {
  const [events, setEvents] = useState([]);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    client.get("/events")
      .then((res) => setEvents(res.data))
      .catch((err) => setError(err.response?.data?.error || "Failed to load events"))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <p>Loading events...</p>;

  return (
    <div>
      <h1 className="mb-4 text-2xl font-bold">Events</h1>
      <Banner type="error" onClose={() => setError("")}>{error}</Banner>
      <div className="mt-4 grid gap-4 sm:grid-cols-2">
        {events.map((e) => <EventCard key={e._id} event={e} />)}
      </div>
      {!loading && events.length === 0 && (
        <p className="mt-8 text-center text-gray-500">No events available.</p>
      )}
    </div>
  );
}
