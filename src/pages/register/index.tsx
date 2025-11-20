import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/router";
import { useState, useEffect } from "react";
import { getCookie, setCookie } from "cookies-next";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export default function Register() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [passwordagain, setPasswordAgain] = useState("");
  const [error, setError] = useState(router.query.msg || "");

  useEffect(() => {
    const token = getCookie("token");
    if (token) {
      router.push("/");
    }
  }, [router]);

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (password !== passwordagain) {
      setError("The two passwords don't match");
      return;
    }

    try {
      // --- Крок 1: Створення користувача ---
      const regRes = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/users`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email, password }),
      });

      const regData = await regRes.json();

      // Якщо створення не вдалося (напр., такий email вже існує)
      if (!regRes.ok) {
        // Payload повертає помилки у масиві 'errors'
        setError(regData.errors?.[0]?.message || "Registration failed");
        return;
      }

      // --- Крок 2: Логін, щоб отримати токен ---
      const loginRes = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/users/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }), // Використовуємо ті ж дані
      });

      const loginData = await loginRes.json();

      if (!loginRes.ok) {
        // Це не повинно статися, але про всяк випадок
        setError(loginData.errors?.[0]?.message || "Login failed after registration");
        return;
      }
      
      // --- Крок 3: Збереження токена та перенаправлення ---
      setCookie("token", loginData.token); // Тепер 'loginData.token' існує
      router.push("/");

    } catch (err) {
      setError("An error occurred. Please try again.");
      console.error(err);
    }
  };

  return (
    <div className="w-full lg:grid lg:min-h-[600px] lg:grid-cols-2 xl:min-h-[800px]">
      <div className="flex items-center justify-center py-12">
        <div className="mx-auto grid w-[350px] gap-6">
          <div className="grid gap-2 text-center">
            <h1 className="text-3xl font-bold">Sign Up</h1>
            <p className="text-balance text-muted-foreground">
              Enter your information to create an account
            </p>
            {error ? <h3 className="text-red-500">{error}</h3> : <></>}
          </div>
          <form onSubmit={handleRegister} className="grid gap-4">
            <div className="grid gap-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                name="email"
                type="email"
                placeholder="m@example.com"
                required
                minLength={5}
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                name="password"
                type="password"
                placeholder="password"
                required
                minLength={5}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="passwordagain">Password again</Label>
              <Input
                id="passwordagain"
                name="passwordagain"
                type="password"
                placeholder="password again"
                required
                minLength={5}
                value={passwordagain}
                onChange={(e) => setPasswordAgain(e.target.value)}
              />
            </div>
            <Button type="submit" className="w-full">
              Create an account
            </Button>
          </form>
          <div className="mt-4 text-center text-sm">
            Already have an account?{" "}
            <Link href="/login" className="underline">
              Sign in
            </Link>
          </div>
        </div>
      </div>
      <div className="hidden bg-muted lg:block">
        <Image
          src="/volunteer_dog.jpg"
          alt="Image"
          width="1920"
          height="1080"
          className="h-full w-full object-cover dark:brightness-[0.2] dark:grayscale"
        />
      </div>
    </div>
  );
}
