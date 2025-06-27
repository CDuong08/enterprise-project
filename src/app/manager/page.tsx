'use client';
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

type SleepData = Record<string, number>;
type GoalData = Record<string, number>;

export default function Dashboard() {
  const [email, setEmail] = useState("");
  const [sleep, setSleep] = useState<SleepData | null>(null);
  const [goals, setGoals] = useState<GoalData | null>(null);
  const [selectedDay, setSelectedDay] = useState<string | null>(null);
  const [isReady, setIsReady] = useState(false);
  const router = useRouter();

  const days = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

  useEffect(() => {
    const isLoggedIn = localStorage.getItem("is_logged_in");
    const storedEmail = localStorage.getItem("user_email");

    if (!isLoggedIn || !storedEmail) {
      router.push("/login");
      return;
    }

    setEmail(storedEmail);
    setIsReady(true);

    fetch("/api/sleep", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email: storedEmail }),
    })
      .then((res) => res.json())
      .then((data) => {
        if (data.success) {
          setSleep(data.sleep);
          setGoals(data.goals);
        } else {
          alert(data.message);
        }
      });
  }, [router]);

  const handleUpdate = async () => {
    if (!selectedDay || !sleep) return;

    const res = await fetch("/api/updateSleep", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        email,
        sleep: { ...sleep },
      }),
    });

    const result = await res.json();
    if (!result.success) {
      alert("Failed to update sleep data.");
    }
  };

  if (!isReady || !sleep || !goals) return null;

  return (
    <div className="flex h-screen">
      {/* Sidebar */}
      <aside className="w-64 bg-black text-white p-4 border-r">
        <h2 className="text-lg font-bold mb-4">Sleep Days</h2>
        <ul>
          {days.map(day => (
            <li
              key={day}
              className={`cursor-pointer mb-2 p-2 rounded ${
                selectedDay === day ? 'bg-blue-600' : 'bg-blue-500 hover:bg-blue-600'
              }`}
              onClick={() => setSelectedDay(day)}
            >
              {day}
            </li>
          ))}
        </ul>
      </aside>

      {/* Main Content */}
      <main className="flex-1 p-6">
        <nav className="flex justify-between mb-6">
          <h1 className="text-2xl font-semibold">Sleep Tracker</h1>
          <button
            onClick={() => {
              localStorage.clear();
              router.push("/login");
            }}
            className="bg-red-500 text-white px-4 py-2 rounded"
          >
            Logout
          </button>
        </nav>

        {selectedDay ? (
          <div>
            <h2 className="text-xl font-semibold mb-4">{selectedDay}'s Sleep</h2>

            <div className="space-y-4">
              <label className="block">
                <span className="text-sm font-medium">Hours Slept:</span>
                <input
                  type="number"
                  min={0}
                  max={24}
                  value={sleep[selectedDay]}
                  onChange={(e) =>
                    setSleep({ ...sleep, [selectedDay]: Number(e.target.value) })
                  }
                  className="mt-1 block w-full p-2 border border-gray-300 rounded-md"
                />
              </label>

              <div>
                <p>Goal: <span className="font-semibold">{goals[selectedDay]} hrs</span></p>
              </div>

              <button
                className="bg-green-600 text-white px-4 py-2 rounded"
                onClick={handleUpdate}
              >
                Save
              </button>
            </div>
          </div>
        ) : (
          <p className="text-gray-600">Select a day to view or update sleep data.</p>
        )}
      </main>
    </div>
  );
}
