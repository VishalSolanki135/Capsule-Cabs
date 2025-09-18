import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Badge } from "@/components/ui/badge";
import { Calendar as CalendarIcon, Clock, MapPin, CreditCard, CheckCircle, User } from "lucide-react";
import { format } from "date-fns";
import api from "@/services/api";

interface BookingStep {
  id: number;
  title: string;
  icon: React.ReactNode;
  completed: boolean;
}

interface SeatAvailability {
  seatNumber: string;
  status: "available" | "booked" | "locked" | "blocked";
  price: number;
  seatType: string;
}

interface CabWithAvailability {
  id: string;
  name: string;
  capacity: number;
  price: number;
  image: string;
  available: boolean;
  route: string;
  seatsAvailable: SeatAvailability[];
}

interface Passenger {
  name: string;
  age: number | "";
  gender: string;
  seatNumber: string;
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

const TIME_SLOTS = ["6:00 AM", "6:00 PM"];

export const BookingSteps = () => {
  const [currentStep, setCurrentStep] = useState(1);
  const [selectedDate, setSelectedDate] = useState<Date | undefined>();
  const [selectedCab, setSelectedCab] = useState<string | null>(null);
  const [selectedTime, setSelectedTime] = useState<string | null>(null);
  const [selectedSeats, setSelectedSeats] = useState<string[]>([]);
  const [passengers, setPassengers] = useState<Passenger[]>([]);
  const [availableCabs, setAvailableCabs] = useState<CabWithAvailability[]>([]);

  useEffect(() => {
    const fetchRoutesAndAvailability = async () => {
      try {
        const routesRes = await api.get("/routes/my-routes");
        const routes = routesRes.data.data.routes;

        const cabsWithAvailabilityPromises = routes.map(async (route: any) => {
          let seatsAvailable: SeatAvailability[] = [];
          let available = false;

          if (selectedDate) {
            const dateStr = selectedDate.toISOString().slice(0, 10);
            try {
              const seatAvailRes = await api.get(
                `/routes/${route._id}/availability?travelDate=${dateStr}`
              );
              seatsAvailable = seatAvailRes.data.data.seatsAvailable || [];
              available = seatsAvailable.some((seat) => seat.status === "available");
            } catch {
              seatsAvailable = [];
              available = false;
            }
          }

          return {
            id: route._id,
            name: route.vehicle?.type || "Cab",
            capacity: route.vehicle?.capacity || 6,
            price: route.pricing?.baseFare || 550,
            image: "🚘",
            route: `${route.origin?.city || ""} to ${route.destination?.city || ""}`,
            available,
            seatsAvailable,
          };
        });

        const cabsWithAvailability = await Promise.all(cabsWithAvailabilityPromises);
        setAvailableCabs(cabsWithAvailability);
      } catch (error) {
        console.error("Failed to fetch route or availability data", error);
      }
    };

    fetchRoutesAndAvailability();
  }, [selectedDate]);

  const nextStep = () => {
    if (currentStep === 3) {
      const newPassengers: Passenger[] = selectedSeats.map((seatNum) => {
        const existing = passengers.find((p) => p.seatNumber === seatNum);
        return (
          existing || {
            name: "",
            age: "",
            gender: "",
            seatNumber: seatNum,
            fare:
              availableCabs.find((cab) => cab.id === selectedCab)?.seatsAvailable.find(
                (seat) => seat.seatNumber === seatNum
              )?.price || 550,
          }
        );
      });
      setPassengers(newPassengers);
    }
    if (currentStep < 6) {
      setCurrentStep((prev) => prev + 1);
    }
  };

  const prevStep = () => {
    if (currentStep > 1) {
      setCurrentStep((prev) => prev - 1);
    }
  };

  const renderSeatLayout = () => {
    if (!selectedCab) return null;

    const cab = availableCabs.find((c) => c.id === selectedCab);
    if (!cab) return null;

    const seats = cab.seatsAvailable || [];

    return (
      <div className="grid grid-cols-3 gap-4 max-w-xs mx-auto">
        {seats.map((seat) => {
          const isBooked = seat.status !== "available";
          const isSelected = selectedSeats.includes(seat.seatNumber);
          return (
            <button
              key={seat.seatNumber}
              onClick={() => {
                if (!isBooked) {
                  setSelectedSeats((prev) =>
                    prev.includes(seat.seatNumber)
                      ? prev.filter((s) => s !== seat.seatNumber)
                      : [...prev, seat.seatNumber]
                  );
                }
              }}
              className={`p-4 rounded-lg border-2 transition-smooth font-semibold ${
                isBooked ? "seat-booked" : isSelected ? "seat-selected" : "seat-available"
              }`}
              disabled={isBooked}
            >
              {seat.seatNumber}
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
              {availableCabs.map((cab) => (
                <Card
                  key={cab.id}
                  className={`cursor-pointer transition-smooth ${
                    selectedCab === cab.id ? "ring-2 ring-primary" : ""
                  } ${!cab.available ? "opacity-50" : ""}`}
                  onClick={() => cab.available && setSelectedCab(cab.id)}
                >
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <span className="text-3xl">{cab.image}</span>
                        <div>
                          <h4 className="font-semibold">{cab.name}</h4>
                          <h5 className="text-sm">{cab.route}</h5>
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
                    onChange={(e) => {
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
                    onChange={(e) => {
                      const newPax = [...passengers];
                      newPax[idx].age = Number(e.target.value) || "";
                      setPassengers(newPax);
                    }}
                    className="border p-2 rounded"
                  />
                  <select
                    value={passenger.gender}
                    onChange={(e) => {
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
                disabled={passengers.some((p) => !p.name || !p.age || !p.gender)}
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
                  <span>₹{(selectedSeats.length * 550).toFixed(2)}</span>
                </div>
              </CardContent>
            </Card>
            <Button className="w-full" onClick={() => alert('Implement payment flow')}>
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
                <p>
                  <strong>Booking ID:</strong> #CB123456
                </p>
                <p>
                  <strong>Date:</strong> {selectedDate ? format(selectedDate, "PPP") : ""}
                </p>
                <p>
                  <strong>Time:</strong> {selectedTime}
                </p>
                <p>
                  <strong>Seats:</strong> {selectedSeats.join(", ")}
                </p>
              </CardContent>
            </Card>
            <Button onClick={() => setCurrentStep(1)}>Book Another Ride</Button>
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
              <div
                className={`flex items-center justify-center w-10 h-10 rounded-full border-2 transition-smooth ${
                  currentStep >= step.id
                    ? "bg-primary text-primary-foreground border-primary"
                    : "bg-background text-muted-foreground border-border"
                }`}
              >
                {step.icon}
              </div>
              {index < BOOKING_STEPS.length - 1 && (
                <div
                  className={`w-16 h-0.5 mx-2 transition-smooth ${
                    currentStep > step.id ? "bg-primary" : "bg-border"
                  }`}
                />
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Step Content */}
      <Card className="max-w-2xl mx-auto">
        <CardContent className="p-8">{renderStepContent()}</CardContent>
      </Card>

      {/* Navigation Buttons */}
      <div className="flex justify-between max-w-2xl mx-auto">
        <Button variant="outline" onClick={prevStep} disabled={currentStep === 1}>
          Previous
        </Button>
        <Button
          onClick={nextStep}
          disabled={
            currentStep === 6 ||
            (currentStep === 1 && !selectedDate) ||
            (currentStep === 2 && (!selectedCab || !selectedTime)) ||
            (currentStep === 3 && selectedSeats.length === 0) ||
            (currentStep === 4 && passengers.some((p) => !p.name || !p.age || !p.gender))
          }
        >
          {currentStep === 6 ? "Complete" : "Next"}
        </Button>
      </div>
    </div>
  );
};
