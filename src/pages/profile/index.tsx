// src/pages/profile/index.tsx

import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { getCookie } from "cookies-next";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ActivityItem } from "@/constants/activities"; // Ensure this type is up-to-date
import Link from "next/link";

// --- Zod Schema for Profile Form ---
const profileSchema = z.object({
  firstName: z.string().optional(),
  lastName: z.string().optional(),
  contactPhone: z.string().optional(), // Add specific validation (e.g., regex) if needed
  gender: z.string().optional(),
  dateOfBirth: z.string().optional(), // Keep as string for input type="date"
  city: z.string().optional(),
  country: z.string().optional(),
  aboutMe: z
    .string()
    .max(2024, "Description cannot exceed 2024 characters.")
    .optional(),
});
type ProfileFormValues = z.infer<typeof profileSchema>;

// --- Helper: Format Date for Input ---
// MongoDB stores dates as ISO strings, but input type="date" needs "YYYY-MM-DD"
const formatDateForInput = (dateString?: string): string => {
  if (!dateString) return "";
  try {
    return new Date(dateString).toISOString().split("T")[0];
  } catch (e) {
    return "";
  }
};

export default function ProfilePage() {
  const { user, logout } = useAuth(); // Assuming useAuth provides the user object
  const [createdActivities, setCreatedActivities] = useState<ActivityItem[]>(
    []
  );
  const [participatedActivities, setParticipatedActivities] = useState<
    ActivityItem[]
  >([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isFetchingActivities, setIsFetchingActivities] = useState(false);

  const form = useForm<ProfileFormValues>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      firstName: "",
      lastName: "",
      contactPhone: "",
      gender: "",
      dateOfBirth: "",
      city: "",
      country: "",
      aboutMe: "",
    },
  });

  // --- Fetch Profile Data ---
  useEffect(() => {
    const fetchProfile = async () => {
      const token = getCookie("token");
      if (!token || !user) return; // Need user to be loaded by AuthContext

      try {
        const res = await fetch(
          `${process.env.NEXT_PUBLIC_API_URL}/users/me`,
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );
        if (!res.ok) throw new Error("Failed to fetch profile");
        const data = await res.json();
        // Update form defaults with fetched data
        form.reset({
          ...data,
          dateOfBirth: formatDateForInput(data.dateOfBirth), // Format date
        });
      } catch (error) {
        console.error("Profile fetch error:", error);
      }
    };
    fetchProfile();
  }, [user, form]); // Refetch if user changes (e.g., after login)

  // --- Fetch Activity Data ---
  useEffect(() => {
    const fetchActivities = async () => {
      const token = getCookie("token");
      if (!token) return;
      setIsFetchingActivities(true);
      try {
        const [createdRes, participatedRes] = await Promise.all([
          fetch(`${process.env.NEXT_PUBLIC_API_URL}/user-activities/created`, {
            headers: { Authorization: `Bearer ${token}` },
          }),
          fetch(
            `${process.env.NEXT_PUBLIC_API_URL}/user-activities/participated`,
            { headers: { Authorization: `Bearer ${token}` } }
          ),
        ]);
        if (createdRes.ok) setCreatedActivities(await createdRes.json());
        if (participatedRes.ok)
          setParticipatedActivities(await participatedRes.json());
      } catch (error) {
        console.error("Activities fetch error:", error);
      } finally {
        setIsFetchingActivities(false);
      }
    };
    fetchActivities();
  }, [user]); // Refetch if user changes

  // --- Handle Profile Update ---
  const onSubmit = async (values: ProfileFormValues) => {
    if (!user?.id) {
    alert("Error: User not loaded. Please wait and try again.");
    return;
  }
    setIsLoading(true);
    const token = getCookie("token");
    try {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/users/${user.id}`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(values),
        }
      );
      if (!res.ok) throw new Error("Failed to update profile");
      alert("Profile updated successfully!");
      // Optionally re-fetch profile to confirm changes, though form.reset does visually update
      // const updatedData = await res.json();
      // form.reset({...updatedData, dateOfBirth: formatDateForInput(updatedData.dateOfBirth)});
    } catch (error) {
      console.error("Profile update error:", error);
      alert("Failed to update profile.");
    } finally {
      setIsLoading(false);
    }
  };

  if (!user) {
    return <div>Loading profile... or please log in.</div>; // Add better loading/auth state
  }

  return (
    <div className="container mx-auto p-4 md:p-10 space-y-8">
      {/* --- Profile Editing Section --- */}
      <Card>
        <CardHeader>
          <CardTitle>Personal Information</CardTitle>
          <CardDescription>Update your profile details.</CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="firstName"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>First Name</FormLabel>
                      <FormControl>
                        <Input className="bg-secondary/30 border" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="lastName"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Last Name</FormLabel>
                      <FormControl>
                        <Input className="bg-secondary/30 border" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="contactPhone"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Contact Phone</FormLabel>
                      <FormControl>
                        <Input
                          type="tel"
                          className="bg-secondary/30 border"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="gender"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Gender</FormLabel>
                      <Select
                        onValueChange={field.onChange}
                        defaultValue={field.value}
                        value={field.value}
                      >
                        <FormControl>
                          <SelectTrigger className="bg-secondary/30 border">
                            <SelectValue placeholder="Select gender" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="male">Male</SelectItem>
                          <SelectItem value="female">Female</SelectItem>
                          <SelectItem value="other">Other</SelectItem>
                          <SelectItem value="prefer_not_say">
                            Prefer not to say
                          </SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="dateOfBirth"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Date of Birth</FormLabel>
                      <FormControl>
                        <Input
                          type="date"
                          className="bg-secondary/30 border"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="city"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>City</FormLabel>
                      <FormControl>
                        <Input className="bg-secondary/30 border" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="country"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Country</FormLabel>
                      <FormControl>
                        <Input className="bg-secondary/30 border" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="aboutMe"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>About Me</FormLabel>
                      <FormControl>
                        <Textarea
                          placeholder="Tell us a little bit about yourself (max 2024 characters)"
                          className="resize-none bg-secondary/30 border "
                          maxLength={2024}
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <Button type="submit" disabled={isLoading}>
                {isLoading ? "Saving..." : "Save Profile"}
              </Button>
            </form>
          </Form>
        </CardContent>
      </Card>

      {/* --- Activity History Section --- */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Created Activities */}
        <Card>
          <CardHeader>
            <CardTitle>My Created Activities</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {isFetchingActivities ? (
              <p>Loading...</p>
            ) : ( //  Спочатку фільтруємо, потім перевіряємо довжину
              participatedActivities.filter((act) => act.status !== "deleted")
                .length > 0 )? (
              //  Перебираємо вже відфільтрований список
              participatedActivities.filter((act) => act.status !== "deleted").map((act) => {
                const myApplication = act.applications?.find(
                    (app) => app.user?._id === user.id
                  );
                  return (
                    <div key={act._id} className="border p-2 rounded text-sm">
                      <Link
                        href={`/activity/${act._id}`}
                        className="hover:underline font-medium"
                      >
                        {act.title}
                      </Link>
                      {myApplication && (
                        <p className="text-xs text-muted-foreground">
                          My Status: {myApplication.status}
                        </p>
                      )}
                    </div>
                  );
                })
            ) : (
              <p className="text-muted-foreground">
                You haven't participated in any activities yet.
              </p>
            )}
          </CardContent>
        </Card>

        {/* Participated Activities */}
        <Card>
          <CardHeader>
            <CardTitle>Activities I'm Involved In</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {isFetchingActivities ? (
              <p>Loading...</p>
            ) : participatedActivities.length > 0 ? (
              participatedActivities.map((act) => {
                // Find the user's application status within this activity
                const myApplication = act.applications?.find(
                  (app) => app.user._id === user.id
                );
                return (
                  <div key={act._id} className="border p-2 rounded text-sm">
                    <Link
                      href={`/activity/${act._id}`}
                      className="hover:underline font-medium"
                    >
                      {act.title}
                    </Link>
                    {myApplication && (
                      <p className="text-xs text-muted-foreground">
                        My Status: {myApplication.status}
                      </p>
                    )}
                  </div>
                );
              })
            ) : (
              <p className="text-muted-foreground">
                You haven't participated in any activities yet.
              </p>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
