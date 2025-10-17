import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/lib/auth";
import { Button } from "@/components/ui/button";
import { LogOut } from "lucide-react";
import DashboardLayout from "./DashboardLayout";
import TicketList from "./TicketList";
import TicketDetailsDialog from "./TicketDetailsDialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

const AdminDashboard = () => {
  const { signOut } = useAuth();
  const [selectedTicketId, setSelectedTicketId] = useState<string | null>(null);
  const [statusFilter, setStatusFilter] = useState<"all" | "open" | "in_progress" | "resolved" | "closed">("all");

  const { data: tickets, isLoading, refetch, error: queryError } = useQuery({
    queryKey: ["all-tickets", statusFilter],
    queryFn: async () => {
      console.log("Fetching tickets with status filter:", statusFilter);
      let query = supabase
        .from("tickets")
        .select(`
          *,
          profiles!tickets_user_id_fkey(full_name, email),
          assigned_agent:profiles!tickets_assigned_to_fkey(full_name, email)
        `)
        .order("created_at", { ascending: false });

      if (statusFilter !== "all") {
        query = query.eq("status", statusFilter);
      }

      const { data, error } = await query;
      if (error) {
        console.error("Error fetching tickets:", error);
        throw error;
      }
      console.log("Fetched tickets:", data);
      return data;
    },
  });

  const { data: stats } = useQuery({
    queryKey: ["admin-ticket-stats"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("tickets")
        .select("status, priority");

      if (error) throw error;
      
      return {
        total: data.length,
        open: data.filter(t => t.status === "open").length,
        inProgress: data.filter(t => t.status === "in_progress").length,
        resolved: data.filter(t => t.status === "resolved").length,
        urgent: data.filter(t => t.priority === "urgent").length,
      };
    },
  });

  const handleSignOut = async () => {
    await signOut();
  };

  return (
    <DashboardLayout
      title="Admin Dashboard"
      actions={
        <Button onClick={handleSignOut} variant="outline" className="gap-2">
          <LogOut className="h-4 w-4" />
          Sign Out
        </Button>
      }
    >
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-6">
        <div className="bg-card rounded-lg p-6 border shadow-sm">
          <h3 className="text-sm font-medium text-muted-foreground">Total Tickets</h3>
          <p className="text-3xl font-bold mt-2">{stats?.total || 0}</p>
        </div>
        <div className="bg-card rounded-lg p-6 border shadow-sm">
          <h3 className="text-sm font-medium text-muted-foreground">Open</h3>
          <p className="text-3xl font-bold mt-2 text-destructive">{stats?.open || 0}</p>
        </div>
        <div className="bg-card rounded-lg p-6 border shadow-sm">
          <h3 className="text-sm font-medium text-muted-foreground">In Progress</h3>
          <p className="text-3xl font-bold mt-2 text-warning">{stats?.inProgress || 0}</p>
        </div>
        <div className="bg-card rounded-lg p-6 border shadow-sm">
          <h3 className="text-sm font-medium text-muted-foreground">Resolved</h3>
          <p className="text-3xl font-bold mt-2 text-success">{stats?.resolved || 0}</p>
        </div>
        <div className="bg-card rounded-lg p-6 border shadow-sm">
          <h3 className="text-sm font-medium text-muted-foreground">Urgent</h3>
          <p className="text-3xl font-bold mt-2 text-destructive">{stats?.urgent || 0}</p>
        </div>
      </div>

      <Tabs value={statusFilter} onValueChange={(value) => setStatusFilter(value as typeof statusFilter)} className="mb-6">
        <TabsList>
          <TabsTrigger value="all">All</TabsTrigger>
          <TabsTrigger value="open">Open</TabsTrigger>
          <TabsTrigger value="in_progress">In Progress</TabsTrigger>
          <TabsTrigger value="resolved">Resolved</TabsTrigger>
          <TabsTrigger value="closed">Closed</TabsTrigger>
        </TabsList>
      </Tabs>

      <TicketList
        tickets={tickets || []}
        isLoading={isLoading}
        onTicketClick={setSelectedTicketId}
        showUser
      />

      {selectedTicketId && (
        <TicketDetailsDialog
          ticketId={selectedTicketId}
          open={!!selectedTicketId}
          onOpenChange={(open) => !open && setSelectedTicketId(null)}
          onUpdate={refetch}
          isAdmin
        />
      )}
    </DashboardLayout>
  );
};

export default AdminDashboard;
