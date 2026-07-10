/*
# Flight Booking System Schema

This migration creates the complete database schema for a flight booking system.

## Tables Created:
1. `airports` - Stores airport information (code, name, city, country)
2. `airlines` - Stores airline information (code, name, logo)
3. `aircraft` - Stores aircraft types and configurations
4. `flights` - Stores flight schedules between airports
5. `passengers` - Stores passenger details linked to auth users
6. `bookings` - Stores booking records (passenger + flight + seat)
7. `seats` - Stores available seats per flight

## Security:
- Row Level Security enabled on all tables
- Owner-scoped policies for user data (passengers, bookings)
- Public read access for flight search tables (airports, airlines, flights)
- Authenticated-only write for bookings
*/

-- Airports table
CREATE TABLE IF NOT EXISTS airports (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    code varchar(10) UNIQUE NOT NULL,
    name text NOT NULL,
    city text NOT NULL,
    country text NOT NULL,
    latitude decimal(10, 8),
    longitude decimal(11, 8),
    created_at timestamptz DEFAULT now()
);

-- Airlines table
CREATE TABLE IF NOT EXISTS airlines (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    code varchar(5) UNIQUE NOT NULL,
    name text NOT NULL,
    logo_url text,
    country text,
    created_at timestamptz DEFAULT now()
);

-- Aircraft types table
CREATE TABLE IF NOT EXISTS aircraft_types (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    model text NOT NULL,
    manufacturer text NOT NULL,
    total_seats integer NOT NULL,
    business_class_seats integer DEFAULT 0,
    economy_class_seats integer NOT NULL,
    seat_layout jsonb,
    created_at timestamptz DEFAULT now()
);

-- Flights table
CREATE TABLE IF NOT EXISTS flights (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    flight_number varchar(20) NOT NULL,
    airline_id uuid REFERENCES airlines(id) ON DELETE SET NULL,
    aircraft_type_id uuid REFERENCES aircraft_types(id) ON DELETE SET NULL,
    origin_airport_id uuid REFERENCES airports(id) ON DELETE SET NULL,
    destination_airport_id uuid REFERENCES airports(id) ON DELETE SET NULL,
    departure_time timestamptz NOT NULL,
    arrival_time timestamptz NOT NULL,
    duration_minutes integer NOT NULL,
    base_price decimal(12, 2) NOT NULL,
    business_class_price decimal(12, 2),
    status varchar(20) DEFAULT 'scheduled',
    created_at timestamptz DEFAULT now()
);

-- Passengers table (extends auth.users concept with passenger details)
CREATE TABLE IF NOT EXISTS passengers (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
    first_name text NOT NULL,
    last_name text NOT NULL,
    email text NOT NULL,
    phone text,
    date_of_birth date,
    passport_number text,
    passport_expiry date,
    nationality text,
    created_at timestamptz DEFAULT now()
);

-- Bookings table
CREATE TABLE IF NOT EXISTS bookings (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    booking_reference varchar(10) UNIQUE NOT NULL DEFAULT upper(substring(md5(random()::text) from 1 for 8)),
    passenger_id uuid REFERENCES passengers(id) ON DELETE CASCADE,
    flight_id uuid REFERENCES flights(id) ON DELETE CASCADE,
    seat_number varchar(10) NOT NULL,
    class_type varchar(20) NOT NULL DEFAULT 'economy',
    price decimal(12, 2) NOT NULL,
    status varchar(20) DEFAULT 'confirmed',
    special_requests text,
    checked_in boolean DEFAULT false,
    created_at timestamptz DEFAULT now(),
    updated_at timestamptz DEFAULT now()
);

-- Seats table (available seats per flight)
CREATE TABLE IF NOT EXISTS flight_seats (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    flight_id uuid REFERENCES flights(id) ON DELETE CASCADE,
    seat_number varchar(10) NOT NULL,
    class_type varchar(20) NOT NULL,
    is_available boolean DEFAULT true,
    price decimal(12, 2) NOT NULL,
    UNIQUE(flight_id, seat_number)
);

-- Enable RLS on all tables
ALTER TABLE airports ENABLE ROW LEVEL SECURITY;
ALTER TABLE airlines ENABLE ROW LEVEL SECURITY;
ALTER TABLE aircraft_types ENABLE ROW LEVEL SECURITY;
ALTER TABLE flights ENABLE ROW LEVEL SECURITY;
ALTER TABLE passengers ENABLE ROW LEVEL SECURITY;
ALTER TABLE bookings ENABLE ROW LEVEL SECURITY;
ALTER TABLE flight_seats ENABLE ROW LEVEL SECURITY;

-- Airports policies (public read for flight search)
DROP POLICY IF EXISTS "airports_public_read" ON airports;
CREATE POLICY "airports_public_read" ON airports FOR SELECT
    TO anon, authenticated USING (true);

