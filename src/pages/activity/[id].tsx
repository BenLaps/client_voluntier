// src/pages/activity/[id].tsx

import { GetServerSideProps } from "next";
import { ActivityItem, FeedbackEntry } from "@/constants/activities"; 
import { getActivityById } from "@/lib/api";
import moment from "moment";
import { useAuth } from "@/contexts/AuthContext";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from "@/components/ui/carousel";
import { Separator } from "@/components/ui/separator";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Globe, Trash2 } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/router";
import { useState } from "react";
import { getCookie } from "cookies-next";
import { CommentsSection } from "@/components/CommentsSection";
import { VolunteerApplications } from "@/components/VolunteerApplications";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger, DialogClose } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import * as Tooltip from '@radix-ui/react-tooltip';
import { FeedbackForm } from '@/components/FeedbackForm';
import { FeedbackDisplay } from '@/components/FeedbackDisplay';



interface ActivityPageProps {
  activity: ActivityItem;
}

// === Компонент Кнопки Support ===
interface SupportButtonProps {
  activity: ActivityItem;
  setActivity: (activity: ActivityItem) => void;
}

function SupportButton({ activity, setActivity }: SupportButtonProps) {
  const { user } = useAuth();
  const router = useRouter();
  const [applicationMessage, setApplicationMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [dialogOpen, setDialogOpen] = useState(false);

  if (!user) {
    return <Button onClick={() => router.push('/login')}>Login to Support</Button>;
  }

  // console.log("AuthContext User:", user);
  // console.log("Activity Author:", activity.author);
  // console.log("--- DEBUG AUTHOR PANEL ---");
  // console.log("User object:", user);
  // console.log("User ID from AuthContext:", user?.id);
  // console.log("Activity Author ID:",  activity.author.id);
  // console.log("Are they equal?:", user?.id ===  activity.author.id);
  // console.log("--------------------------");
 
  const currentUserApplication = activity.applications?.find(app => 
    typeof app.user === 'object' ? app.user.id === user.id : app.user === user.id
  );
  const applicationStatus = currentUserApplication?.status;
  const isAuthor = user && activity.author && user.id === activity.author.id;

  // console.log("IS AUTHOR CHECK:", isAuthor); // Перевіряю результат

  if (isAuthor) return null; // Автор не може підтримувати свій пост

  const handleApplySubmit = async () => {
    setIsSubmitting(true);
    const token = getCookie('token');
    try {

      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/activities/${activity.id}/apply`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify({ message: applicationMessage })
      });
      if (!res.ok) throw new Error('Failed to submit application');
      const updatedActivity = await res.json();
      setActivity(updatedActivity);
      setDialogOpen(false);
      setApplicationMessage('');
    } catch (err) {
      console.error(err);
      alert('Error submitting application');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCancelApplication = async () => {
    if (!currentUserApplication || currentUserApplication.status !== 'pending') return;
    if (!window.confirm('Are you sure you want to cancel your application?')) return;

    setIsSubmitting(true);
    const token = getCookie('token');
    try {

      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/activities/${activity.id}/apply`, {
          method: 'DELETE',
          headers: { 'Authorization': `Bearer ${token}` }
      });
      if (!res.ok) throw new Error('Failed to cancel application');
      const updatedActivity = await res.json();
      setActivity(updatedActivity);
    } catch (err) {
      console.error(err);
      alert('Error cancelling application');
    } finally {
      setIsSubmitting(false);
    }
  };

  // --- Financial Request ---
  if (activity.requestType === 'financial') {
    return (
        <Dialog>
            <DialogTrigger asChild><Button className="w-full">Support Financially</Button></DialogTrigger>
            <DialogContent>
              <DialogHeader><DialogTitle>Financial Requisites</DialogTitle></DialogHeader>
              <DialogDescription className="space-y-1">
                <p><strong>Card:</strong> {activity.financialRequisites?.card_number || 'N/A'}</p>
                <p><strong>Bank:</strong> {activity.financialRequisites?.bank_name || 'N/A'}</p>
                <p><strong>Recipient:</strong> {activity.financialRequisites?.recipient_name || 'N/A'}</p>
              </DialogDescription>
            </DialogContent>
        </Dialog>
    );
  }

  // --- Volunteer Request ---
  if (activity.requestType === 'volunteer') {
    switch (applicationStatus) {
      case 'pending':
        return (
          <div className="flex items-center gap-2">
            <Button disabled variant="secondary" className="bg-yellow-500 hover:bg-yellow-600 text-white flex-grow">
              Application Submitted
            </Button>
            <Tooltip.Provider>
              <Tooltip.Root>
                <Tooltip.Trigger asChild>
                  <Button variant="destructive" size="icon" onClick={handleCancelApplication} disabled={isSubmitting}>
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </Tooltip.Trigger>
                <Tooltip.Portal>
                  <Tooltip.Content className="bg-gray-900 text-white text-xs rounded px-2 py-1 shadow-lg" sideOffset={5}>
                    Cancel Application
                    <Tooltip.Arrow className="fill-gray-900" />
                  </Tooltip.Content>
                </Tooltip.Portal>
              </Tooltip.Root>
            </Tooltip.Provider>
          </div>
        );
      case 'accepted':
        return <Button disabled variant="secondary" className="bg-green-600 hover:bg-green-700 text-white w-full">Application Accepted</Button>;
      case 'rejected':
       return (
           <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
               <DialogTrigger asChild>
                   <Button variant="destructive" className="w-full">
                       Application Rejected (Re-apply?)
                   </Button>
               </DialogTrigger>
               <DialogContent>
                 <DialogHeader>
                   <DialogTitle>Re-apply for: {activity.title}</DialogTitle>
                   <DialogDescription>Your previous application was rejected, but you can submit a new one.</DialogDescription>
                 </DialogHeader>
                 <div className="grid gap-4 py-4">
                   <Label htmlFor="message" className="text-right">Message (Optional)</Label>
                   <Textarea id="message" value={applicationMessage} onChange={(e) => setApplicationMessage(e.target.value)} placeholder="Add a new message if you wish..."/>
                 </div>
                 <DialogFooter>
                   <DialogClose asChild><Button variant="outline">Cancel</Button></DialogClose>
                   <Button onClick={handleApplySubmit} disabled={isSubmitting}>
                     {isSubmitting ? 'Submitting...' : 'Submit Re-application'}
                   </Button>
                 </DialogFooter>
               </DialogContent>
           </Dialog>
       );
      default: // No application yet
        return (
          <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
            <DialogTrigger asChild>
              <Button className="w-full">Apply as Volunteer</Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Apply for: {activity.title}</DialogTitle>
                <DialogDescription>Write a short message to the organizer (optional).</DialogDescription>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="message" className="text-right">Message</Label>
                  <Textarea id="message" value={applicationMessage} onChange={(e) => setApplicationMessage(e.target.value)} className="col-span-3" placeholder="Why you'd like to volunteer..."/>
                </div>
              </div>
              <DialogFooter>
                <DialogClose asChild><Button variant="outline">Cancel</Button></DialogClose>
                <Button onClick={handleApplySubmit} disabled={isSubmitting}>
                  {isSubmitting ? 'Submitting...' : 'Submit Application'}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        );
    }
  }
  return null;
}

