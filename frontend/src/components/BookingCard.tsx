import { Plane, Calendar, User, Ticket, XCircle, CheckCircle } from 'lucide-react';
import type { Flight, Booking, Passenger } from '../lib/supabase';

type BookingWithDetails = Booking & {
  flight: Flight;
  passenger: Passenger;
};

type BookingCardProps = {
  booking: BookingWithDetails;
  onCancel?: () => void;
};

export function BookingCard({ booking, onCancel }: BookingCardProps) {
  const flight = booking.flight;
  const passenger = booking.passenger;
  const departureTime = new Date(flight.departure_time);
  const arrivalTime = new Date(flight.arrival_time);
  const duration = flight.duration_minutes;
  const hours = Math.floor(duration / 60);
  const minutes = duration % 60;

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: false });
  };

  const formatDate = (date: Date) => {
    const now = new Date();
    const diff = date.getTime() - now.getTime();
    const days = Math.ceil(diff / (1000 * 60 * 60 * 24));
    if (days === 0) return 'Today';
    if (days === 1) return 'Tomorrow';
    if (days < 0) return `${Math.abs(days)} days ago`;
    return `In ${days} days`;
  };

  const getDaysUntil = (date: Date) => {
    const now = new Date();
    const diff = date.getTime() - now.getTime();
    const daysDiff = Math.ceil(diff / (1000 * 60 * 60 * 24));
    return daysDiff;
  };

  const getStatusColor = () => {
    if (booking.status === 'cancelled') return 'bg-red-100 text-red-700';
    if (booking.status === 'confirmed') return 'bg-green-100 text-green-700';
    return 'bg-blue-100 text-blue-700';
  };

  return (
    <div className="bg-white rounded-xl border border-gray-200 overflow-hidden hover:shadow-lg transition-shadow">
      {/* Status Bar */}
      <div className={`p-3 ${getStatusColor().replace('text-', 'text-').replace('bg-', 'bg-')} flex items-center justify-between`}>
        <div className="flex items-center gap-2">
          {booking.status === 'cancelled' ? (
            <XCircle className="h-5 w-5" />
          ) : (
            <CheckCircle className="h-5 w-5" />
          )}
          <span className="font-semibold capitalize">{booking.status}</span>
        </div>
        <div className="flex items-center gap-2">
          <Ticket className="h-4 w-4" />
          <span className="font-mono font-bold">{booking.booking_reference}</span>
        </div>
      </div>

      {/* Main Content */}
      <div className="p-6">
        {/* Flight Route */}
        <div className="flex items-center gap-4 mb-4">
          <div className="flex-1">
            <div className="text-3xl font-bold text-gray-900">{formatTime(departureTime)}</div>
            <div className="text-xl font-semibold text-blue-600">{flight.origin_airport?.code}</div>
            <div className="text-sm text-gray-500">{flight.origin_airport?.city}</div>
          </div>
          <div className="flex-1 flex items-center">
            <div className="flex-1 h-px bg-gray-300"></div>
            <div className="px-4 flex flex-col items-center">
              <div className="flex items-center gap-1">
                <Plane className="h-4 w-4 text-blue-500" />
              </div>
              <div className="text-xs text-gray-500">{hours}h {minutes}m</div>
              <div className="text-xs text-gray-400">Direct</div>
            </div>
            <div className="flex-1 h-px bg-gray-300"></div>
          </div>
          <div className="flex-1 text-right">
            <div className="text-3xl font-bold text-gray-900">{formatTime(arrivalTime)}</div>
            <div className="text-xl font-semibold text-cyan-600">{flight.destination_airport?.code}</div>
            <div className="text-sm text-gray-500">{flight.destination_airport?.city}</div>
          </div>
        </div>

        {/* Date and Countdown */}
        <div className="flex items-center justify-between text-sm mb-4 pb-4 border-b border-gray-200">
          <div className="flex items-center gap-2 text-gray-600">
            <Calendar className="h-4 w-4" />
            {departureTime.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })}
          </div>
          {booking.status !== 'cancelled' && (
            <div className={`px-3 py-1 rounded-full text-xs font-medium ${
              getDaysUntil(departureTime) <= 1 ? 'bg-amber-100 text-amber-700' : 'bg-blue-100 text-blue-700'
            }`}>
              {formatDate(departureTime)}
            </div>
          )}
        </div>

        {/* Details Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
          <div>
            <div className="text-gray-500 mb-1">Flight</div>
            <div className="font-mono font-bold text-gray-900">{flight.flight_number}</div>
          </div>
          <div>
            <div className="text-gray-500 mb-1">Seat</div>
            <div className="font-bold text-gray-900">{booking.seat_number}</div>
          </div>
          <div>
            <div className="text-gray-500 mb-1">Class</div>
            <div className="font-bold text-gray-900 capitalize">{booking.class_type}</div>
          </div>
          <div>
            <div className="text-gray-500 mb-1">Price</div>
            <div className="font-bold text-gray-900">${booking.price.toLocaleString()}</div>
          </div>
        </div>

        {/* Passenger */}
        <div className="mt-4 pt-4 border-t border-gray-200 flex items-center gap-3">
          <div className="w-10 h-10 bg-gradient-to-br from-blue-100 to-cyan-100 rounded-full flex items-center justify-center">
            <User className="h-5 w-5 text-blue-600" />
          </div>
          <div>
            <div className="font-medium text-gray-900">{passenger.first_name} {passenger.last_name}</div>
            <div className="text-sm text-gray-500">{passenger.email}</div>
          </div>
        </div>
      </div>

      {/* Actions */}
      {booking.status !== 'cancelled' && onCancel && getDaysUntil(departureTime) > 0 && (
        <div className="px-6 py-4 bg-gray-50 border-t border-gray-200">
          <button
            onClick={onCancel}
            className="text-red-600 hover:text-red-700 text-sm font-medium flex items-center gap-1"
          >
            <XCircle className="h-4 w-4" />
            Cancel Booking
          </button>
        </div>
      )}
    </div>
  );
}

export function BookingsList({ bookings, onCancel }: {
  bookings: BookingWithDetails[];
  onCancel?: (booking: Booking) => void;
}) {
  if (bookings.length === 0) {
    return (
      <div className="bg-white rounded-xl border border-gray-200 p-12 text-center">
        <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <Ticket className="h-10 w-10 text-gray-400" />
        </div>
        <h3 className="text-xl font-semibold text-gray-900 mb-2">No bookings yet</h3>
        <p className="text-gray-500">Start searching for flights to make your first booking</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold text-gray-900">
          {bookings.length} {bookings.length === 1 ? 'booking' : 'bookings'}
        </h2>
      </div>
      {bookings.map((booking) => (
        <BookingCard
          key={booking.id}
          booking={booking}
          onCancel={() => onCancel?.(booking)}
        />
      ))}
    </div>
  );
}
