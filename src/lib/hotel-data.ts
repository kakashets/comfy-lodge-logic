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
  email: string;
  phone: string;
  country: string;
  vip: boolean;
}

export type ReservationStatus = "confirmed" | "checked_in" | "checked_out" | "cancelled";

export interface Reservation {
  id: string;
  guestId: string;
  roomNumber: string;
  checkIn: string; // YYYY-MM-DD
  checkOut: string;
  adults: number;
  children: number;
  status: ReservationStatus;
  ratePerNight: number;
  notes?: string;
}

const ROOM_NUMBERS = [
  "102","103","104","105","106","107","108",
  "201","202","203","204","205","206","207","208",
  "301","304","307","807","1203",
];

function floorOf(num: string): number {
  if (num.length === 4) return parseInt(num.slice(0, 2), 10);
  return parseInt(num[0], 10);
}

function typeFor(num: string): RoomType {
  const f = floorOf(num);
  if (f >= 12) return "Penthouse";
  if (f >= 8) return "Suite";
  if (f === 3) return "Deluxe";
  return "Standard";
}

function rateFor(t: RoomType): number {
  return { Standard: 120, Deluxe: 180, Suite: 280, Penthouse: 480 }[t];
}

function capacityFor(t: RoomType): number {
  return { Standard: 2, Deluxe: 2, Suite: 3, Penthouse: 4 }[t];
}

export const rooms: Room[] = ROOM_NUMBERS.map((number, i) => {
  const t = typeFor(number);
  const statuses: RoomStatus[] = ["available", "occupied", "dirty", "reserved", "available", "occupied"];
  return {
    number,
    floor: floorOf(number),
    type: t,
    rate: rateFor(t),
    capacity: capacityFor(t),
    status: number === "807" ? "out_of_order" : statuses[i % statuses.length],
  };
});

export const guests: Guest[] = [
  { id: "g1", name: "Amelia Hartwell", email: "amelia@example.com", phone: "+44 7700 900123", country: "UK", vip: true },
  { id: "g2", name: "Marco Rossi", email: "marco.rossi@example.com", phone: "+39 333 1234567", country: "Italy", vip: false },
  { id: "g3", name: "Yuki Tanaka", email: "yuki.t@example.com", phone: "+81 90 1234 5678", country: "Japan", vip: false },
  { id: "g4", name: "Sofia Andersson", email: "sofia.a@example.com", phone: "+46 70 123 4567", country: "Sweden", vip: true },
  { id: "g5", name: "James O'Connor", email: "james.o@example.com", phone: "+353 86 123 4567", country: "Ireland", vip: false },
  { id: "g6", name: "Priya Sharma", email: "priya.s@example.com", phone: "+91 98765 43210", country: "India", vip: false },
  { id: "g7", name: "Lucas Müller", email: "lucas.m@example.com", phone: "+49 151 23456789", country: "Germany", vip: false },
  { id: "g8", name: "Camila Reyes", email: "camila.r@example.com", phone: "+34 612 345 678", country: "Spain", vip: true },
  { id: "g9", name: "Noah Williams", email: "noah.w@example.com", phone: "+1 415 555 0142", country: "USA", vip: false },
  { id: "g10", name: "Aisha Khan", email: "aisha.k@example.com", phone: "+971 50 123 4567", country: "UAE", vip: true },
];

function isoOffset(days: number): string {
  const d = new Date();
  d.setDate(d.getDate() + days);
  return d.toISOString().slice(0, 10);
}

export const reservations: Reservation[] = [
  { id: "r1", guestId: "g1", roomNumber: "301", checkIn: isoOffset(-1), checkOut: isoOffset(2), adults: 2, children: 0, status: "checked_in", ratePerNight: 180 },
  { id: "r2", guestId: "g2", roomNumber: "102", checkIn: isoOffset(0), checkOut: isoOffset(3), adults: 1, children: 0, status: "checked_in", ratePerNight: 120 },
  { id: "r3", guestId: "g3", roomNumber: "203", checkIn: isoOffset(0), checkOut: isoOffset(4), adults: 2, children: 1, status: "confirmed", ratePerNight: 120 },
  { id: "r4", guestId: "g4", roomNumber: "1203", checkIn: isoOffset(1), checkOut: isoOffset(6), adults: 2, children: 2, status: "confirmed", ratePerNight: 480, notes: "Champagne on arrival" },
  { id: "r5", guestId: "g5", roomNumber: "205", checkIn: isoOffset(-2), checkOut: isoOffset(0), adults: 2, children: 0, status: "checked_in", ratePerNight: 120 },
  { id: "r6", guestId: "g6", roomNumber: "304", checkIn: isoOffset(2), checkOut: isoOffset(5), adults: 1, children: 0, status: "confirmed", ratePerNight: 180 },
  { id: "r7", guestId: "g7", roomNumber: "108", checkIn: isoOffset(-3), checkOut: isoOffset(-1), adults: 2, children: 0, status: "checked_out", ratePerNight: 120 },
  { id: "r8", guestId: "g8", roomNumber: "307", checkIn: isoOffset(0), checkOut: isoOffset(2), adults: 2, children: 0, status: "checked_in", ratePerNight: 180 },
  { id: "r9", guestId: "g9", roomNumber: "104", checkIn: isoOffset(3), checkOut: isoOffset(7), adults: 1, children: 0, status: "confirmed", ratePerNight: 120 },
  { id: "r10", guestId: "g10", roomNumber: "208", checkIn: isoOffset(-1), checkOut: isoOffset(1), adults: 2, children: 0, status: "checked_in", ratePerNight: 120, notes: "Late checkout requested" },
  { id: "r11", guestId: "g2", roomNumber: "206", checkIn: isoOffset(4), checkOut: isoOffset(8), adults: 2, children: 0, status: "confirmed", ratePerNight: 120 },
  { id: "r12", guestId: "g4", roomNumber: "105", checkIn: isoOffset(5), checkOut: isoOffset(9), adults: 1, children: 0, status: "confirmed", ratePerNight: 120 },
];

export const guestById = (id: string) => guests.find(g => g.id === id);
export const roomByNumber = (n: string) => rooms.find(r => r.number === n);

export const STATUS_META: Record<RoomStatus, { label: string; className: string; dot: string }> = {
  available:    { label: "Available",    className: "bg-success/10 text-success border-success/20",       dot: "bg-success" },
  occupied:     { label: "Occupied",     className: "bg-info/10 text-info border-info/20",                dot: "bg-info" },
  reserved:     { label: "Reserved",     className: "bg-booked/10 text-booked border-booked/20",          dot: "bg-booked" },
  dirty:        { label: "Needs cleaning", className: "bg-warning/15 text-warning-foreground border-warning/30", dot: "bg-warning" },
  out_of_order: { label: "Out of order", className: "bg-destructive/10 text-destructive border-destructive/20", dot: "bg-destructive" },
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
