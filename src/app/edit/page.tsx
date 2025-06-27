"use client";
import { useRouter } from "next/navigation";
import { useState, useEffect } from "react";

export default function EditAccount() {
  const router = useRouter();
  const [currentEmail, setCurrentEmail] = useState("");
  const [newEmail, setNewEmail] = useState("");
  const [newPassword, setNewPassword] = useState("");

  useEffect(() => {
    // Load saved user info on mount
    const storedEmail = localStorage.getItem("user_email");
    const storedPassword = localStorage.getItem("user_password");
    const isLoggedIn = localStorage.getItem("is_logged_in");

    if (!isLoggedIn || !storedEmail) {
      router.push("/unauthorised");
      return;
    }

    setCurrentEmail(storedEmail);
    setNewEmail(storedEmail);
    if (storedPassword) setNewPassword(storedPassword);
  }, [router]);

  const handleUpdate = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    const res = await fetch("/api/updateAccount", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        currentEmail: currentEmail.toLowerCase(),
        newEmail: newEmail.toLowerCase(),
        newPassword,
      }),
    });

    const result = await res.json();

    if (result.success) {
      alert("Account updated successfully!");
      localStorage.setItem("user_email", newEmail);
      localStorage.setItem("user_password", newPassword);
      router.push("/dashboard"); // redirect after update
    } else {
      alert(result.message);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center h-screen bg-blue-500">
      <h1 className="text-4xl font-bold mb-6">Edit Account</h1>
      <form onSubmit={handleUpdate} className="bg-white p-6 rounded shadow-md w-96">
        <div className="mb-4">
          <label htmlFor="email" className="block text-black text-sm">New Email</label>
          <input
            type="email"
            id="email"
            required
            value={newEmail}
            onChange={(e) => setNewEmail(e.target.value)}
            className="text-black mt-1 block w-full border border-gray-300 rounded-md"
          />
        </div>
        <div className="mb-4">
          <label htmlFor="password" className="block text-black text-sm">New Password</label>
          <input
            id="password"
            required
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            className="text-black mt-1 block w-full border border-gray-300 rounded-md"
          />
        </div>
        <button
          type="submit"
          className="w-full mt-4 text-black py-2 bg-green-400 rounded hover:bg-blue-700 cursor-pointer"
        >
          Save Changes
        </button>
      </form>
    </div>
  );
}
