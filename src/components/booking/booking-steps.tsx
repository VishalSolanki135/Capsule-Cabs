import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Badge } from "@/components/ui/badge";
import { Calendar as CalendarIcon, Clock, MapPin, CreditCard, CheckCircle } from "lucide-react";
import { format } from "date-fns";

interface BookingStep {
  id: number;
  title: string;
  icon: React.ReactNode;
  completed: boolean;
}

const BOOKING_STEPS: BookingStep[] = [
  { id: 1, title: "Select Date", icon: <CalendarIcon className="h-4 w-4" />, completed: false },
  { id: 2, title: "Choose Cab & Time", icon: <Clock className="h-4 w-4" />, completed: false },
  { id: 3, title: "Select Seat", icon: <MapPin className="h-4 w-4" />, completed: false },
  { id: 4, title: "Payment", icon: <CreditCard className="h-4 w-4" />, completed: false },
  { id: 5, title: "Confirmation", icon: <CheckCircle className="h-4 w-4" />, completed: false },
];

const AVAILABLE_CABS = [
  { id: 1, name: "Premium Sedan", capacity: 4, price: 25, image: "🚗", available: true },
  { id: 2, name: "SUV Comfort", capacity: 6, price: 35, image: "🚙", available: true },
  { id: 3, name: "Luxury Premium", capacity: 4, price: 50, image: "🚘", available: false },
];

const TIME_SLOTS = [
  "6:00 AM", "8:00 AM", "10:00 AM", "12:00 PM", 
  "2:00 PM", "4:00 PM", "6:00 PM", "8:00 PM"
];

