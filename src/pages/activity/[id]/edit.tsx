// src/pages/activity/[id]/edit.tsx
import { useState } from "react";
import { useRouter } from "next/router";
import { useAuth } from "@/contexts/AuthContext";
import { getCookie } from "cookies-next";
import { GetServerSideProps } from "next";
import { ActivityForm, ActivityFormValues } from "@/components/ActivityForm";
import { ActivityItem } from "@/constants/activities";
import { getActivityById } from "@/lib/api";

interface EditActivityProps {
  activity: ActivityItem;
}

export default function EditActivityPage({ activity }: EditActivityProps) {
  const router = useRouter();
  const { user } = useAuth();
  const [isLoading, setIsLoading] = useState(false);

  // Перевірка на випадок, якщо користувач не автор (хоча це має перевіряти і GSSP)
  const authorId =
    typeof activity.author === "string"
      ? activity.author
      : activity.author?.id;

  if (user && (!activity.author || user.id !== authorId)) {
    return <div>Ви не маєте доступу до редагування цієї сторінки.</div>;
  }

  // Функція для ОНОВЛЕННЯ
  async function onSubmit(values: ActivityFormValues) {
    setIsLoading(true);
    try {
      const token = getCookie("token");
      const submissionData = {
        ...values,

        imageUrl: values.imageUrl
          .map((item) => ({ url: item.value }))
          .filter((item) => item.url), // Фільтруємо пусті

        socialContactURL: values.socialContactURL
          .map((item) => ({ url: item.value }))
          .filter((item) => item.url), // Фільтруємо пусті
        tags: [values.tags],
        volunteersNeeded:
          values.requestType === "volunteer"
            ? values.volunteersNeeded
            : undefined,
        financialRequisites:
          values.requestType === "financial"
            ? values.financialRequisites
            : undefined,
      };

      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/activities/${activity.id}`,
        {
          method: "PUT", // Використовуємо PUT для оновлення
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(submissionData),
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.msg || "Failed to update activity");
      }

      alert("Activity updated successfully!");
      router.push(`/activity/${activity.id}`); // Повертаємось на сторінку поста
    } catch (error) {
      console.error(error);
      alert("An error occurred");
    } finally {
      setIsLoading(false);
    }
  }

  // Перетворюємо дані з бекенду назад у формат форми
  const initialFormValues: ActivityFormValues = {
    ...activity,
    tags: activity.tags?.[0] || "",
    imageUrl: activity.imageUrl?.map((url) => ({ value: url })) || [
      { value: "" },
    ],
    socialContactURL: activity.socialContactURL?.map((url) => ({
      value: url,
    })) || [{ value: "" }],
    volunteersNeeded: activity.volunteersNeeded?.toString() || "",
    financialRequisites: activity.financialRequisites || {
      card_number: "",
      bank_name: "",
      recipient_name: "",
    },
  };

  return (
    <div className={"p-6 flex items-center justify-center"}>
      <ActivityForm
        onSubmit={onSubmit}
        isLoading={isLoading}
        initialValues={initialFormValues}
      />
    </div>
  );
}

export const getServerSideProps: GetServerSideProps = async (context) => {
  const { id } = context.query;
  const activityId = Array.isArray(id) ? id[0] : id;

  if (!activityId) return { notFound: true };

  const activity = await getActivityById(activityId);
  if (!activity) return { notFound: true };

  // TODO: Тут також варто додати перевірку на автора, щоб неавторизовані
  // користувачі навіть не завантажували сторінку редагування.

  return { 
    props: { 
      // JSON.parse(JSON.stringify(...)) - це трюк для уникнення помилок серіалізації Next.js
      activity: JSON.parse(JSON.stringify(activity)) 
    } 
  };
};

