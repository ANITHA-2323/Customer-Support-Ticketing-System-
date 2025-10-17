import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Clock, AlertCircle, CheckCircle2, XCircle } from "lucide-react";
import { formatDistanceToNow } from "date-fns";

interface Ticket {
  id: string;
  ticket_number: number;
  title: string;
  description: string;
  status: string;
  priority: string;
  category: string;
  created_at: string;
  profiles?: { full_name: string; email: string };
  assigned_agent?: { full_name: string; email: string };
}

interface TicketListProps {
  tickets: Ticket[];
  isLoading: boolean;
  onTicketClick: (id: string) => void;
  showUser?: boolean;
}

const statusColors = {
  open: "bg-destructive text-destructive-foreground",
  in_progress: "bg-warning text-warning-foreground",
  resolved: "bg-success text-success-foreground",
  closed: "bg-muted text-muted-foreground",
};

const priorityColors = {
  low: "bg-info text-info-foreground",
  medium: "bg-warning text-warning-foreground",
  high: "bg-destructive text-destructive-foreground",
  urgent: "bg-destructive text-destructive-foreground animate-pulse",
};

const StatusIcon = ({ status }: { status: string }) => {
  switch (status) {
    case "open":
      return <AlertCircle className="h-4 w-4" />;
    case "in_progress":
      return <Clock className="h-4 w-4" />;
    case "resolved":
      return <CheckCircle2 className="h-4 w-4" />;
    case "closed":
      return <XCircle className="h-4 w-4" />;
    default:
      return null;
  }
};

const TicketList = ({ tickets, isLoading, onTicketClick, showUser }: TicketListProps) => {
  if (isLoading) {
    return (
      <div className="grid grid-cols-1 gap-4">
        {[1, 2, 3].map((i) => (
          <Card key={i} className="animate-pulse">
            <CardContent className="p-6">
              <div className="h-4 bg-muted rounded w-3/4 mb-2"></div>
              <div className="h-3 bg-muted rounded w-1/2"></div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  if (tickets.length === 0) {
    return (
      <Card>
        <CardContent className="p-12 text-center">
          <p className="text-muted-foreground">No tickets found</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="grid grid-cols-1 gap-4">
      {tickets.map((ticket) => (
        <Card
          key={ticket.id}
          className="cursor-pointer hover:shadow-md transition-all"
          onClick={() => onTicketClick(ticket.id)}
        >
          <CardHeader>
            <div className="flex justify-between items-start">
              <div className="flex-1">
                <CardTitle className="text-lg flex items-center gap-2">
                  #{ticket.ticket_number} - {ticket.title}
                </CardTitle>
                {showUser && ticket.profiles && (
                  <p className="text-sm text-muted-foreground mt-1">
                    By: {ticket.profiles.full_name} ({ticket.profiles.email})
                  </p>
                )}
              </div>
              <div className="flex gap-2">
                <Badge className={statusColors[ticket.status as keyof typeof statusColors]}>
                  <StatusIcon status={ticket.status} />
                  <span className="ml-1">{ticket.status.replace("_", " ")}</span>
                </Badge>
                <Badge className={priorityColors[ticket.priority as keyof typeof priorityColors]}>
                  {ticket.priority}
                </Badge>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground line-clamp-2 mb-3">{ticket.description}</p>
            <div className="flex justify-between items-center text-sm">
              <div className="flex gap-4">
                <span className="text-muted-foreground">
                  Category: <span className="font-medium text-foreground">{ticket.category.replace("_", " ")}</span>
                </span>
                {ticket.assigned_agent && (
                  <span className="text-muted-foreground">
                    Assigned to: <span className="font-medium text-foreground">{ticket.assigned_agent.full_name}</span>
                  </span>
                )}
              </div>
              <span className="text-muted-foreground">
                {formatDistanceToNow(new Date(ticket.created_at), { addSuffix: true })}
              </span>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};

export default TicketList;
