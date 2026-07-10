import { useState } from 'react';
import { User, CreditCard, Shield, ArrowLeft, Loader2, Plane, Clock, Ticket } from 'lucide-react';
import type { Flight } from '../lib/supabase';
import { api } from '../lib/api';
import { useAuth } from '../lib/auth';

type BookingFormProps = {
  flight: Flight;
  selectedSeat: string;
  classType: string;
  price: number;
  onComplete: (bookingRef: string) => void;
  onBack: () => void;
};

export function BookingForm({ flight, selectedSeat, classType, price, onComplete, onBack }: BookingFormProps) {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: user?.email || '',
    phone: '',
    passportNumber: '',
    nationality: '',
    dateOfBirth: '',
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  const departureTime = new Date(flight.departure_time);
  const arrivalTime = new Date(flight.arrival_time);
  const duration = flight.duration_minutes;
  const hours = Math.floor(duration / 60);
  const minutes = duration % 60;

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: false });
  };

  const validateStep1 = () => {
    const newErrors: Record<string, string> = {};
    if (!formData.firstName.trim()) newErrors.firstName = 'First name is required';
    if (!formData.lastName.trim()) newErrors.lastName = 'Last name is required';
    if (!formData.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Invalid email format';
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validateStep1()) return;
    if (step === 1) {
      setStep(2);
      return;
    }

    setLoading(true);
    try {
      // Create passenger first
      const passenger = await api.createPassenger({
        user_id: user?.id || null,
        first_name: formData.firstName,
        last_name: formData.lastName,
        email: formData.email,
        phone: formData.phone || null,
        passport_number: formData.passportNumber || null,
        nationality: formData.nationality || null,
        date_of_birth: formData.dateOfBirth || null,
      });

      // Create booking
      const booking = await api.createBooking({
        passenger_id: passenger.id,
        flight_id: flight.id,
        seat_number: selectedSeat,
        class_type: classType,
        price: price,
        status: 'confirmed',
        special_requests: null,
      });

      onComplete(booking.booking_reference);
    } catch (error) {
      console.error('Booking error:', error);
      setErrors({ submit: 'Failed to create booking. Please try again.' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white rounded-xl border border-gray-200 divide-y divide-gray-200">
      {/* Header */}
      <div className="p-6">
        <div className="flex items-center justify-between mb-4">
          <button
            onClick={step === 1 ? onBack : () => setStep(1)}
            className="flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors"
          >
            <ArrowLeft className="h-5 w-5" />
            {step === 1 ? 'Back to seats' : 'Back to passenger info'}
          </button>
          <h2 className="text-xl font-semibold text-gray-900">Complete Your Booking</h2>
          <div className="flex items-center gap-2">
            <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
              step >= 1 ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-500'
            }`}>
              1
            </div>
            <div className="w-8 h-px bg-gray-300"></div>
            <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
              step >= 2 ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-500'
            }`}>
              2
            </div>
          </div>
        </div>
      </div>

      {/* Flight Summary */}
      <div className="p-6 bg-gradient-to-br from-blue-50 to-cyan-50">
        <div className="flex flex-col md:flex-row gap-6">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-white rounded-lg shadow flex items-center justify-center">
              <Plane className="h-6 w-6 text-blue-600" />
            </div>
            <div>
              <div className="font-medium text-gray-900">{flight.flight_number}</div>
              <div className="text-sm text-gray-500">{flight.airline?.name || 'Airline'}</div>
            </div>
          </div>
          <div className="flex-1 flex items-center gap-4">
            <div className="flex-1">
              <div className="text-lg font-bold text-gray-900">{formatTime(departureTime)}</div>
              <div className="text-sm text-gray-500">{flight.origin_airport?.code}</div>
            </div>
            <div className="text-center">
              <div className="text-xs text-gray-500">{hours}h {minutes}m</div>
              <Clock className="h-4 w-4 text-gray-400 mx-auto" />
            </div>
            <div className="flex-1 text-right">
              <div className="text-lg font-bold text-gray-900">{formatTime(arrivalTime)}</div>
              <div className="text-sm text-gray-500">{flight.destination_airport?.code}</div>
            </div>
          </div>
          <div className="text-right">
            <div className="text-2xl font-bold text-gray-900">${price.toLocaleString()}</div>
            <div className="text-sm text-gray-500">per person</div>
          </div>
        </div>
      </div>

      {/* Form */}
      <div className="p-6">
        {step === 1 ? (
          <div className="space-y-6">
            <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
              <User className="h-5 w-5 text-blue-500" />
              Passenger Details
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  First Name *
                </label>
                <input
                  type="text"
                  value={formData.firstName}
                  onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                  className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                    errors.firstName ? 'border-red-500' : 'border-gray-300'
                  }`}
                  placeholder="John"
                />
                {errors.firstName && <p className="text-sm text-red-500 mt-1">{errors.firstName}</p>}
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Last Name *
                </label>
                <input
                  type="text"
                  value={formData.lastName}
                  onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                  className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                    errors.lastName ? 'border-red-500' : 'border-gray-300'
                  }`}
                  placeholder="Doe"
                />
                {errors.lastName && <p className="text-sm text-red-500 mt-1">{errors.lastName}</p>}
              </div>
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Email *
                </label>
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                    errors.email ? 'border-red-500' : 'border-gray-300'
                  }`}
                  placeholder="john@example.com"
                />
                {errors.email && <p className="text-sm text-red-500 mt-1">{errors.email}</p>}
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Phone
                </label>
                <input
                  type="tel"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="+1 234 567 890"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Date of Birth
                </label>
                <input
                  type="date"
                  value={formData.dateOfBirth}
                  onChange={(e) => setFormData({ ...formData, dateOfBirth: e.target.value })}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Passport Number
                </label>
                <input
                  type="text"
                  value={formData.passportNumber}
                  onChange={(e) => setFormData({ ...formData, passportNumber: e.target.value })}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="AB1234567"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Nationality
                </label>
                <input
                  type="text"
                  value={formData.nationality}
                  onChange={(e) => setFormData({ ...formData, nationality: e.target.value })}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="United States"
                />
              </div>
            </div>

            <button
              onClick={handleSubmit}
              className="w-full py-4 bg-gradient-to-r from-blue-600 to-cyan-500 text-white font-semibold rounded-lg hover:from-blue-700 hover:to-cyan-600 transition-all shadow-sm hover:shadow-md"
            >
              Continue to Payment
            </button>
          </div>
        ) : (
          <div className="space-y-6">
            <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
              <CreditCard className="h-5 w-5 text-blue-500" />
              Payment Details
            </h3>

            <div className="bg-gray-50 p-4 rounded-lg">
              <div className="flex items-center gap-3 mb-4">
                <Shield className="h-5 w-5 text-green-500" />
                <span className="text-sm text-gray-600">
                  Your payment is secure. This is a demo - no actual charge will be made.
                </span>
              </div>

              <div className="flex gap-3 mb-4">
                <div className="flex-1 h-10 bg-gradient-to-r from-blue-950 to-blue-900 rounded flex items-center justify-center text-white text-xs font-bold">VISA</div>
                <div className="flex-1 h-10 bg-gradient-to-r from-red-500 to-orange-500 rounded flex items-center justify-center">
                  <div className="flex gap-1">
                    <div className="w-4 h-4 bg-red-500 rounded-full border border-red-300"></div>
                    <div className="w-4 h-4 bg-amber-500 rounded-full border border-amber-300 -ml-2"></div>
                  </div>
                </div>
                <div className="flex-1 h-10 bg-gradient-to-r from-blue-600 to-blue-500 rounded flex items-center justify-center text-white text-xs font-bold">AMEX</div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Card Number</label>
                  <input
                    type="text"
                    defaultValue="4242 4242 4242 4242"
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg bg-gray-100"
                    readOnly
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Expiry</label>
                  <input
                    type="text"
                    defaultValue="12/28"
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg bg-gray-100"
                    readOnly
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">CVV</label>
                  <input
                    type="text"
                    defaultValue="123"
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg bg-gray-100"
                    readOnly
                  />
                </div>
              </div>
            </div>

            {/* Price Summary */}
            <div className="border-t border-gray-200 pt-6">
              <div className="flex justify-between mb-2">
                <span className="text-gray-600">Base fare</span>
                <span className="text-gray-900">${price.toFixed(2)}</span>
              </div>
              <div className="flex justify-between mb-2">
                <span className="text-gray-600">Taxes & fees</span>
                <span className="text-gray-900">${(price * 0.12).toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-lg font-bold border-t border-gray-200 pt-2 mt-2">
                <span className="text-gray-900">Total</span>
                <span className="text-blue-600">${(price * 1.12).toFixed(2)}</span>
              </div>
            </div>

            {errors.submit && (
              <div className="p-4 bg-red-50 border border-red-200 rounded-lg text-red-600">
                {errors.submit}
              </div>
            )}

            <button
              onClick={handleSubmit}
              disabled={loading}
              className="w-full py-4 bg-gradient-to-r from-blue-600 to-cyan-500 text-white font-semibold rounded-lg hover:from-blue-700 hover:to-cyan-600 transition-all shadow-sm hover:shadow-md disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <Loader2 className="h-5 w-5 animate-spin" />
                  Processing...
                </>
              ) : (
                <>
                  <Ticket className="h-5 w-5" />
                  Complete Booking
                </>
              )}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
