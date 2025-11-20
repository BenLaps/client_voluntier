// src/components/VolunteerApplications.tsx
import { ActivityItem } from '@/constants/activities'; // Make sure this includes populated users
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { getCookie } from 'cookies-next';
import { MessageSquare } from 'lucide-react'; // Icon for chat

interface VolunteerApplicationsProps {
  activity: ActivityItem;
  setActivity: (activity: ActivityItem) => void; // Function to update parent state
}

export function VolunteerApplications({ activity, setActivity }: VolunteerApplicationsProps) {

  const handleManageApplicant = async (applicantId: string, action: 'accept' | 'reject') => {
    const token = getCookie('token');
    try {
      const res = await fetch(`http://localhost:5000/api/activities/${activity.id}/manage`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify({ applicantId, action })
      });
      if(!res.ok) throw new Error('Failed to manage applicant');
      const updatedActivity = await res.json();
      setActivity(updatedActivity); // Update the state in the parent component
    } catch (err) {
       console.error(err);
       alert('Error managing applicant');
    }
  };
  const pendingApps = activity.applications?.filter(app => app.status === 'pending') || [];
  const acceptedApps = activity.applications?.filter(app => app.status === 'accepted') || [];
  const rejectedApps = activity.applications?.filter(app => app.status === 'rejected') || [];

  return (
    <Card>
      <CardHeader>
        <CardTitle>Volunteer Management</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Pending Applications */}
        <div>
          <h4 className="font-semibold mb-2">Pending Applications ({pendingApps.length})</h4>
          {pendingApps.length > 0 ? (
            <ul className="space-y-3">
              {pendingApps.map(app => (
                <li key={app.id} className="text-sm border rounded p-3">
                  <div className="flex justify-between items-center mb-2">
                     <span className="font-medium">{app.user.email || 'Applicant'}</span>
                     <div className="flex gap-1">
                       <Button size="sm" variant="ghost" className="p-1 h-auto" disabled> {/* Chat Button Placeholder */}
                          <MessageSquare className="h-4 w-4"/>
                       </Button>
                       <Button size="sm" onClick={() => handleManageApplicant(app.user.id, 'accept')}>Accept</Button>
                       <Button size="sm" variant="outline" onClick={() => handleManageApplicant(app.user.id, 'reject')}>Reject</Button>
                     </div>
                  </div>
                  {app.message && (
                     <p className="text-xs text-muted-foreground bg-secondary p-2 rounded">{app.message}</p>
                  )}
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-sm text-muted-foreground">No pending applications.</p>
          )}
        </div>

        {/* Accepted Volunteers */}
        <div>
           <h4 className="font-semibold mb-2">Accepted ({acceptedApps.length})</h4>
           {acceptedApps.length > 0 ? (
             <ul className="space-y-1 text-sm text-muted-foreground">
               {acceptedApps.map(app => <li key={app.id}>{app.user.email || 'Volunteer'}</li>)}
             </ul>
           ) : (
             <p className="text-sm text-muted-foreground">No accepted volunteers yet.</p>
           )}
        </div>
        
         {/* Optional: Rejected Applications */}
         {/* <div> ... similar list for rejectedApps ... </div> */}

      </CardContent>
    </Card>
  );
}