export const BookingSteps = () => {
  const [currentStep, setCurrentStep] = useState(1);
  const [selectedDate, setSelectedDate] = useState<Date | undefined>();
  const [selectedCab, setSelectedCab] = useState<number | null>(null);
  const [selectedTime, setSelectedTime] = useState<string | null>(null);
  const [selectedSeats, setSelectedSeats] = useState<number[]>([]);

  const nextStep = () => {
    if (currentStep < 5) {
      setCurrentStep(currentStep + 1);
    }
  };

  const prevStep = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const renderSeatLayout = () => {
    const seats = Array.from({ length: 6 }, (_, i) => i + 1);
    const bookedSeats = [2, 5]; // Mock booked seats
    
    return (
      <div className="grid grid-cols-2 gap-4 max-w-xs mx-auto">
        {seats.map((seat) => {
          const isBooked = bookedSeats.includes(seat);
          const isSelected = selectedSeats.includes(seat);
          
          return (
            <button
              key={seat}
              onClick={() => {
                if (!isBooked) {
                  setSelectedSeats(prev => 
                    prev.includes(seat) 
                      ? prev.filter(s => s !== seat)
                      : [...prev, seat]
                  );
                }
              }}
              className={`
                p-4 rounded-lg border-2 transition-smooth font-semibold
                ${isBooked ? 'seat-booked' : isSelected ? 'seat-selected' : 'seat-available'}
              `}
              disabled={isBooked}
            >
              {seat}
            </button>
          );
        })}
      </div>
    );
  };

  const renderStepContent = () => {
    switch (currentStep) {
      case 1:
        return (
          <div className="space-y-6">
            <h3 className="text-xl font-semibold text-center">Select Your Travel Date</h3>
            <div className="flex justify-center">
              <Calendar
                mode="single"
                selected={selectedDate}
                onSelect={setSelectedDate}
                disabled={(date) => date < new Date()}
                className="rounded-md border"
              />
            </div>
            {selectedDate && (
              <p className="text-center text-muted-foreground">
                Selected: {format(selectedDate, "PPP")}
              </p>
            )}
          </div>
        );
      
      case 2:
        return (
          <div className="space-y-6">
            <h3 className="text-xl font-semibold text-center">Choose Your Cab & Time</h3>
            <div className="grid gap-4">
              {AVAILABLE_CABS.map((cab) => (
                <Card 
                  key={cab.id} 
                  className={`cursor-pointer transition-smooth ${
                    selectedCab === cab.id ? 'ring-2 ring-primary' : ''
                  } ${!cab.available ? 'opacity-50' : ''}`}
                  onClick={() => cab.available && setSelectedCab(cab.id)}
                >
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <span className="text-3xl">{cab.image}</span>
                        <div>
                          <h4 className="font-semibold">{cab.name}</h4>
                          <p className="text-sm text-muted-foreground">
                            {cab.capacity} seats • ${cab.price}/trip
                          </p>
                        </div>
                      </div>
                      <Badge variant={cab.available ? "default" : "secondary"}>
                        {cab.available ? "Available" : "Full"}
                      </Badge>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
            
            <div className="space-y-4">
              <h4 className="font-semibold">Available Time Slots</h4>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                {TIME_SLOTS.map((time) => (
                  <Button
                    key={time}
                    variant={selectedTime === time ? "default" : "outline"}
                    onClick={() => setSelectedTime(time)}
                    className="transition-smooth"
                  >
                    {time}
                  </Button>
                ))}
              </div>
            </div>
          </div>
        );
      
      case 3:
        return (
          <div className="space-y-6">
            <h3 className="text-xl font-semibold text-center">Select Your Seat</h3>
            <div className="space-y-4">
              <div className="flex justify-center">
                <div className="bg-muted p-2 rounded text-sm font-medium">Driver</div>
              </div>
              {renderSeatLayout()}
              <div className="flex justify-center gap-6 text-sm">
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 bg-muted rounded border"></div>
                  <span>Available</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 bg-primary rounded"></div>
                  <span>Selected</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 bg-destructive rounded"></div>
                  <span>Booked</span>
                </div>
              </div>
            </div>
          </div>
        );
      
      case 4:
        return (
          <div className="space-y-6">
            <h3 className="text-xl font-semibold text-center">Payment Details</h3>
            <Card>
              <CardHeader>
                <CardTitle>Booking Summary</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex justify-between">
                  <span>Date:</span>
                  <span>{selectedDate ? format(selectedDate, "PPP") : "Not selected"}</span>
                </div>
                <div className="flex justify-between">
                  <span>Time:</span>
                  <span>{selectedTime || "Not selected"}</span>
                </div>
                <div className="flex justify-between">
                  <span>Seats:</span>
                  <span>{selectedSeats.join(", ") || "None selected"}</span>
                </div>
                <div className="flex justify-between font-semibold">
                  <span>Total:</span>
                  <span>$25.00</span>
                </div>
              </CardContent>
            </Card>
            <Button className="w-full">
              Proceed to Payment
            </Button>
          </div>
        );
      
      case 5:
        return (
          <div className="space-y-6 text-center">
            <div className="text-success text-6xl">✅</div>
            <h3 className="text-xl font-semibold">Booking Confirmed!</h3>
            <Card>
              <CardContent className="p-6 space-y-2">
                <p><strong>Booking ID:</strong> #CB123456</p>
                <p><strong>Date:</strong> {selectedDate ? format(selectedDate, "PPP") : ""}</p>
                <p><strong>Time:</strong> {selectedTime}</p>
                <p><strong>Seats:</strong> {selectedSeats.join(", ")}</p>
              </CardContent>
            </Card>
            <Button onClick={() => setCurrentStep(1)}>
              Book Another Ride
            </Button>
          </div>
        );
      
      default:
        return null;
    }
  };

  return (
    <div className="space-y-8">
      {/* Step Progress */}
      <div className="flex justify-center">
        <div className="flex items-center space-x-4">
          {BOOKING_STEPS.map((step, index) => (
            <div key={step.id} className="flex items-center">
              <div className={`
                flex items-center justify-center w-10 h-10 rounded-full border-2 transition-smooth
                ${currentStep >= step.id 
                  ? 'bg-primary text-primary-foreground border-primary' 
                  : 'bg-background text-muted-foreground border-border'
                }
              `}>
                {step.icon}
              </div>
              {index < BOOKING_STEPS.length - 1 && (
                <div className={`
                  w-16 h-0.5 mx-2 transition-smooth
                  ${currentStep > step.id ? 'bg-primary' : 'bg-border'}
                `} />
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Step Content */}
      <Card className="max-w-2xl mx-auto">
        <CardContent className="p-8">
          {renderStepContent()}
        </CardContent>
      </Card>

      {/* Navigation Buttons */}
      <div className="flex justify-between max-w-2xl mx-auto">
        <Button 
          variant="outline" 
          onClick={prevStep}
          disabled={currentStep === 1}
        >
          Previous
        </Button>
        <Button 
          onClick={nextStep}
          disabled={
            currentStep === 5 || 
            (currentStep === 1 && !selectedDate) ||
            (currentStep === 2 && (!selectedCab || !selectedTime)) ||
            (currentStep === 3 && selectedSeats.length === 0)
          }
        >
          {currentStep === 5 ? "Complete" : "Next"}
        </Button>
      </div>
    </div>
  );
};