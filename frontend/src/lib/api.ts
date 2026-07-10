import { supabase } from './supabase';
import type { Airport, Airline, Flight, Booking, Passenger } from './supabase';

export const api = {
  async getAirports(): Promise<Airport[]> {
    const { data, error } = await supabase.from('airports').select('*').order('code');
    if (error) throw error;
    return data || [];
  },

  async searchAirports(query: string): Promise<Airport[]> {
    const { data, error } = await supabase
      .from('airports')
      .select('*')
      .or(`code.ilike.%${query}%,name.ilike.%${query}%,city.ilike.%${query}%`)
      .limit(10);
    if (error) throw error;
    return data || [];
  },

  async getAirlines(): Promise<Airline[]> {
    const { data, error } = await supabase.from('airlines').select('*').order('name');
    if (error) throw error;
    return data || [];
  },

  async searchFlights(
    originCode: string,
    destinationCode: string,
    departureDate: string
  ): Promise<Flight[]> {
    try {
      // First get airport IDs
      const { data: airports, error: airportError } = await supabase
        .from('airports')
        .select('id, code')
        .in('code', [originCode, destinationCode]);

      if (airportError) {
        console.error('Airport lookup error:', airportError);
        return [];
      }

      if (!airports || airports.length < 2) {
        console.log('Could not find both airports:', originCode, destinationCode);
        return [];
      }

      const originId = airports.find(a => a.code === originCode)?.id;
      const destinationId = airports.find(a => a.code === destinationCode)?.id;

      if (!originId || !destinationId) {
        console.log('Missing airport ID:', { originId, destinationId });
        return [];
      }

      // Use a 3-day window around the requested date for better matching
      const searchDate = new Date(departureDate);
      const startOfDay = new Date(searchDate);
      startOfDay.setHours(0, 0, 0, 0);

      const threeDaysAfter = new Date(searchDate);
      threeDaysAfter.setDate(threeDaysAfter.getDate() + 3);
      threeDaysAfter.setHours(23, 59, 59, 999);

      const { data, error } = await supabase
        .from('flights')
        .select(`
          *,
          airline:airlines(*),
          origin_airport:airports!flights_origin_airport_id_fkey(*),
          destination_airport:airports!flights_destination_airport_id_fkey(*),
          aircraft_type:aircraft_types(*)
        `)
        .eq('origin_airport_id', originId)
        .eq('destination_airport_id', destinationId)
        .gte('departure_time', startOfDay.toISOString())
        .lte('departure_time', threeDaysAfter.toISOString())
        .eq('status', 'scheduled')
        .order('departure_time', { ascending: true });

      if (error) {
        console.error('Flight search error:', error);
        return [];
      }

      console.log('Found flights:', data?.length || 0);
      return (data as Flight[]) || [];
    } catch (err) {
      console.error('Search exception:', err);
      return [];
    }
  },

  async getFlightById(flightId: string): Promise<Flight | null> {
    const { data, error } = await supabase
      .from('flights')
      .select(`
        *,
        airline:airlines(*),
        origin_airport:airports!flights_origin_airport_id_fkey(*),
        destination_airport:airports!flights_destination_airport_id_fkey(*)
      `)
      .eq('id', flightId)
      .single();
    if (error) throw error;
    return data;
  },

  async createPassenger(passenger: Partial<Passenger>): Promise<Passenger> {
    const { data, error } = await supabase
      .from('passengers')
      .insert(passenger as never)
      .select()
      .single();
    if (error) throw error;
    return data;
  },

  async createBooking(booking: Partial<Booking>): Promise<Booking> {
    const { data, error } = await supabase
      .from('bookings')
      .insert(booking as never)
      .select()
      .single();
    if (error) throw error;
    return data;
  },

  async getUserPassengers(userId: string): Promise<Passenger[]> {
    const { data, error } = await supabase
      .from('passengers')
      .select('*')
      .eq('user_id', userId);
    if (error) throw error;
    return data || [];
  },

  async getUserBookings(userId: string): Promise<(Booking & { flight: Flight; passenger: Passenger })[]> {
    const { data: passengers } = await supabase
      .from('passengers')
      .select('id')
      .eq('user_id', userId);

    if (!passengers || passengers.length === 0) return [];

    const passengerIds = passengers.map(p => p.id);

    const { data, error } = await supabase
      .from('bookings')
      .select(`
        *,
        flight:flights(
          *,
          airline:airlines(*),
          origin_airport:airports!flights_origin_airport_id_fkey(*),
          destination_airport:airports!flights_destination_airport_id_fkey(*)
        ),
        passenger:passengers(*)
      `)
      .in('passenger_id', passengerIds)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return (data as never[]) || [];
  },

  async getBookingByReference(reference: string): Promise<(Booking & { flight: Flight; passenger: Passenger }) | null> {
    const { data, error } = await supabase
      .from('bookings')
      .select(`
        *,
        flight:flights(
          *,
          airline:airlines(*),
          origin_airport:airports!flights_origin_airport_id_fkey(*),
          destination_airport:airports!flights_destination_airport_id_fkey(*)
        ),
        passenger:passengers(*)
      `)
      .eq('booking_reference', reference)
      .maybeSingle();

    if (error) throw error;
    return data as never;
  },

  async cancelBooking(reference: string): Promise<void> {
    const { error } = await supabase
      .from('bookings')
      .update({ status: 'cancelled' } as never)
      .eq('booking_reference', reference);
    if (error) throw error;
  },
};
