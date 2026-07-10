import { CheckCircle, Plane, MapPin, Calendar, Ticket, User } from 'lucide-react';
import type { Flight } from '../lib/supabase';

type BookingConfirmationProps = {
  bookingReference: string;
  flight: Flight;
  seat: string;
  classType: string;
  price: number;
  passengerName: string;
  onViewBookings: () => void;
  onNewSearch: () => void;
};

export function BookingConfirmation({
  bookingReference,
  flight,
  seat,
  classType,
  price,
  passengerName,
  onViewBookings,
  onNewSearch,
}: BookingConfirmationProps) {
  const departureTime = new Date(flight.departure_time);
  const arrivalTime = new Date(flight.arrival_time);
  const duration = flight.duration_minutes;
  const hours = Math.floor(duration / 60);
  const minutes = duration % 60;

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: false });
  };

  const formatDate = (date: Date) => {
    return date.toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });
  };

  return (
    <div className="max-w-2xl mx-auto">
      {/* Success Header */}
      <div className="bg-gradient-to-br from-blue-600 to-cyan-500 rounded-t-2xl p-8 text-center text-white">
        <div className="w-20 h-20 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-4">
          <CheckCircle className="h-12 w-12 text-white" />
        </div>
        <h2 className="text-3xl font-bold mb-2">Booking Confirmed!</h2>
        <p className="text-blue-100">Your reservation has been successfully processed</p>
        <div className="mt-4 inline-flex items-center gap-2 bg-white/20 px-4 py-2 rounded-lg">
          <span className="text-sm">Booking Reference</span>
          <span className="font-bold text-lg ml-1">{bookingReference}</span>
        </div>
      </div>

      {/* Ticket Card */}
      <div className="bg-white rounded-b-2xl shadow-xl border border-gray-200 overflow-hidden">
        {/* Flight Details */}
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <Ticket className="h-5 w-5 text-blue-500" />
              <span className="font-semibold text-gray-900">Flight Details</span>
            </div>
            <span className="px-3 py-1 bg-green-100 text-green-700 rounded-full text-sm font-medium">
              Confirmed
            </span>
          </div>

          <div className="flex items-center gap-4">
            <div className="flex items-center gap-4 flex-1">
              <div className="text-center">
                <div className="text-3xl font-bold text-gray-900">{formatTime(departureTime)}</div>
                <div className="text-lg font-semibold text-blue-600">{flight.origin_airport?.code}</div>
                <div className="text-sm text-gray-500">{flight.origin_airport?.city}</div>
              </div>
              <div className="flex-1 flex items-center">
                <div className="flex-1 h-px bg-gray-300"></div>
                <div className="px-4 text-center">
                  <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                    <Plane className="h-4 w-4 text-blue-600" />
                  </div>
                  <div className="text-xs text-gray-500 mt-1">{hours}h {minutes}m</div>
                </div>
                <div className="flex-1 h-px bg-gray-300"></div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-gray-900">{formatTime(arrivalTime)}</div>
                <div className="text-lg font-semibold text-cyan-600">{flight.destination_airport?.code}</div>
                <div className="text-sm text-gray-500">{flight.destination_airport?.city}</div>
              </div>
            </div>
          </div>

          <div className="mt-4 flex flex-wrap gap-4 text-sm">
            <div className="flex items-center gap-2 text-gray-600">
              <Calendar className="h-4 w-4" />
              {formatDate(departureTime)}
            </div>
            <div className="flex items-center gap-2 text-gray-600">
              <Plane className="h-4 w-4" />
              {flight.airline?.name || 'Airline'} - {flight.flight_number}
            </div>
          </div>
        </div>

        {/* Passenger & Seat */}
        <div className="grid grid-cols-2 divide-x divide-gray-200">
          <div className="p-6">
            <div className="flex items-center gap-2 mb-3">
              <User className="h-5 w-5 text-blue-500" />
              <span className="font-semibold text-gray-900">Passenger</span>
            </div>
            <div className="text-lg font-medium text-gray-900">{passengerName}</div>
          </div>
          <div className="p-6">
            <div className="flex items-center gap-2 mb-3">
              <MapPin className="h-5 w-5 text-blue-500" />
              <span className="font-semibold text-gray-900">Seat</span>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center text-xl font-bold text-blue-600">
                {seat}
              </div>
              <div>
                <div className="font-medium text-gray-900">{seat}</div>
                <div className="text-sm text-gray-500 capitalize">{classType} Class</div>
              </div>
            </div>
          </div>
        </div>

        {/* Price */}
        <div className="p-6 bg-gray-50 border-t border-gray-200">
          <div className="flex justify-between items-center">
            <span className="text-gray-600">Total Paid</span>
            <div className="text-right">
              <div className="text-2xl font-bold text-gray-900">${price.toLocaleString()}</div>
              <div className="text-sm text-gray-500">incl. taxes & fees</div>
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="p-6 flex flex-col sm:flex-row gap-3 border-t border-gray-200">
          <button
            onClick={onViewBookings}
            className="flex-1 py-3 px-4 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transition-colors flex items-center justify-center gap-2"
          >
            <Ticket className="h-5 w-5" />
            View My Bookings
          </button>
          <button
            onClick={onNewSearch}
            className="flex-1 py-3 px-4 border border-gray-300 text-gray-700 font-semibold rounded-lg hover:bg-gray-50 transition-colors"
          >
            Book Another Flight
          </button>
        </div>
      </div>

      {/* Email Notice */}
      <div className="mt-4 text-center text-sm text-gray-500">
        <p>A confirmation email has been sent to your registered email address.</p>
        <p className="flex items-center justify-center gap-1 mt-1">
          <Ticket className="h-4 w-4 text-blue-500" />
          Remember to check-in 24 hours before departure
        </p>
      </div>
    </div>
  );
}
