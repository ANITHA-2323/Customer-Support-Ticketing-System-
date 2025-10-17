import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/lib/auth";
import { toast } from "sonner";
import { formatDistanceToNow } from "date-fns";
import { Label } from "@/components/ui/label";

interface TicketDetailsDialogProps {
  ticketId: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onUpdate: () => void;
  isAdmin?: boolean;
}

const TicketDetailsDialog = ({ ticketId, open, onOpenChange, onUpdate, isAdmin }: TicketDetailsDialogProps) => {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [comment, setComment] = useState("");
  const [isInternal, setIsInternal] = useState(false);

  const { data: ticket, isLoading } = useQuery({
    queryKey: ["ticket", ticketId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("tickets")
        .select(
          `
          *,
          profiles!tickets_user_id_fkey(full_name, email),
          assigned_agent:profiles!tickets_assigned_to_fkey(full_name, email)
        `
        )
        .eq("id", ticketId)
        .single();

      if (error) throw error;
      return data;
    },
    enabled: open,
  });

  const { data: comments } = useQuery({
    queryKey: ["ticket-comments", ticketId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("ticket_comments")
        .select("*, profiles(full_name, email)")
        .eq("ticket_id", ticketId)
        .order("created_at", { ascending: true });

      if (error) throw error;
      return data;
    },
    enabled: open,
  });

  const { data: agents } = useQuery({
    queryKey: ["agents"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("user_roles")
        .select("user_id, profiles(id, full_name, email)")
        .in("role", ["admin", "agent"]);

      if (error) throw error;
      return data.map((r: any) => r.profiles);
    },
    enabled: isAdmin,
  });

  const updateTicketMutation = useMutation({
    mutationFn: async (updates: any) => {
      const { error } = await supabase.from("tickets").update(updates).eq("id", ticketId);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["ticket", ticketId] });
      toast.success("Ticket updated successfully!");
      onUpdate();
    },
    onError: (error: any) => {
      toast.error(error.message);
    },
  });

  const addCommentMutation = useMutation({
    mutationFn: async () => {
      if (!user || !comment.trim()) return;

      const { error } = await supabase.from("ticket_comments").insert([
        {
          ticket_id: ticketId,
          user_id: user.id,
          comment: comment.trim(),
          is_internal: isInternal,
        },
      ]);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["ticket-comments", ticketId] });
      setComment("");
      setIsInternal(false);
      toast.success("Comment added successfully!");
    },
    onError: (error: any) => {
      toast.error(error.message);
    },
  });

  if (isLoading || !ticket) {
    return (
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent>
          <div className="flex items-center justify-center p-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            Ticket #{ticket.ticket_number} - {ticket.title}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          <div className="flex gap-2">
            <Badge>{ticket.status.replace("_", " ")}</Badge>
            <Badge>{ticket.priority}</Badge>
            <Badge variant="outline">{ticket.category.replace("_", " ")}</Badge>
          </div>

          <div>
            <h3 className="font-semibold mb-2">Description</h3>
            <p className="text-muted-foreground">{ticket.description}</p>
          </div>

          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <span className="text-muted-foreground">Created by:</span>
              <p className="font-medium">{ticket.profiles?.full_name}</p>
            </div>
            <div>
              <span className="text-muted-foreground">Created:</span>
              <p className="font-medium">{formatDistanceToNow(new Date(ticket.created_at), { addSuffix: true })}</p>
            </div>
          </div>

          {isAdmin && (
            <div className="space-y-4 p-4 bg-muted/50 rounded-lg">
              <h3 className="font-semibold">Admin Actions</h3>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Status</Label>
                  <Select
                    value={ticket.status}
                    onValueChange={(value) => updateTicketMutation.mutate({ status: value })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="open">Open</SelectItem>
                      <SelectItem value="in_progress">In Progress</SelectItem>
                      <SelectItem value="resolved">Resolved</SelectItem>
                      <SelectItem value="closed">Closed</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Assign to Agent</Label>
                  <Select
                    value={ticket.assigned_to || "unassigned"}
                    onValueChange={(value) =>
                      updateTicketMutation.mutate({ assigned_to: value === "unassigned" ? null : value })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="unassigned">Unassigned</SelectItem>
                      {agents?.map((agent: any) => (
                        <SelectItem key={agent.id} value={agent.id}>
                          {agent.full_name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>
          )}

          <Separator />

          <div>
            <h3 className="font-semibold mb-4">Comments</h3>
            <div className="space-y-4 mb-4">
              {comments?.map((comment: any) => (
                <div key={comment.id} className={`p-4 rounded-lg ${comment.is_internal ? "bg-warning/10" : "bg-muted"}`}>
                  <div className="flex justify-between items-start mb-2">
                    <div>
                      <p className="font-medium">{comment.profiles?.full_name}</p>
                      <p className="text-xs text-muted-foreground">
                        {formatDistanceToNow(new Date(comment.created_at), { addSuffix: true })}
                      </p>
                    </div>
                    {comment.is_internal && <Badge variant="outline">Internal Note</Badge>}
                  </div>
                  <p className="text-sm">{comment.comment}</p>
                </div>
              ))}
              {(!comments || comments.length === 0) && (
                <p className="text-center text-muted-foreground py-4">No comments yet</p>
              )}
            </div>

            <div className="space-y-2">
              <Textarea
                placeholder="Add a comment..."
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                rows={3}
              />
              {isAdmin && (
                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    id="internal"
                    checked={isInternal}
                    onChange={(e) => setIsInternal(e.target.checked)}
                    className="rounded"
                  />
                  <Label htmlFor="internal" className="text-sm cursor-pointer">
                    Internal note (only visible to admins and agents)
                  </Label>
                </div>
              )}
              <Button onClick={() => addCommentMutation.mutate()} disabled={!comment.trim()}>
                Add Comment
              </Button>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default TicketDetailsDialog;
