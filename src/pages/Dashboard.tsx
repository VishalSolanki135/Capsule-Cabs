import { Navigation } from "@/components/ui/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Calendar, Clock, MapPin, CreditCard, X } from "lucide-react";

const UPCOMING_BOOKINGS = [
  {
    id: "CB123456",
    date: "2024-01-25",
    time: "10:00 AM",
    cab: "Premium Sedan",
    seats: [1, 2],
    amount: 25,
    status: "confirmed"
  },
  {
    id: "CB123457", 
    date: "2024-01-28",
    time: "2:00 PM",
    cab: "SUV Comfort",
    seats: [3],
    amount: 35,
    status: "confirmed"
  }
];

const PAST_TRIPS = [
  {
    id: "CB123400",
    date: "2024-01-15",
    time: "9:00 AM",
    cab: "Premium Sedan",
    seats: [1],
    amount: 25,
    status: "completed"
  },
  {
    id: "CB123401",
    date: "2024-01-10",
    time: "6:00 PM", 
    cab: "Luxury Premium",
    seats: [2, 3],
    amount: 50,
    status: "completed"
  },
  {
    id: "CB123402",
    date: "2024-01-05",
    time: "12:00 PM",
    cab: "SUV Comfort", 
    seats: [4],
    amount: 35,
    status: "completed"
  }
];

const Dashboard = () => {
  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      <main className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-2">My Dashboard</h1>
          <p className="text-muted-foreground text-lg">
            Manage your bookings and view your travel history
          </p>
        </div>

        <Tabs defaultValue="upcoming" className="space-y-6">
          <TabsList className="grid w-full max-w-md grid-cols-2">
            <TabsTrigger value="upcoming">Upcoming Bookings</TabsTrigger>
            <TabsTrigger value="history">Trip History</TabsTrigger>
          </TabsList>

          <TabsContent value="upcoming" className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-semibold">Upcoming Trips</h2>
              <Badge variant="secondary">
                {UPCOMING_BOOKINGS.length} booking{UPCOMING_BOOKINGS.length !== 1 ? 's' : ''}
              </Badge>
            </div>
            
            {UPCOMING_BOOKINGS.length === 0 ? (
              <Card>
                <CardContent className="flex flex-col items-center justify-center py-12">
                  <Calendar className="h-12 w-12 text-muted-foreground mb-4" />
                  <h3 className="text-lg font-medium mb-2">No upcoming bookings</h3>
                  <p className="text-muted-foreground text-center mb-4">
                    You don't have any trips scheduled. Ready to book your next ride?
                  </p>
                  <Button>Book a Ride</Button>
                </CardContent>
              </Card>
            ) : (
              <div className="grid gap-4">
                {UPCOMING_BOOKINGS.map((booking) => (
                  <Card key={booking.id} className="transition-smooth hover:shadow-md">
                    <CardHeader className="pb-3">
                      <div className="flex items-center justify-between">
                        <CardTitle className="text-lg">Booking #{booking.id}</CardTitle>
                        <Badge variant="default">Confirmed</Badge>
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                        <div className="flex items-center gap-2">
                          <Calendar className="h-4 w-4 text-muted-foreground" />
                          <span className="text-sm">{booking.date}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Clock className="h-4 w-4 text-muted-foreground" />
                          <span className="text-sm">{booking.time}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <MapPin className="h-4 w-4 text-muted-foreground" />
                          <span className="text-sm">Seats {booking.seats.join(", ")}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <CreditCard className="h-4 w-4 text-muted-foreground" />
                          <span className="text-sm">${booking.amount}</span>
                        </div>
                      </div>
                      <div className="flex items-center justify-between pt-2 border-t">
                        <span className="text-sm font-medium">{booking.cab}</span>
                        <Button variant="outline" size="sm" className="text-destructive hover:text-destructive">
                          <X className="h-4 w-4 mr-1" />
                          Cancel Booking
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>

          <TabsContent value="history" className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-semibold">Trip History</h2>
              <Badge variant="secondary">
                {PAST_TRIPS.length} completed trip{PAST_TRIPS.length !== 1 ? 's' : ''}
              </Badge>
            </div>
            
            <div className="grid gap-4">
              {PAST_TRIPS.map((trip) => (
                <Card key={trip.id} className="transition-smooth hover:shadow-md">
                  <CardHeader className="pb-3">
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-lg">Trip #{trip.id}</CardTitle>
                      <Badge variant="outline" className="text-success border-success">
                        Completed
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                      <div className="flex items-center gap-2">
                        <Calendar className="h-4 w-4 text-muted-foreground" />
                        <span className="text-sm">{trip.date}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Clock className="h-4 w-4 text-muted-foreground" />
                        <span className="text-sm">{trip.time}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <MapPin className="h-4 w-4 text-muted-foreground" />
                        <span className="text-sm">Seats {trip.seats.join(", ")}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <CreditCard className="h-4 w-4 text-muted-foreground" />
                        <span className="text-sm">${trip.amount}</span>
                      </div>
                    </div>
                    <div className="flex items-center justify-between pt-4 border-t mt-4">
                      <span className="text-sm font-medium">{trip.cab}</span>
                      <Button variant="outline" size="sm">
                        View Receipt
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
};

export default Dashboard;