import { useState } from 'react';
import { X, Check, User, Crown, ArrowLeft } from 'lucide-react';
import type { Flight } from '../lib/supabase';

type SeatMapProps = {
  flight: Flight;
  selectedClass: string;
  onSelect: (seat: string, price: number) => void;
  onBack: () => void;
};

function generateSeats(rows: number, classRows: number) {
  const seats = [];
  const columns = ['A', 'B', 'C', 'D', 'E', 'F'];
  const window = ['A', 'F'];
  const aisle = ['C', 'D'];

  for (let row = 1; row <= rows; row++) {
    for (const col of columns) {
      seats.push({
        id: `${row}${col}`,
        seat: `${row}${col}`,
        row,
        column: col,
        isWindow: window.includes(col),
        isAisle: aisle.includes(col),
        classType: row <= classRows ? 'business' : 'economy',
        isAvailable: Math.random() > 0.2, // Random availability for demo
      });
    }
  }
  return seats;
}

export function SeatMap({ flight, selectedClass, onSelect, onBack }: SeatMapProps) {
  const [selectedSeat, setSelectedSeat] = useState<string | null>(null);
  const seats = generateSeats(28, 4);
  const filteredSeats = seats.filter(s => s.classType === selectedClass);
  const price = selectedClass === 'business' && flight.business_class_price
    ? flight.business_class_price
    : flight.base_price;

  const rows = [...new Set(filteredSeats.map(s => s.row))].sort((a, b) => a - b);
  const columns = ['A', 'B', 'C', 'D', 'E', 'F'];

  const handleSeatClick = (seatId: string, isAvailable: boolean) => {
    if (!isAvailable) return;
    setSelectedSeat(seatId);
    onSelect(seatId, price);
  };

  const getSeatStyle = (seat: typeof seats[0]) => {
    if (selectedSeat === seat.seat) {
      return 'bg-blue-600 text-white border-blue-700 cursor-pointer';
    }
    if (!seat.isAvailable) {
      return 'bg-gray-200 text-gray-400 cursor-not-allowed';
    }
    if (seat.classType === 'business') {
      return 'bg-gradient-to-br from-amber-100 to-amber-200 hover:from-amber-200 hover:to-amber-300 text-amber-800 border-amber-300 cursor-pointer';
    }
    return 'bg-blue-50 hover:bg-blue-100 text-blue-800 border-blue-200 cursor-pointer';
  };

  return (
    <div className="bg-white rounded-xl border border-gray-200 p-6">
      <div className="flex items-center justify-between mb-6">
        <button
          onClick={onBack}
          className="flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors"
        >
          <ArrowLeft className="h-5 w-5" />
          Back to flight
        </button>
        <h2 className="text-xl font-semibold text-gray-900">Select Your Seat</h2>
        <div className="w-24"></div>
      </div>

      {/* Legend */}
      <div className="flex flex-wrap gap-4 mb-6 pb-6 border-b border-gray-200">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-blue-50 border border-blue-200 rounded flex items-center justify-center">
            <span className="text-xs font-medium">E</span>
          </div>
          <span className="text-sm text-gray-600">Economy Available</span>
        </div>
        {selectedClass === 'business' && (
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-gradient-to-br from-amber-100 to-amber-200 border border-amber-300 rounded flex items-center justify-center">
              <Crown className="h-4 w-4 text-amber-600" />
            </div>
            <span className="text-sm text-gray-600">Business Available</span>
          </div>
        )}
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-blue-600 rounded flex items-center justify-center">
            <span className="text-xs font-medium text-white">E</span>
          </div>
          <span className="text-sm text-gray-600">Selected</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-gray-200 rounded flex items-center justify-center">
            <span className="text-xs font-medium text-gray-400">X</span>
          </div>
          <span className="text-sm text-gray-600">Unavailable</span>
        </div>
      </div>

      {/* Cabin Layout */}
      <div className="max-w-lg mx-auto">
        {/* Cockpit */}
        <div className="flex justify-center mb-2">
          <div className="w-32 h-8 bg-gray-200 rounded-t-full flex items-center justify-center">
            <span className="text-xs text-gray-500">Cockpit</span>
          </div>
        </div>

        {/* Business Class Section */}
        {selectedClass === 'business' && (
          <div className="bg-gradient-to-b from-amber-50 to-amber-100/50 rounded-lg p-4 mb-4">
            <div className="flex items-center gap-2 mb-4">
              <Crown className="h-5 w-5 text-amber-600" />
              <span className="font-semibold text-amber-800">Business Class</span>
            </div>
            {rows.slice(0, 4).map((row) => (
              <div key={row} className="flex items-center gap-2 mb-2">
                <div className="w-8 text-center text-sm font-medium text-amber-800">{row}</div>
                {columns.map((col) => {
                  const seat = seats.find(s => s.seat === `${row}${col}`);
                  if (!seat || seat.classType !== 'business') return null;
                  return (
                    <button
                      key={seat.seat}
                      onClick={() => handleSeatClick(seat.seat, seat.isAvailable)}
                      disabled={!seat.isAvailable}
                      className={`w-10 h-10 rounded-lg border flex items-center justify-center text-sm font-medium transition-all ${getSeatStyle(seat)}`}
                      title={`${seat.seat} ${seat.isWindow ? '(Window)' : seat.isAisle ? '(Aisle)' : '(Middle)'}`}
                    >
                      {selectedSeat === seat.seat ? <Check className="h-4 w-4" /> : !seat.isAvailable ? <User className="h-3 w-3" /> : col}
                    </button>
                  );
                })}
                <div className="w-8 text-center text-sm font-medium text-amber-800">{row}</div>
              </div>
            ))}
          </div>
        )}

        {/* Economy Section */}
        <div className="bg-gray-50 rounded-lg p-4">
          {selectedClass !== 'business' && (
            <div className="flex items-center gap-2 mb-4">
              <span className="font-semibold text-gray-700">Economy Class</span>
            </div>
          )}
          {rows.slice(selectedClass === 'business' ? 4 : 0).map((row) => (
            <div key={row} className="flex items-center gap-1 mb-1">
              <div className="w-6 text-center text-xs font-medium text-gray-500">{row}</div>
              {columns.slice(0, 3).map((col) => {
                const seat = seats.find(s => s.seat === `${row}${col}`);
                if (!seat) return null;
                return (
                  <button
                    key={seat.seat}
                    onClick={() => handleSeatClick(seat.seat, seat.isAvailable)}
                    disabled={!seat.isAvailable}
                    className={`w-8 h-8 rounded border flex items-center justify-center text-xs font-medium transition-all ${getSeatStyle(seat)}`}
                    title={`${seat.seat} ${seat.isWindow ? '(Window)' : seat.isAisle ? '(Aisle)' : '(Middle)'}`}
                  >
                    {selectedSeat === seat.seat ? <Check className="h-4 w-4" /> : !seat.isAvailable ? <X className="h-3 w-3" /> : col}
                  </button>
                );
              })}
              <div className="w-4 flex items-center justify-center">
                <div className="w-px h-6 bg-gray-300"></div>
              </div>
              {columns.slice(3).map((col) => {
                const seat = seats.find(s => s.seat === `${row}${col}`);
                if (!seat) return null;
                return (
                  <button
                    key={seat.seat}
                    onClick={() => handleSeatClick(seat.seat, seat.isAvailable)}
                    disabled={!seat.isAvailable}
                    className={`w-8 h-8 rounded border flex items-center justify-center text-xs font-medium transition-all ${getSeatStyle(seat)}`}
                    title={`${seat.seat} ${seat.isWindow ? '(Window)' : seat.isAisle ? '(Aisle)' : '(Middle)'}`}
                  >
                    {selectedSeat === seat.seat ? <Check className="h-4 w-4" /> : !seat.isAvailable ? <X className="h-3 w-3" /> : col}
                  </button>
                );
              })}
              <div className="w-6 text-center text-xs font-medium text-gray-500">{row}</div>
            </div>
          ))}
        </div>

        {/* Selected Seat Info */}
        {selectedSeat && (
          <div className="mt-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center text-white font-bold">
                  {selectedSeat}
                </div>
                <div>
                  <div className="font-medium text-gray-900">Seat {selectedSeat}</div>
                  <div className="text-sm text-gray-500 capitalize">{selectedClass} Class</div>
                </div>
              </div>
              <div className="text-right">
                <div className="text-2xl font-bold text-gray-900">${price.toLocaleString()}</div>
                <div className="text-xs text-gray-500">Total</div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
