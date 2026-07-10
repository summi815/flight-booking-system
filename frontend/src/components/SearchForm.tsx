import { useState, useEffect, useRef } from 'react';
import { MapPin, Calendar, ArrowLeftRight, Users, Search, Loader2, ChevronDown } from 'lucide-react';
import { api } from '../lib/api';
import type { Airport } from '../lib/supabase';

type SearchFormProps = {
  onSearch: (origin: string, destination: string, date: string, passengers: number, classType: string) => void;
  isLoading?: boolean;
};

export function SearchForm({ onSearch, isLoading }: SearchFormProps) {
  const [origin, setOrigin] = useState('');
  const [destination, setDestination] = useState('');
  const [originQuery, setOriginQuery] = useState('');
  const [destinationQuery, setDestinationQuery] = useState('');
  const [originResults, setOriginResults] = useState<Airport[]>([]);
  const [destinationResults, setDestinationResults] = useState<Airport[]>([]);
  const [showOriginDropdown, setShowOriginDropdown] = useState(false);
  const [showDestinationDropdown, setShowDestinationDropdown] = useState(false);
  const [date, setDate] = useState('');
  const [passengers, setPassengers] = useState(1);
  const [classType, setClassType] = useState('economy');
  const [allAirports, setAllAirports] = useState<Airport[]>([]);

  const originRef = useRef<HTMLDivElement>(null);
  const destinationRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    api.getAirports().then(setAllAirports);

    const handleClickOutside = (event: MouseEvent) => {
      if (originRef.current && !originRef.current.contains(event.target as Node)) {
        setShowOriginDropdown(false);
      }
      if (destinationRef.current && !destinationRef.current.contains(event.target as Node)) {
        setShowDestinationDropdown(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    const search = async () => {
      if (originQuery.length >= 1) {
        const results = await api.searchAirports(originQuery);
        setOriginResults(results);
      } else {
        setOriginResults(allAirports.slice(0, 10));
      }
    };
    search();
  }, [originQuery, allAirports]);

  useEffect(() => {
    const search = async () => {
      if (destinationQuery.length >= 1) {
        const results = await api.searchAirports(destinationQuery);
        setDestinationResults(results);
      } else {
        setDestinationResults(allAirports.slice(0, 10));
      }
    };
    search();
  }, [destinationQuery, allAirports]);

  const swapAirports = () => {
    const tempCode = origin;
    const tempQuery = originQuery;
    setOrigin(destination);
    setOriginQuery(destinationQuery);
    setDestination(tempCode);
    setDestinationQuery(tempQuery);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (origin && destination && date) {
      onSearch(origin, destination, date, passengers, classType);
    }
  };

  const setToday = () => {
    const today = new Date().toISOString().split('T')[0];
    setDate(today);
  };

  const setTomorrow = () => {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    setDate(tomorrow.toISOString().split('T')[0]);
  };

  return (
    <div className="bg-white rounded-2xl shadow-xl p-6 md:p-8">
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Route Selection */}
        <div className="grid grid-cols-1 md:grid-cols-[1fr,auto,1fr] gap-4 items-end">
          {/* Origin */}
          <div className="relative" ref={originRef}>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              From
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                <MapPin className="h-5 w-5 text-blue-500" />
              </div>
              <input
                type="text"
                value={originQuery}
                onChange={(e) => {
                  setOriginQuery(e.target.value);
                  setShowOriginDropdown(true);
                }}
                onFocus={() => setShowOriginDropdown(true)}
                placeholder="Origin city or airport"
                className="w-full pl-12 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all text-gray-900"
              />
            </div>
            {showOriginDropdown && originResults.length > 0 && (
              <div className="absolute z-20 w-full mt-2 bg-white rounded-xl shadow-lg border border-gray-200 max-h-60 overflow-y-auto">
                {originResults.map((airport) => (
                  <button
                    key={airport.id}
                    type="button"
                    onClick={() => {
                      setOrigin(airport.code);
                      setOriginQuery(`${airport.code} - ${airport.city}`);
                      setShowOriginDropdown(false);
                    }}
                    className="w-full px-4 py-3 text-left hover:bg-gray-50 flex items-center gap-3 border-b border-gray-100 last:border-0"
                  >
                    <span className="w-10 h-10 bg-gradient-to-br from-blue-100 to-cyan-100 rounded-lg flex items-center justify-center font-bold text-blue-600">
                      {airport.code}
                    </span>
                    <div>
                      <div className="font-medium text-gray-900">{airport.city}</div>
                      <div className="text-sm text-gray-500">{airport.name}</div>
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Swap Button */}
          <div className="hidden md:flex items-center justify-center pb-1">
            <button
              type="button"
              onClick={swapAirports}
              className="p-3 rounded-full bg-gray-100 hover:bg-gray-200 transition-colors"
            >
              <ArrowLeftRight className="h-5 w-5 text-gray-600" />
            </button>
          </div>

          {/* Destination */}
          <div className="relative" ref={destinationRef}>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              To
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                <MapPin className="h-5 w-5 text-cyan-500" />
              </div>
              <input
                type="text"
                value={destinationQuery}
                onChange={(e) => {
                  setDestinationQuery(e.target.value);
                  setShowDestinationDropdown(true);
                }}
                onFocus={() => setShowDestinationDropdown(true)}
                placeholder="Destination city or airport"
                className="w-full pl-12 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all text-gray-900"
              />
            </div>
            {showDestinationDropdown && destinationResults.length > 0 && (
              <div className="absolute z-20 w-full mt-2 bg-white rounded-xl shadow-lg border border-gray-200 max-h-60 overflow-y-auto">
                {destinationResults.map((airport) => (
                  <button
                    key={airport.id}
                    type="button"
                    onClick={() => {
                      setDestination(airport.code);
                      setDestinationQuery(`${airport.code} - ${airport.city}`);
                      setShowDestinationDropdown(false);
                    }}
                    className="w-full px-4 py-3 text-left hover:bg-gray-50 flex items-center gap-3 border-b border-gray-100 last:border-0"
                  >
                    <span className="w-10 h-10 bg-gradient-to-br from-cyan-100 to-blue-100 rounded-lg flex items-center justify-center font-bold text-cyan-600">
                      {airport.code}
                    </span>
                    <div>
                      <div className="font-medium text-gray-900">{airport.city}</div>
                      <div className="text-sm text-gray-500">{airport.name}</div>
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Date and Passengers */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Date */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Departure Date
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                <Calendar className="h-5 w-5 text-blue-500" />
              </div>
              <input
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                min={new Date().toISOString().split('T')[0]}
                className="w-full pl-12 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all text-gray-900"
              />
            </div>
            <div className="flex gap-2 mt-2">
              <button
                type="button"
                onClick={setToday}
                className="text-xs px-3 py-1 bg-blue-50 text-blue-600 rounded-full hover:bg-blue-100 transition-colors"
              >
                Today
              </button>
              <button
                type="button"
                onClick={setTomorrow}
                className="text-xs px-3 py-1 bg-blue-50 text-blue-600 rounded-full hover:bg-blue-100 transition-colors"
              >
                Tomorrow
              </button>
            </div>
          </div>

          {/* Passengers */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Passengers
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                <Users className="h-5 w-5 text-blue-500" />
              </div>
              <select
                value={passengers}
                onChange={(e) => setPassengers(parseInt(e.target.value))}
                className="w-full pl-12 pr-10 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all text-gray-900 appearance-none"
              >
                {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((n) => (
                  <option key={n} value={n}>
                    {n} {n === 1 ? 'Passenger' : 'Passengers'}
                  </option>
                ))}
              </select>
              <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400 pointer-events-none" />
            </div>
          </div>

          {/* Class Type */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Cabin Class
            </label>
            <div className="relative">
              <select
                value={classType}
                onChange={(e) => setClassType(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all text-gray-900 appearance-none"
              >
                <option value="economy">Economy</option>
                <option value="business">Business</option>
              </select>
              <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400 pointer-events-none" />
            </div>
          </div>
        </div>

        {/* Search Button */}
        <button
          type="submit"
          disabled={isLoading || !origin || !destination || !date}
          className="w-full py-4 px-6 bg-gradient-to-r from-blue-600 to-cyan-500 text-white font-semibold rounded-xl hover:from-blue-700 hover:to-cyan-600 transition-all shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
        >
          {isLoading ? (
            <>
              <Loader2 className="h-5 w-5 animate-spin" />
              Searching...
            </>
          ) : (
            <>
              <Search className="h-5 w-5" />
              Search Flights
            </>
          )}
        </button>
      </form>
    </div>
  );
}
