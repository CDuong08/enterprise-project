'use client';
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { CircularProgressbar, buildStyles } from 'react-circular-progressbar';
import 'react-circular-progressbar/dist/styles.css';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';

type SleepData = Record<string, number>;
type GoalData = Record<string, number>;

export default function Dashboard() {
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [sleep, setSleep] = useState<SleepData | null>(null);
  const [goals, setGoals] = useState<GoalData | null>(null);
  const [selectedDay, setSelectedDay] = useState<string | null>(null);
  const [showChart, setShowChart] = useState(false);

  function animateJump(): void {
    const numAnimations = 16;
    const container = document.getElementById("contain");
    if (!container) return;

    for (let i = 0; i < numAnimations; i++) {
      createAnimation(container, "left");
      createAnimation(container, "right");
    }
  }

  function createAnimation(container: HTMLElement, direction: "left" | "right"): void {
    const elem = document.createElement("div");
    elem.className = "animation";
    elem.innerText = "🥳🎉";
    elem.style.position = "fixed";
    elem.style.fontSize = "32px";
    elem.style.pointerEvents = "none";

    const windowWidth = window.innerWidth;
    const windowHeight = window.innerHeight;

    const startX = direction === "right" ? -50 : windowWidth;
    const startY = Math.floor(Math.random() * windowHeight);

    const endX = direction === "right" ? windowWidth : -50;
    const endY = Math.floor(Math.random() * windowHeight);

    const peakX = Math.floor(Math.random() * windowWidth);
    const peakY = Math.floor(Math.random() * -300) - 100;

    container.appendChild(elem);
    animate(elem, startX, startY, endX, endY, peakX, peakY);
  }

  function animate(
    elem: HTMLElement,
    startX: number,
    startY: number,
    endX: number,
    endY: number,
    peakX: number,
    peakY: number
  ): void {
    let t = 0;
    const intervalId = setInterval(frame, 30);

    function frame(): void {
      if (t >= 100) {
        clearInterval(intervalId);
        if (elem.parentNode) {
          elem.parentNode.removeChild(elem);
        }
      } else {
        const x = quadraticBezier(startX, peakX, endX, t / 100);
        const y = quadraticBezier(startY, peakY, endY, t / 100);
        elem.style.left = `${x}px`;
        elem.style.top = `${y}px`;
        t++;
      }
    }
  }

  function quadraticBezier(p0: number, p1: number, p2: number, t: number): number {
    return (1 - t) * (1 - t) * p0 + 2 * (1 - t) * t * p1 + t * t * p2;
  }

  useEffect(() => {
    if (sleep && goals && selectedDay && sleep[selectedDay] > goals[selectedDay]) {
      animateJump();
    }
  }, [sleep, goals, selectedDay]);

  const days = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];

  useEffect(() => {
    const isLoggedIn = localStorage.getItem("is_logged_in");
    const storedEmail = localStorage.getItem("user_email");

    if (!isLoggedIn || !storedEmail) {
      router.push("/unauthorised");
      return;
    }

    setEmail(storedEmail);

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
    if (!selectedDay || !sleep || !goals) return;

    const sleepHours = sleep[selectedDay];
    const goalHours = goals[selectedDay];

    if (sleepHours > 24 || sleepHours < 0) {
      alert("Sleep hours must be between 0 and 24.");
      return;
    }

    if (goalHours > 24 || goalHours < 1) {
      alert("Goal hours must be between 1 and 24.");
      return;
    }

    const res = await fetch("/api/updateSleep", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        email,
        sleep,
        goals,
      }),
    });

    const result = await res.json();
    if (!result.success) {
      alert("Failed to update sleep data.");
    } else {
      alert("Sleep data updated successfully!");
    }
  };

  const percentage =
    selectedDay && sleep && goals && goals[selectedDay] !== 0
      ? Math.round((sleep[selectedDay] / goals[selectedDay]) * 100)
      : 0;

  const chartData =
    sleep && goals
      ? days.map(day => ({
          day,
          Sleep: sleep[day] ?? 0,
          Goal: goals[day] ?? 0,
        }))
      : [];

  return (
    <div className="flex h-screen relative">
      {/* Sidebar */}
      <aside className="w-64 bg-blue-500 text-white p-4 border-r">
        <h2 className="text-lg font-bold mb-4">Sleep Days</h2>
        <ul>
          {days.map(day => (
            <li
              key={day}
              className={`cursor-pointer mb-2 p-2 rounded ${
                selectedDay === day
                  ? 'bg-green-600'
                  : 'bg-green-600 hover:bg-green-300'
              }`}
              onClick={() => setSelectedDay(day)}
            >
              {day}
            </li>
          ))}
          <li className="mb-2">
            <button
              className="bg-purple-500 text-white px-3 py-2 rounded hover:bg-purple-600 w-full"
              onClick={() => setShowChart(!showChart)}
            >
              {showChart ? "Hide Weekly Chart" : "View Weekly Chart"}
            </button>
          </li>
        </ul>
      </aside>

      {/* Main Content */}
      <main className="flex-1 p-6 bg-blue-500 overflow-auto">
        <div className="mb-6 flex flex-col gap-1">
          <nav>
            <h1 className="text-2xl font-semibold text-white mb-1">
              Sleep Tracker
            </h1>
            <p>Logged in as: {email}</p>
          </nav>
          <button
            onClick={() => {
              localStorage.clear();
              router.push("/");
            }}
            className="bg-red-500 text-white px-4 py-2 rounded mt-2 cursor-pointer hover:bg-red-600"
          >
            Logout
          </button>
          <button
            onClick={() => router.push("/edit")}
            className="bg-yellow-500 text-white px-4 py-2 rounded mt-2 cursor-pointer hover:bg-yellow-600"
          >
            Edit account details
          </button>
          <button
            onClick={() => router.push("/feedback")}
            className="bg-green-500 text-white px-4 py-2 rounded mt-2 cursor-pointer hover:bg-green-600"
          >
            Give us feedback
          </button>
        </div>

        {selectedDay ? (
          <div>
            <h2 className="text-xl font-semibold mb-4">{selectedDay}'s Sleep</h2>

            <div className="space-y-4">
              <label className="block">
                <span className="text-sm font-medium">Hours Slept:</span>
                <input
                  value={sleep ? sleep[selectedDay] ?? 0 : 0}
                  onChange={(e) => {
                    let value = e.target.value;
                    if (!/^\d*$/.test(value)) return;
                    setSleep({
                      ...sleep,
                      [selectedDay]: Number(value),
                    });
                  }}
                  className="mt-1 block w-full p-2 border border-gray-300 rounded-md"
                />
              </label>

              <label className="block">
                <span className="text-sm font-medium">Goal:</span>
                <input
                  value={goals ? goals[selectedDay] ?? 0 : 0}
                  onChange={(e) => {
                    let value = e.target.value;
                    if (!/^\d*$/.test(value)) return;
                    setGoals({
                      ...goals,
                      [selectedDay]: Number(value),
                    });
                  }}
                  className="mt-1 block w-full p-2 border border-gray-300 rounded-md"
                />
              </label>

              {sleep && goals && selectedDay && (
                <div className="mb-4">
                  {goals[selectedDay] === 0 ? (
                    <span className="text-yellow-100 font-semibold">
                      ⚠️ Goal is set to 0. Please set a valid goal.
                    </span>
                  ) : sleep[selectedDay] === goals[selectedDay] ? (
                    <span className="text-green-200 font-semibold">
                      ✅ You met your goal!
                    </span>
                  ) : sleep[selectedDay] > goals[selectedDay] ? (
                    <span className="text-green-200 font-semibold">
                      🥳 You beat your goal!
                    </span>
                  ) : (
                    <span className="text-yellow-100 font-semibold">
                      ❌ You are under your goal by{" "}
                      {goals[selectedDay] - sleep[selectedDay]} hours
                    </span>
                  )}
                </div>
              )}

              <div
                style={{
                  width: 100,
                  height: 100,
                  marginTop: 16,
                  justifySelf: "center",
                }}
              >
                <CircularProgressbar
                  value={percentage > 100 ? 100 : percentage}
                  text={`${percentage}%`}
                  styles={buildStyles({
                    pathColor: percentage >= 100 ? "green" : percentage >= 50 && percentage < 100 ? "orange" : percentage < 50 ? "red" : "gray",
                    textColor: "white",
                    trailColor: "#d6d6d6",
                  })}
                />
              </div>

              <button
                className="bg-green-600 text-white px-4 py-2 rounded mx-auto block hover:bg-green-700 cursor-pointer"
                onClick={handleUpdate}
              >
                Save
              </button>
            </div>
          </div>
        ) : (
          <p className="text-gray-100">
            Select a day to view or update sleep data.
          </p>
        )}

        {showChart && (
          <div className="bg-white p-4 rounded mt-8 w-full h-[400px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="day" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="Goal" fill="#8884d8" />
                <Bar dataKey="Sleep" fill="#82ca9d" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        )}
      </main>

      {/* Animation container */}
      <div id="contain" className="fixed top-0 left-0 w-full h-full pointer-events-none"></div>
    </div>
  );
}
