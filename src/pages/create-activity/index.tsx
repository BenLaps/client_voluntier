import { useState } from "react";
import { useRouter } from "next/router";
import { useAuth } from "@/contexts/AuthContext";
import { getCookie } from "cookies-next";
import { ActivityForm, ActivityFormValues } from "@/components/ActivityForm"; // Імпортуємо форму

export default function CreateActivity() {
  const router = useRouter();
  const { user } = useAuth();
  const [isLoading, setIsLoading] = useState(false);

  // Ця функція буде передана в наш компонент форми
  async function onSubmit(values: ActivityFormValues) {
    if (!user) {
      alert("You must be logged in to create an activity.");
      router.push("/login");
      return;
    }

    setIsLoading(true);
    try {
      const token = getCookie("token");
      const submissionData = {
        ...values,
        imageUrl: values.imageUrl
          .map(item => ({ url: item.value })) 
          .filter(item => item.url), // Фільтруємо пусті

        socialContactURL: values.socialContactURL
          .map((item) => ({ url: item.value }))
          .filter((item) => item.url), // Фільтруємо пусті
        
        tags: [values.tags], // Перетворюємо один тег на масив
        
        volunteersNeeded:
          values.requestType === "volunteer"
            ? values.volunteersNeeded
            : undefined,
        
        financialRequisites:
          values.requestType === "financial"
            ? values.financialRequisites
            : undefined,
      };


      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/activities`, 
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(submissionData),
        }
      );

      
      if (!res.ok) {
        const errorData = await res.json();
        const message = errorData.errors?.[0]?.message || "Failed to create activity";
        throw new Error(message);
      }

      alert("Activity created successfully!");
      router.push("/");
    } catch (error) {
      console.error(error);
      alert(error.message || "An error occurred");
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div className={"p-6 flex items-center justify-center"}>
      <ActivityForm onSubmit={onSubmit} isLoading={isLoading} />
    </div>
  );
}
