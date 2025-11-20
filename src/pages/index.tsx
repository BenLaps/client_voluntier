import { ActivityCard } from "@/components/ActivityCard";
import { ActivityItem } from "@/constants/activities";

export default function Home({ activities }: { activities: ActivityItem[] }) {
  return (
    <div
      className={"p-10 grid grid-cols-1 gap-4 md:grid-cols-4 lg:grid-cols-6"}
    >
      {activities.map((activity) => (
        <ActivityCard key={activity.id} activity={activity} />
      ))}
    </div>
  );
}
export async function getServerSideProps() {
  console.log("SERVER_SIDE_API_URL:", process.env.SERVER_SIDE_API_URL);
  try {
    const res = await fetch(`${process.env.SERVER_SIDE_API_URL}/activities/`);

    if (!res.ok) {
      console.error("Failed to fetch activities. Status:", res.status);
      const errorText = await res.text();
      console.error("Response body:", errorText);
      return { props: { activities: [] } };
    }

    const data = await res.json();

    return {
      props: {
        activities: data.docs, 
      },
    };
  } catch (error) {
    console.error("An error occurred during fetch:", error);
    return { props: { activities: [] } };
  }
}
