import { useState, useEffect } from 'react';
import { Plane, Sparkles } from 'lucide-react';
import { AuthProvider, useAuth } from './lib/auth';
import { api } from './lib/api';
import { Header } from './components/Header';
import { SearchForm } from './components/SearchForm';
import { FlightResults } from './components/FlightCard';
import { SeatMap } from './components/SeatMap';
import { BookingForm } from './components/BookingForm';
import { BookingConfirmation } from './components/BookingConfirmation';
import { BookingsList } from './components/BookingCard';
import { AuthPage } from './components/AuthPage';
import type { Flight, Booking, Passenger } from './lib/supabase';

type Page = 'search' | 'results' | 'seats' | 'booking' | 'confirmation' | 'bookings' | 'login';

type BookingWithDetails = Booking & {
  flight: Flight;
  passenger: Passenger;
};

function AppContent() {
  const { loading: authLoading } = useAuth();
  const [page, setPage] = useState<Page>('search');
  const [searchParams, setSearchParams] = useState<{
    origin: string;
    destination: string;
    date: string;
    passengers: number;
    classType: string;
    originName?: string;
    destinationName?: string;
  } | null>(null);
  const [flights, setFlights] = useState<Flight[]>([]);
  const [selectedFlight, setSelectedFlight] = useState<Flight | null>(null);
  const [selectedSeat, setSelectedSeat] = useState<string | null>(null);
  const [selectedPrice, setSelectedPrice] = useState(0);
  const [bookings, setBookings] = useState<BookingWithDetails[]>([]);
  const [bookingRef, setBookingRef] = useState<string | null>(null);
  const [passengerName, setPassengerName] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSearch = async (
    origin: string,
    destination: string,
    date: string,
    passengers: number,
    classType: string
  ) => {
    setLoading(true);
    setSearchParams({ origin, destination, date, passengers, classType });
    try {
      const results = await api.searchFlights(origin, destination, date);
      setFlights(results);
      setPage('results');
    } catch (error) {
      console.error('Search error:', error);
      setFlights([]);
    } finally {
      setLoading(false);
    }
  };

  const handleFlightSelect = (flight: Flight) => {
    setSelectedFlight(flight);
    setSelectedSeat(null);
    setPage('seats');
  };

  const handleSeatSelect = (seat: string, price: number) => {
    setSelectedSeat(seat);
    setSelectedPrice(price);
  };

  const handleProceedToBooking = () => {
    if (selectedSeat && selectedFlight) {
      setPage('booking');
    }
  };

  const handleBookingComplete = (ref: string) => {
    setBookingRef(ref);
    setPassengerName('Passenger'); // Simplified for demo
    setPage('confirmation');
  };

  const handleCancelBooking = async (booking: Booking) => {
    if (confirm(`Are you sure you want to cancel booking ${booking.booking_reference}?`)) {
      try {
        await api.cancelBooking(booking.booking_reference);
        loadBookings();
      } catch (error) {
        console.error('Cancel error:', error);
      }
    }
  };

  const loadBookings = async () => {
    setLoading(true);
    try {
      const userBookings = await api.getUserBookings(
        'demo-user-id'
      );
      setBookings(userBookings);
    } catch (error) {
      console.error('Fetch bookings error:', error);
      setBookings([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (page === 'bookings') {
      loadBookings();
    }
  }, [page]);

  const navigateTo = (newPage: string) => {
    setPage(newPage as Page);
  };

  if (authLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-cyan-50 flex items-center justify-center">
        <div className="animate-spin">
          <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-cyan-50">
      <Header currentPage={page} onNavigate={navigateTo} />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {page === 'login' && <AuthPage onNavigate={navigateTo} />}

        {page === 'search' && (
          <div className="space-y-8">
            {/* Hero */}
            <div className="text-center mb-8">
              <div className="flex items-center justify-center gap-2 mb-4">
                <Sparkles className="h-6 w-6 text-blue-500" />
                <span className="text-sm font-medium text-blue-600 uppercase tracking-wide">
                  Your Journey Starts Here
                </span>
              </div>
            </div>

            {/* Search Form */}
            <div className="max-w-4xl mx-auto">
              <div className="mb-8 relative">
                <div className="absolute -top-24 -left-24 w-72 h-72 bg-blue-200 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-pulse"></div>
                <div className="absolute -top-24 -right-24 w-72 h-72 bg-cyan-200 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-pulse delay-1000"></div>
                <div className="absolute -bottom-24 left-1/2 -translate-x-1/2 w-96 h-96 bg-blue-400 rounded-full mix-blend-multiply filter blur-3xl opacity-20"></div>
                <SearchForm onSearch={handleSearch} isLoading={loading} />
              </div>
            </div>

            {/* Features */}
            <div className="max-w-4xl mx-auto mt-16">
              <h2 className="text-center text-lg font-semibold text-gray-900 mb-8">
                Why choose SkyVoyage
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {[
                  {
                    title: 'Best Prices',
                    desc: 'Compare prices from 100+ airlines to find the perfect deal',
                    icon: (
                      <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                    ),
                    bg: 'from-green-500 to-emerald-500',
                  },
                  {
                    title: 'Easy Booking',
                    desc: 'Simple, transparent process with instant confirmation',
                    icon: (
                      <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                    ),
                    bg: 'from-blue-500 to-cyan-500',
                  },
                  {
                    title: '24/7 Support',
                    desc: 'Expert assistance whenever you need it, day or night',
                    icon: (
                      <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18.364 5.636l-3.536 3.536m0 5.656l3.536 3.536M9.172 9.172L5.636 5.636m3.536 9.192l-3.536 3.536M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-5 0a4 4 0 11-8 0 4 4 0 018 0z" />
                      </svg>
                    ),
                    bg: 'from-purple-500 to-pink-500',
                  },
                ].map((feature, i) => (
                  <div
                    key={i}
                    className="bg-white rounded-xl p-6 border border-gray-200 hover:shadow-lg transition-shadow"
                  >
                    <div
                      className={`w-12 h-12 rounded-lg bg-gradient-to-br ${feature.bg} text-white flex items-center justify-center mb-4`}
                    >
                      {feature.icon}
                    </div>
                    <h3 className="font-semibold text-gray-900 mb-2">{feature.title}</h3>
                    <p className="text-sm text-gray-500">{feature.desc}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {page === 'results' && searchParams && (
          <div className="max-w-4xl mx-auto">
            <div className="mb-6 p-4 bg-white rounded-lg border border-gray-200">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <span className="font-semibold">{searchParams.origin}</span>
                  <Plane className="h-4 w-4" />
                  <span className="font-semibold">{searchParams.destination}</span>
                </div>
                <button
                  onClick={() => setPage('search')}
                  className="text-sm text-blue-600 hover:text-blue-700 font-medium"
                >
                  Modify search
                </button>
              </div>
              <div className="text-sm text-gray-500 mt-1">
                {new Date(searchParams.date).toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric' })} · {searchParams.passengers} {searchParams.passengers === 1 ? 'passenger' : 'passengers'} · {searchParams.classType} class
              </div>
            </div>
            <FlightResults
              flights={flights}
              classType={searchParams.classType}
              onSelect={handleFlightSelect}
              isLoading={loading}
            />
          </div>
        )}

        {page === 'seats' && selectedFlight && searchParams && (
          <div className="max-w-4xl mx-auto">
            <SeatMap
              flight={selectedFlight}
              selectedClass={searchParams.classType}
              onSelect={handleSeatSelect}
              onBack={() => setPage('results')}
            />
            {selectedSeat && (
              <div className="mt-4">
                <button
                  onClick={handleProceedToBooking}
                  className="w-full py-4 bg-gradient-to-r from-blue-600 to-cyan-500 text-white font-semibold rounded-xl hover:from-blue-700 hover:to-cyan-600 transition-all shadow-lg hover:shadow-xl"
                >
                  Proceed to Booking
                </button>
              </div>
            )}
          </div>
        )}

        {page === 'booking' && selectedFlight && selectedSeat && searchParams && (
          <div className="max-w-4xl mx-auto">
            <BookingForm
              flight={selectedFlight}
              selectedSeat={selectedSeat}
              classType={searchParams.classType}
              price={selectedPrice}
              onComplete={handleBookingComplete}
              onBack={() => setPage('seats')}
            />
          </div>
        )}

        {page === 'confirmation' && bookingRef && selectedFlight && searchParams && (
          <div className="max-w-2xl mx-auto">
            <BookingConfirmation
              bookingReference={bookingRef}
              flight={selectedFlight}
              seat={selectedSeat || ''}
              classType={searchParams.classType}
              price={selectedPrice * 1.12}
              passengerName={passengerName}
              onViewBookings={() => setPage('bookings')}
              onNewSearch={() => setPage('search')}
            />
          </div>
        )}

        {page === 'bookings' && (
          <div className="max-w-4xl mx-auto">
            <BookingsList
              bookings={bookings}
              onCancel={handleCancelBooking}
            />
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="bg-white border-t border-gray-200 mt-auto">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <div className="bg-gradient-to-br from-blue-600 to-cyan-500 p-1.5 rounded">
                <Plane className="h-4 w-4 text-white" />
              </div>
              <span className="font-bold text-gray-900">SkyVoyage</span>
            </div>
            <div className="text-sm text-gray-500">
              2024 SkyVoyage. All rights reserved.
            </div>
            <div className="flex gap-6 text-sm text-gray-500">
              <span className="hover:text-gray-700 cursor-pointer">About Us</span>
              <span className="hover:text-gray-700 cursor-pointer">Contact</span>
              <span className="hover:text-gray-700 cursor-pointer">Terms</span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}

function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}

export default App;
