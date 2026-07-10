import { Clock, ArrowRight, Users, Star, Check } from 'lucide-react';
import type { Flight } from '../lib/supabase';

type FlightCardProps = {
  flight: Flight;
  classType: string;
  onSelect: (flight: Flight) => void;
};

export function FlightCard({ flight, classType, onSelect }: FlightCardProps) {
  const departureTime = new Date(flight.departure_time);
  const arrivalTime = new Date(flight.arrival_time);
  const duration = flight.duration_minutes;
  const hours = Math.floor(duration / 60);
  const minutes = duration % 60;

  const price = classType === 'business' && flight.business_class_price
    ? flight.business_class_price
    : flight.base_price;

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: false });
  };

  const stops = Math.random() > 0.5 ? 0 : 1;

  return (
    <div className="bg-white rounded-xl border border-gray-200 overflow-hidden hover:shadow-lg transition-all group">
      <div className="p-6">
        <div className="flex flex-col lg:flex-row gap-6">
          {/* Airline Info */}
          <div className="flex items-center gap-4 lg:w-40">
            <div className="w-12 h-12 bg-gradient-to-br from-blue-50 to-cyan-50 rounded-lg flex items-center justify-center text-lg font-bold text-blue-600">
              {flight.airline?.code || flight.flight_number.substring(0, 2)}
            </div>
            <div>
              <div className="font-medium text-gray-900">{flight.airline?.name || 'Airline'}</div>
              <div className="text-sm text-gray-500">{flight.flight_number}</div>
            </div>
          </div>

          {/* Flight Times */}
          <div className="flex-1 flex items-center">
            <div className="flex-1">
              <div className="text-2xl font-bold text-gray-900">{formatTime(departureTime)}</div>
              <div className="text-sm text-gray-500">{flight.origin_airport?.city || flight.origin_airport_id}</div>
              <div className="text-xs text-gray-400">{flight.origin_airport?.code}</div>
            </div>

            <div className="px-4 flex-1">
              <div className="flex items-center justify-center">
                <div className="flex-1 h-px bg-gray-300"></div>
                <div className="px-3 flex flex-col items-center">
                  <Clock className="h-4 w-4 text-gray-400 mb-1" />
                  <span className="text-sm font-medium text-gray-600">{hours}h {minutes}m</span>
                  {stops === 0 ? (
                    <span className="text-xs text-green-600 font-medium">Direct</span>
                  ) : (
                    <span className="text-xs text-amber-600">{stops} stop</span>
                  )}
                </div>
                <div className="flex-1 h-px bg-gray-300"></div>
              </div>
              <div className="text-center mt-1">
                <ArrowRight className="h-4 w-4 text-gray-400 inline-block" />
              </div>
            </div>

            <div className="flex-1 text-right">
              <div className="text-2xl font-bold text-gray-900">{formatTime(arrivalTime)}</div>
              <div className="text-sm text-gray-500">{flight.destination_airport?.city || flight.destination_airport_id}</div>
              <div className="text-xs text-gray-400">{flight.destination_airport?.code}</div>
            </div>
          </div>

          {/* Price and Select */}
          <div className="lg:w-48 flex flex-col items-end justify-between gap-4">
            <div className="text-right">
              <div className="text-xs text-gray-500 uppercase tracking-wide">{classType}</div>
              <div className="text-3xl font-bold text-gray-900">
                ${price.toLocaleString()}
              </div>
              <div className="text-xs text-gray-500">per person</div>
            </div>
            <button
              onClick={() => onSelect(flight)}
              className="w-full lg:flex-1 min-h-12 px-6 py-3 bg-gradient-to-r from-blue-600 to-cyan-500 text-white font-semibold rounded-lg hover:from-blue-700 hover:to-cyan-600 transition-all shadow-sm hover:shadow-md flex items-center justify-center gap-2 group-hover:scale-105"
            >
              Select
            </button>
          </div>
        </div>
      </div>

      {/* Flight Details Footer */}
      <div className="px-6 py-3 bg-gray-50 flex items-center justify-between text-sm">
        <div className="flex items-center gap-4">
          <span className="flex items-center gap-1 text-gray-600">
            <Users className="h-4 w-4" />
            {flight.aircraft_type?.model || 'Aircraft'}
          </span>
          <span className="flex items-center gap-1 text-gray-600">
            <Check className="h-4 w-4 text-green-500" />
            Free cancellation
          </span>
        </div>
        <div className="flex items-center gap-1 text-amber-500">
          <Star className="h-4 w-4 fill-current" />
          <span className="font-medium">4.8</span>
        </div>
      </div>
    </div>
  );
}

export function FlightResults({ flights, classType, onSelect, isLoading }: {
  flights: Flight[];
  classType: string;
  onSelect: (flight: Flight) => void;
  isLoading?: boolean;
}) {
  if (isLoading) {
    return (
      <div className="space-y-4">
        {[1, 2, 3].map((i) => (
          <div key={i} className="bg-white rounded-xl border border-gray-200 p-6 animate-pulse">
            <div className="flex gap-6">
              <div className="w-40 h-12 bg-gray-200 rounded"></div>
              <div className="flex-1 h-12 bg-gray-200 rounded"></div>
              <div className="w-48 h-12 bg-gray-200 rounded"></div>
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (flights.length === 0) {
    return (
      <div className="bg-white rounded-xl border border-gray-200 p-12 text-center">
        <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <Clock className="h-10 w-10 text-gray-400" />
        </div>
        <h3 className="text-xl font-semibold text-gray-900 mb-2">No flights found</h3>
        <p className="text-gray-500">Try adjusting your search criteria or dates</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold text-gray-900">
          {flights.length} {flights.length === 1 ? 'flight' : 'flights'} found
        </h2>
        <select className="px-4 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500">
          <option>Sort by: Price (Low to High)</option>
          <option>Sort by: Price (High to Low)</option>
          <option>Sort by: Duration</option>
          <option>Sort by: Departure Time</option>
        </select>
      </div>
      {flights.map((flight) => (
        <FlightCard
          key={flight.id}
          flight={flight}
          classType={classType}
          onSelect={onSelect}
        />
      ))}
    </div>
  );
}