DROP POLICY IF EXISTS "airports_admin_write" ON airports;
CREATE POLICY "airports_admin_write" ON airports FOR INSERT
    TO authenticated WITH CHECK (true);

-- Airlines policies (public read for flight search)
DROP POLICY IF EXISTS "airlines_public_read" ON airlines;
CREATE POLICY "airlines_public_read" ON airlines FOR SELECT
    TO anon, authenticated USING (true);

DROP POLICY IF EXISTS "airlines_admin_write" ON airlines;
CREATE POLICY "airlines_admin_write" ON airlines FOR INSERT
    TO authenticated WITH CHECK (true);

-- Aircraft types policies (public read)
DROP POLICY IF EXISTS "aircraft_public_read" ON aircraft_types;
CREATE POLICY "aircraft_public_read" ON aircraft_types FOR SELECT
    TO anon, authenticated USING (true);

DROP POLICY IF EXISTS "aircraft_admin_write" ON aircraft_types;
CREATE POLICY "aircraft_admin_write" ON aircraft_types FOR INSERT
    TO authenticated WITH CHECK (true);

-- Flights policies (public read for flight search)
DROP POLICY IF EXISTS "flights_public_read" ON flights;
CREATE POLICY "flights_public_read" ON flights FOR SELECT
    TO anon, authenticated USING (true);

DROP POLICY IF EXISTS "flights_admin_write" ON flights;
CREATE POLICY "flights_admin_write" ON flights FOR INSERT
    TO authenticated WITH CHECK (true);

-- Passengers policies (owner-scoped CRUD)
DROP POLICY IF EXISTS "passengers_select_own" ON passengers;
CREATE POLICY "passengers_select_own" ON passengers FOR SELECT
    TO authenticated USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "passengers_insert_own" ON passengers;
CREATE POLICY "passengers_insert_own" ON passengers FOR INSERT
    TO authenticated WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "passengers_update_own" ON passengers;
CREATE POLICY "passengers_update_own" ON passengers FOR UPDATE
    TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "passengers_delete_own" ON passengers;
CREATE POLICY "passengers_delete_own" ON passengers FOR DELETE
    TO authenticated USING (auth.uid() = user_id);

-- Bookings policies (owner-scoped CRUD)
DROP POLICY IF EXISTS "bookings_select_own" ON bookings;
CREATE POLICY "bookings_select_own" ON bookings FOR SELECT
    TO authenticated USING (
        EXISTS (SELECT 1 FROM passengers WHERE passengers.id = bookings.passenger_id AND passengers.user_id = auth.uid())
    );

DROP POLICY IF EXISTS "bookings_insert_own" ON bookings;
CREATE POLICY "bookings_insert_own" ON bookings FOR INSERT
    TO authenticated WITH CHECK (
        EXISTS (SELECT 1 FROM passengers WHERE passengers.id = bookings.passenger_id AND passengers.user_id = auth.uid())
    );

DROP POLICY IF EXISTS "bookings_update_own" ON bookings;
CREATE POLICY "bookings_update_own" ON bookings FOR UPDATE
    TO authenticated USING (
        EXISTS (SELECT 1 FROM passengers WHERE passengers.id = bookings.passenger_id AND passengers.user_id = auth.uid())
    );

DROP POLICY IF EXISTS "bookings_delete_own" ON bookings;
CREATE POLICY "bookings_delete_own" ON bookings FOR DELETE
    TO authenticated USING (
        EXISTS (SELECT 1 FROM passengers WHERE passengers.id = bookings.passenger_id AND passengers.user_id = auth.uid())
    );

-- Flight seats policies (public read, authenticated write)
DROP POLICY IF EXISTS "flight_seats_public_read" ON flight_seats;
CREATE POLICY "flight_seats_public_read" ON flight_seats FOR SELECT
    TO anon, authenticated USING (true);

DROP POLICY IF EXISTS "flight_seats_admin_write" ON flight_seats;
CREATE POLICY "flight_seats_admin_write" ON flight_seats FOR INSERT
    TO authenticated WITH CHECK (true);

DROP POLICY IF EXISTS "flight_seats_update" ON flight_seats;
CREATE POLICY "flight_seats_update" ON flight_seats FOR UPDATE
    TO authenticated USING (true) WITH CHECK (true);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_flights_origin ON flights(origin_airport_id);
CREATE INDEX IF NOT EXISTS idx_flights_destination ON flights(destination_airport_id);
CREATE INDEX IF NOT EXISTS idx_flights_departure ON flights(departure_time);
CREATE INDEX IF NOT EXISTS idx_bookings_passenger ON bookings(passenger_id);
CREATE INDEX IF NOT EXISTS idx_bookings_flight ON bookings(flight_id);
CREATE INDEX IF NOT EXISTS idx_passengers_user ON passengers(user_id);
CREATE INDEX IF NOT EXISTS idx_flight_seats_flight ON flight_seats(flight_id);
