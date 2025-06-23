
import { useState } from "react";
import { Link } from "react-router-dom";
import { ArrowLeft, MessageSquare, Users, Clock, CheckCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";

interface ChatSession {
  id: string;
  customerName: string;
  customerEmail: string;
  status: "active" | "waiting" | "resolved";
  lastMessage: string;
  timestamp: Date;
  priority: "low" | "medium" | "high";
}

const mockChatSessions: ChatSession[] = [
  {
    id: "1",
    customerName: "John Doe",
    customerEmail: "john@example.com",
    status: "active",
    lastMessage: "I need help with my order",
    timestamp: new Date(Date.now() - 5 * 60 * 1000),
    priority: "high"
  },
  {
    id: "2",
    customerName: "Jane Smith",
    customerEmail: "jane@example.com",
    status: "waiting",
    lastMessage: "Thanks for your help!",
    timestamp: new Date(Date.now() - 15 * 60 * 1000),
    priority: "medium"
  },
  {
    id: "3",
    customerName: "Mike Johnson",
    customerEmail: "mike@example.com",
    status: "resolved",
    lastMessage: "Issue resolved",
    timestamp: new Date(Date.now() - 30 * 60 * 1000),
    priority: "low"
  }
];

const SupportDashboard = () => {
  const [chatSessions] = useState<ChatSession[]>(mockChatSessions);

  const getStatusColor = (status: string) => {
    switch (status) {
      case "active": return "bg-green-500";
      case "waiting": return "bg-yellow-500";
      case "resolved": return "bg-gray-500";
      default: return "bg-gray-500";
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "high": return "destructive";
      case "medium": return "default";
      case "low": return "secondary";
      default: return "secondary";
    }
  };

  const activeChats = chatSessions.filter(chat => chat.status === "active").length;
  const waitingChats = chatSessions.filter(chat => chat.status === "waiting").length;
  const resolvedToday = chatSessions.filter(chat => chat.status === "resolved").length;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-4">
              <Link to="/">
                <Button variant="ghost" size="sm">
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Home
                </Button>
              </Link>
              <h1 className="text-xl font-semibold">Support Dashboard</h1>
            </div>
            <div className="flex items-center gap-4">
              <Badge variant="outline">Support Staff</Badge>
              <Avatar>
                <AvatarFallback>SS</AvatarFallback>
              </Avatar>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Active Chats</CardTitle>
              <MessageSquare className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">{activeChats}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Waiting</CardTitle>
              <Clock className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-yellow-600">{waitingChats}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Resolved Today</CardTitle>
              <CheckCircle className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-blue-600">{resolvedToday}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Customers</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">24</div>
            </CardContent>
          </Card>
        </div>

        {/* Chat Sessions */}
        <Card>
          <CardHeader>
            <CardTitle>Chat Sessions</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {chatSessions.map((session) => (
                <div
                  key={session.id}
                  className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50 cursor-pointer"
                >
                  <div className="flex items-center gap-4">
                    <div className="relative">
                      <Avatar>
                        <AvatarFallback>
                          {session.customerName.split(' ').map(n => n[0]).join('')}
                        </AvatarFallback>
                      </Avatar>
                      <div className={`absolute -bottom-1 -right-1 w-3 h-3 rounded-full ${getStatusColor(session.status)}`} />
                    </div>
                    <div>
                      <h4 className="font-medium">{session.customerName}</h4>
                      <p className="text-sm text-gray-600">{session.customerEmail}</p>
                      <p className="text-sm text-gray-500 mt-1">{session.lastMessage}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <Badge variant={getPriorityColor(session.priority)}>
                      {session.priority}
                    </Badge>
                    <Badge variant="outline" className="capitalize">
                      {session.status}
                    </Badge>
                    <span className="text-sm text-gray-500">
                      {session.timestamp.toLocaleTimeString()}
                    </span>
                    <Link to="/chat-support">
                      <Button size="sm">
                        Open Chat
                      </Button>
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default SupportDashboard;