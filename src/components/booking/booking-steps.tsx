import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Badge } from "@/components/ui/badge";
import { Calendar as CalendarIcon, Clock, MapPin, CreditCard, CheckCircle, User } from "lucide-react";
import { format } from "date-fns";

interface BookingStep {
  id: number;
  title: string;
  icon: React.ReactNode;
  completed: boolean;
}

interface Passenger {
  name: string;
  age: number | "";
  gender: string;
  seatNumber: number;
  fare: number;
}

const BOOKING_STEPS: BookingStep[] = [
  { id: 1, title: "Select Date", icon: <CalendarIcon className="h-4 w-4" />, completed: false },
  { id: 2, title: "Choose Cab & Time", icon: <Clock className="h-4 w-4" />, completed: false },
  { id: 3, title: "Select Seat", icon: <MapPin className="h-4 w-4" />, completed: false },
  { id: 4, title: "Passenger Details", icon: <User className="h-4 w-4" />, completed: false },
  { id: 5, title: "Payment", icon: <CreditCard className="h-4 w-4" />, completed: false },
  { id: 6, title: "Confirmation", icon: <CheckCircle className="h-4 w-4" />, completed: false },
];

const AVAILABLE_CABS = [
  { id: 1, name: "Premium Ertiga", capacity: 6, price: 550, image: "🚘", available: true, route: 'Agra to Gurugram' },
  { id: 2, name: "Premium Ertiga", capacity: 6, price: 550, image: "🚘", available: true, route: 'Gurugram to Agra' }
];

const TIME_SLOTS = [
  "6:00 AM", "6:00 PM"
];

export const BookingSteps = () => {
  const [currentStep, setCurrentStep] = useState(1);
  const [selectedDate, setSelectedDate] = useState<Date | undefined>();
  const [selectedCab, setSelectedCab] = useState<number | null>(null);
  const [selectedTime, setSelectedTime] = useState<string | null>(null);
  const [selectedSeats, setSelectedSeats] = useState<number[]>([]);
  const [passengers, setPassengers] = useState<Array<Passenger>>([]);

  const nextStep = () => {
    if (currentStep === 3) {
      // Initialize passenger details for selected seats
      const newPassengers = selectedSeats.map(seatNum => {
        const existing = passengers.find(p => p.seatNumber === seatNum);
        return existing || { name: "", age: "", gender: "", seatNumber: seatNum, fare: 550 } as Passenger;
      });
      setPassengers(newPassengers as Passenger[]);
    }
    if (currentStep < 6) {
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
                  className={`cursor-pointer transition-smooth ${selectedCab === cab.id ? 'ring-2 ring-primary' : ''} ${!cab.available ? 'opacity-50' : ''}`}
                  onClick={() => cab.available && setSelectedCab(cab.id)}
                >
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <span className="text-3xl">{cab.image}</span>
                        <div>
                          <h4 className="font-semibold">{cab.name}</h4>
                          <h5 className="text-sm">{ cab.route }</h5>
                          <p className="text-sm text-muted-foreground">
                            {cab.capacity} seats • ₹{cab.price}/trip
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
          <div>
            <h3 className="text-xl font-semibold text-center mb-4">Enter Passenger Details</h3>
            {passengers.map((passenger, idx) => (
              <div key={passenger.seatNumber} className="border rounded p-4 mb-4">
                <h4 className="font-semibold mb-2">Seat {passenger.seatNumber}</h4>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <input
                    type="text"
                    placeholder="Name"
                    value={passenger.name}
                    onChange={e => {
                      const newPax = [...passengers];
                      newPax[idx].name = e.target.value;
                      setPassengers(newPax);
                    }}
                    className="border p-2 rounded"
                  />
                  <input
                    type="number"
                    min={1}
                    placeholder="Age"
                    value={passenger.age}
                    onChange={e => {
                      const newPax = [...passengers];
                      newPax[idx].age = Number(e.target.value) || "";
                      setPassengers(newPax);
                    }}
                    className="border p-2 rounded"
                  />
                  <select
                    value={passenger.gender}
                    onChange={e => {
                      const newPax = [...passengers];
                      newPax[idx].gender = e.target.value;
                      setPassengers(newPax);
                    }}
                    className="border p-2 rounded"
                  >
                    <option value="">Select Gender</option>
                    <option value="male">Male</option>
                    <option value="female">Female</option>
                    <option value="other">Other</option>
                  </select>
                </div>
              </div>
            ))}
            <div className="text-center">
              <Button
                disabled={passengers.some(
                  p => !p.name || !p.age || !p.gender
                )}
                onClick={nextStep}
              >
                Continue
              </Button>
            </div>
          </div>
        );

      case 5:
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
                  <span>₹{(550).toFixed(2)}</span>
                </div>
              </CardContent>
            </Card>
            <Button className="w-full">
              Proceed to Payment
            </Button>
          </div>
        );

      case 6:
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
            currentStep === 6 || 
            (currentStep === 1 && !selectedDate) ||
            (currentStep === 2 && (!selectedCab || !selectedTime)) ||
            (currentStep === 3 && selectedSeats.length === 0) ||
            (currentStep === 4 && passengers.some(p => !p.name || !p.age || !p.gender))
          }
        >
          {currentStep === 6 ? "Complete" : "Next"}
        </Button>
      </div>
    </div>
  );
};
