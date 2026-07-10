import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

export type Airport = {
  id: string;
  code: string;
  name: string;
  city: string;
  country: string;
  latitude: number | null;
  longitude: number | null;
};

export type Airline = {
  id: string;
  code: string;
  name: string;
  logo_url: string | null;
  country: string | null;
};

export type AircraftType = {
  id: string;
  model: string;
  manufacturer: string;
  total_seats: number;
  business_class_seats: number | null;
  economy_class_seats: number;
};

export type Flight = {
  id: string;
  flight_number: string;
  airline_id: string | null;
  aircraft_type_id: string | null;
  origin_airport_id: string;
  destination_airport_id: string;
  departure_time: string;
  arrival_time: string;
  duration_minutes: number;
  base_price: number;
  business_class_price: number | null;
  status: string;
  airline?: Airline;
  origin_airport?: Airport;
  destination_airport?: Airport;
  aircraft_type?: AircraftType;
};

export type Booking = {
  id: string;
  booking_reference: string;
  passenger_id: string;
  flight_id: string;
  seat_number: string;
  class_type: string;
  price: number;
  status: string;
  special_requests: string | null;
  checked_in: boolean;
  created_at: string;
};

export type Passenger = {
  id: string;
  user_id: string | null;
  first_name: string;
  last_name: string;
  email: string;
  phone: string | null;
  date_of_birth: string | null;
  passport_number: string | null;
  passport_expiry: string | null;
  nationality: string | null;
};
