import Link from 'next/link';
import { ActivityItem } from "@/constants/activities";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

export function ActivityCard({ activity }: { activity: ActivityItem }) {
  const displayUrl = activity.imageUrl?.[0]?.url;

  return (
    <Link href={`/activity/${activity.id}`} className="block">
      <Card className="h-full overflow-hidden shadow-card hover:cursor-pointer hover:shadow-xl transition-shadow">
        <CardHeader className="p-0 pb-1">
          <div className="overflow-hidden">
            <img
              src={displayUrl}
              alt={activity.title}
              className="aspect-[3/4] h-fit w-fit object-cover"
              width={300}
              height={400}
              onError={(e) => { e.currentTarget.src = 'https://placehold.co/300x400/222/fff?text=No+Image'; }}
            />
          </div>
        </CardHeader>
        <CardContent className="p-4">
          <CardTitle>{activity.title}</CardTitle>
          <CardDescription>{activity.shortDescription}</CardDescription>
        </CardContent>
      </Card>
    </Link>
  );
}