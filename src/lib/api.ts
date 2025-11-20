// src/lib/api.ts

import { ActivityItem } from "@/constants/activities";

// Ця функція робить запит до вашого бекенду
export async function getActivityById(id: string): Promise<ActivityItem | null> {
  try {
    const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/activities/${id}?depth=1`);

    if (!response.ok) {
      // Якщо сервер повернув помилку (напр. 404), повертаємо null
      return null;
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error("Failed to fetch activity:", error);
    return null; // У випадку помилки мережі теж повертаємо null
  }
}