// === Головний Компонент Сторінки ===
export default function ActivityPage({
  activity: initialActivity,
}: ActivityPageProps) {
  const { user } = useAuth();
  const router = useRouter();
  const [activity, setActivity] = useState(initialActivity);

  //  перевірка автора
  const authorId = typeof activity.author === 'string' ? activity.author : activity.author?.id;
  const isAuthor = user && user.id === authorId;

  const handleDelete = async () => {
    if (window.confirm("Ви впевнені, що хочете видалити цю активність?")) {
      const token = getCookie("token");
      
      await fetch(`${process.env.NEXT_PUBLIC_API_URL}/activities/${activity.id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });
      router.push("/");
    }
  };

  const handleStatusChange = async (newStatus: string) => {
    const token = getCookie("token");
  
    const response = await fetch(
      `${process.env.NEXT_PUBLIC_API_URL}/activities/${activity.id}/status`,
      {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ status: newStatus }),
      }
    );
    const updatedActivity = await response.json();
    setActivity(updatedActivity);
  };
  
  const handleFeedbackUpdate = (newFeedbackList: FeedbackEntry[]) => {
    setActivity(prev => ({...prev, feedback: newFeedbackList}));
  };

  const showFeedbackForm = user && (activity.status === 'in_progress' || activity.status === 'completed');

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 p-4 md:p-10">
      
      {/* --- Ліва Колонка --- */}
      <div className="lg:col-span-2 space-y-8">
        <Card className="overflow-hidden">
          <CardHeader>
            <CardTitle>{activity.title}</CardTitle>
            <CardDescription>{activity.shortDescription}</CardDescription>
            <div className={"flex gap-x-1.5 pt-2 "}>
              {activity.tags?.map((tag, index) => (
                <Badge key={index}>{tag}</Badge>
              ))}
            </div>
          </CardHeader>
          <CardContent>
            <Carousel className="w-full" opts={{ dragFree: true }}>
              <CarouselContent className="-ml-1">
                {activity.imageUrl?.map((imageObj, index) => (
                  <CarouselItem key={index} className="pl-1 sm:basis-full md:basis-1/2 xl:basis-1/3">
                    <div className="p-1">
                      <Card>
                        <CardContent className="flex aspect-square items-center justify-center p-0">
                          <img alt={`${activity.title}_${index}`} className="aspect-square w-full rounded-md object-cover" src={imageObj.url} />
                        </CardContent>
                      </Card>
                    </div>
                  </CarouselItem>
                ))}
              </CarouselContent>
              <CarouselPrevious />
              <CarouselNext />
            </Carousel>
            
            <p className="mt-4">{activity.fullDescription}</p> 
          </CardContent>
        </Card>

        <FeedbackDisplay activity={activity} />
        
        {showFeedbackForm && (
           <FeedbackForm
              activityId={activity.id}
              onFeedbackSubmitted={handleFeedbackUpdate}
              activity={activity}
           />
        )}
        
        <CommentsSection activityId={activity.id} />
      </div>

      {/* --- Права Колонка (Сайдбар) --- */}
      <div className="lg:col-span-1 space-y-8">
        <Card className="overflow-hidden">
          <CardContent className="pt-6">
            <div className="grid gap-3">
              <div className="font-semibold">Request Details</div>
              <dl className="grid gap-3">
                <div className="flex items-center justify-between">
                  <dt className="text-muted-foreground">Request Type</dt>
                  <dd className="font-medium">
                    {activity.requestType === "financial" ? "Financial" : "Volunteers"}
                  </dd>
                </div>
                {activity.requestType === "volunteer" && activity.volunteersNeeded && (
                    <div className="flex items-center justify-between">
                      <dt className="text-muted-foreground">Volunteers Needed</dt>
                      <dd>{activity.volunteersNeeded}</dd>
                    </div>
                  )}
              </dl>
            </div>
            <Separator className="my-4" />
            <div className="grid gap-3">
              <div className="font-semibold">Socials</div>
              <dl className="flex items-center gap-x-6">
                {activity.socialContactURL?.map((social, index) => (
                  <a href={social} target={"_blank"} key={index}>
                    <Globe className="h-6 w-6" />
                  </a>
                ))}
              </dl>
            </div>
            <Separator className="my-4" />
            <div className="grid gap-3">
              <SupportButton activity={activity} setActivity={setActivity} />
            </div>
          </CardContent>
        </Card>
        
        {isAuthor && (
          <Card className="mt-4 p-4 bg-secondary">
            <CardTitle>Панель автора</CardTitle>
            <p className="text-muted-foreground">Поточний статус: <strong>{activity.status}</strong></p>
            <div className="flex flex-wrap gap-2 mt-2">
              <Link href={`/activity/${activity.id}/edit`}>
                <Button>Редагувати</Button>
              </Link>
              <Button variant="destructive" onClick={handleDelete}>Видалити</Button>
            </div>
            <div className="mt-4 space-y-2">
              <p>Змінити статус:</p>
              <div className="flex gap-2">
                <Button size="sm" onClick={() => handleStatusChange("searching")} disabled={activity.status === "searching"}>В пошуку</Button>
                <Button size="sm" onClick={() => handleStatusChange("in_progress")} disabled={activity.status === "in_progress"}>В процесі</Button>
                <Button size="sm" onClick={() => handleStatusChange("completed")} disabled={activity.status === "completed"}>Завершено</Button>
              </div>
            </div>
          </Card>
        )}
        
        {isAuthor && activity.requestType === "volunteer" && (
          <VolunteerApplications activity={activity} setActivity={setActivity} />
        )}
      </div>
    </div>
  );
}

// === getServerSideProps ===
export const getServerSideProps: GetServerSideProps = async (context) => {
  const { id } = context.query;
  try {
    const activityId = Array.isArray(id) ? id[0] : id;
    if (!activityId) return { notFound: true };
    
    //  Ця функція має робити fetch на http://localhost:3000/api/activities/${activityId}
    const activity = await getActivityById(activityId); 
    
    if (!activity) return { notFound: true };
    // JSON.parse(JSON.stringify()) - це трюк для уникнення помилок серіалізації дат
    return { props: { activity: JSON.parse(JSON.stringify(activity)) } };
  } catch (error) {
    console.error("getServerSideProps Error:", error);
    return { notFound: true };
  }
};