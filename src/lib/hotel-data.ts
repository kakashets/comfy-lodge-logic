// Shared types and presentation metadata.
// Live data is fetched from Supabase via hooks in src/hooks/use-hotel.ts.

export type RoomType = "Standard" | "Deluxe" | "Suite" | "Penthouse";
export type RoomStatus = "available" | "occupied" | "dirty" | "out_of_order" | "reserved";

export interface Room {
  number: string;
  floor: number;
  type: RoomType;
  rate: number;
  status: RoomStatus;
  capacity: number;
}

export interface Guest {
  id: string;
  name: string;
  email: string | null;
  phone: string | null;
  country: string | null;
  vip: boolean;
}

export type ReservationStatus = "confirmed" | "checked_in" | "checked_out" | "cancelled";

export interface Reservation {
  id: string;
  guestId: string;
  roomNumber: string;
  checkIn: string;
  checkOut: string;
  adults: number;
  children: number;
  status: ReservationStatus;
  ratePerNight: number;
  notes?: string | null;
}

export const STATUS_META: Record<RoomStatus, { label: string; className: string; dot: string }> = {
  available:    { label: "Available",      className: "bg-success/10 text-success border-success/20",       dot: "bg-success" },
  occupied:     { label: "Occupied",       className: "bg-info/10 text-info border-info/20",                dot: "bg-info" },
  reserved:     { label: "Reserved",       className: "bg-booked/10 text-booked border-booked/20",          dot: "bg-booked" },
  dirty:        { label: "Needs cleaning", className: "bg-warning/15 text-warning-foreground border-warning/30", dot: "bg-warning" },
  out_of_order: { label: "Out of order",   className: "bg-destructive/10 text-destructive border-destructive/20", dot: "bg-destructive" },
};

export const RES_STATUS_META: Record<ReservationStatus, { label: string; className: string }> = {
  confirmed:   { label: "Confirmed",   className: "bg-booked/15 text-booked border-booked/30" },
  checked_in:  { label: "Checked in",  className: "bg-info/15 text-info border-info/30" },
  checked_out: { label: "Checked out", className: "bg-muted text-muted-foreground border-border" },
  cancelled:   { label: "Cancelled",   className: "bg-destructive/10 text-destructive border-destructive/20" },
};

export function nightsBetween(a: string, b: string): number {
  return Math.max(1, Math.round((+new Date(b) - +new Date(a)) / 86400000));
}
