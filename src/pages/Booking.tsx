import { Navigation } from "@/components/ui/navigation";
import { BookingSteps } from "@/components/booking/booking-steps";

const Booking = () => {
  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      <main className="container mx-auto px-4 py-8">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold mb-4">Book Your Ride</h1>
          <p className="text-muted-foreground text-lg">
            Complete your booking in just a few simple steps
          </p>
        </div>
        <BookingSteps />
      </main>
    </div>
  );
};

export default Booking;