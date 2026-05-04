import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import type { Room, Guest, Reservation, RoomStatus, ReservationStatus } from "@/lib/hotel-data";

const mapRoom = (r: any): Room => ({
  number: r.number, floor: r.floor, type: r.type, rate: Number(r.rate),
  capacity: r.capacity, status: r.status,
});
const mapGuest = (g: any): Guest => ({
  id: g.id, name: g.name, email: g.email, phone: g.phone, country: g.country, vip: g.vip,
});
const mapRes = (r: any): Reservation => ({
  id: r.id, guestId: r.guest_id, roomNumber: r.room_number,
  checkIn: r.check_in, checkOut: r.check_out, adults: r.adults, children: r.children,
  status: r.status, ratePerNight: Number(r.rate_per_night), notes: r.notes,
});

export function useRooms() {
  return useQuery({
    queryKey: ["rooms"],
    queryFn: async (): Promise<Room[]> => {
      const { data, error } = await supabase.from("rooms").select("*").order("number");
      if (error) throw error;
      return (data ?? []).map(mapRoom);
    },
  });
}

export function useGuests() {
  return useQuery({
    queryKey: ["guests"],
    queryFn: async (): Promise<Guest[]> => {
      const { data, error } = await supabase.from("guests").select("*").order("name");
      if (error) throw error;
      return (data ?? []).map(mapGuest);
    },
  });
}

export function useReservations() {
  return useQuery({
    queryKey: ["reservations"],
    queryFn: async (): Promise<Reservation[]> => {
      const { data, error } = await supabase.from("reservations").select("*").order("check_in");
      if (error) throw error;
      return (data ?? []).map(mapRes);
    },
  });
}

export function useUpdateRoomStatus() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ number, status }: { number: string; status: RoomStatus }) => {
      const { error } = await supabase.from("rooms").update({ status }).eq("number", number);
      if (error) throw error;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["rooms"] }),
  });
}

export function useCreateReservation() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (input: {
      guest_id: string; room_number: string; check_in: string; check_out: string;
      adults: number; children: number; rate_per_night: number; notes?: string;
      status?: ReservationStatus;
    }) => {
      const { error } = await supabase.from("reservations").insert(input);
      if (error) throw error;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["reservations"] }),
  });
}

export function useCreateGuest() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (input: { name: string; email?: string; phone?: string; country?: string; vip?: boolean }) => {
      const { data, error } = await supabase.from("guests").insert(input).select().single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["guests"] }),
  });
}

export function useUpdateReservationStatus() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, status }: { id: string; status: ReservationStatus }) => {
      const { error } = await supabase.from("reservations").update({ status }).eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["reservations"] }),
  });
}

export function guestById(guests: Guest[] | undefined, id: string) {
  return guests?.find(g => g.id === id);
}
