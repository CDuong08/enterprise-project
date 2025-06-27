"use client";
import React from "react";
import { useRouter } from "next/navigation";

export default function GiveFeedback() {
  const router = useRouter();
  function runAnimation(event: React.FormEvent<HTMLFormElement>): void {
    event.preventDefault();
    resetInput();
    animateJump();
    openModal();
  }

  function resetInput(): void {
    const msg = document.getElementById("msg") as HTMLTextAreaElement | null;
    if (msg) {
      msg.value = "";
    }
  }

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

  // Modal setup
  React.useEffect(() => {
    const modal = document.getElementById("modal");
    const span = document.getElementsByClassName("close")[0] as HTMLElement | undefined;

    if (span) {
      span.onclick = () => {
        if (modal) modal.style.display = "none";
      };
    }

    const handleWindowClick = (event: MouseEvent) => {
      if (modal && event.target === modal) {
        modal.style.display = "none";
      }
    };

    window.addEventListener("click", handleWindowClick);

    return () => {
      window.removeEventListener("click", handleWindowClick);
      if (span) span.onclick = null;
    };
  }, []);

  function openModal(): void {
    const modal = document.getElementById("modal");
    if (modal) modal.style.display = "flex";
  }

  return (
    <>
      <div className="flex flex-col items-center justify-center min-h-screen bg-blue-500 p-4">
        <button 
        onClick={() => router.push("/dashboard")}
        className="bg-green-500 text-white px-4 py-4 rounded justify-self-center mt-1 cursor-pointer hover:bg-green-600 mb-6"
        >
            Return to dashboard
        </button>
        <h1 className="text-4xl font-bold mb-6 text-white">Give Feedback</h1>
        <p className="text-4xl font-bold mb-6 text-white">Found a bug? Enjoyed the tracker? Let us know!</p>
            <form
        onSubmit={runAnimation}
        className="bg-white p-6 rounded shadow-md w-full max-w-xl mx-auto text-center"
        >
        <div className="mb-4">
            <label
            htmlFor="msg"
            className="block text-black text-sm font-semibold mb-2 text-center"
            >
            Your Feedback
            </label>
            <textarea
            id="msg"
            required
            rows={5}
            placeholder="Write your feedback here..."
            className="text-black w-full border border-gray-300 rounded-md resize-none p-2"
            />
        </div>
        <button
            type="submit"
            className="w-full mt-4 text-black py-2 bg-green-400 rounded hover:bg-blue-700 cursor-pointer transition-colors"
        >
            Submit Feedback
        </button>
        </form>

      </div>

      {/* Modal */}
        <div id="modal" className="modal" style={{ left: "35vw", top: "45vh" }}>
            <div className="modal-content">
                <div id="contain">
                    <span className="close">&times;</span>
                    <p>Submitted! Thank you for your input.</p>
                </div>
            </div>
        </div>
    </>
  );
}
