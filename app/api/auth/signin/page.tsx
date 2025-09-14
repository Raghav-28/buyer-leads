"use client";

import { signIn } from "next-auth/react";

export default function SignInPage() {
  const handleLogin = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const form = new FormData(e.currentTarget);
    const email = form.get("email") as string;
    const password = form.get("password") as string;

    await signIn("credentials", {
      email,
      password,
      callbackUrl: "/", // redirect after login
    });
  };

  return (
    <div className="flex h-screen items-center justify-center">
      <form
        onSubmit={handleLogin}
        className="p-6 border rounded-md shadow-md space-y-4"
      >
        <h1 className="text-xl font-bold">Sign In</h1>
        <input
          type="email"
          name="email"
          placeholder="Email"
          className="border p-2 w-full"
        />
        <input
          type="password"
          name="password"
          placeholder="Password"
          className="border p-2 w-full"
        />
        <button type="submit" className="bg-blue-600 text-white px-4 py-2 rounded">
          Sign In
        </button>
      </form>
    </div>
  );
}
