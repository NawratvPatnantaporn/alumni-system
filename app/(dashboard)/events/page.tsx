"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import Swal from "sweetalert2";

import { supabase } from "@/lib/supabase/client";
import { useAuth } from "@/contexts/auth-context";

import { Calendar, MapPin, Clock, Users, ArrowRight } from "lucide-react";

import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

type EventItem = {
  id: string;
  title: string;
  description: string;
  image_url: string;
  event_date: string;
  start_time: string;
  end_time: string;
  location: string;
  type: "online" | "in-person";
  category: string;
  max_attendees: number;
};

export default function EventsPage() {
  const { user } = useAuth();

  const [events, setEvents] = useState<EventItem[]>([]);
  const [registeredIds, setRegisteredIds] = useState<string[]>([]);
  const [activeTab, setActiveTab] = useState("upcoming");

  const today = new Date();

  // ✅ LOAD DATA
  useEffect(() => {
    fetchEvents();
    if (user) fetchMyRegistrations();
  }, [user]);

  const fetchEvents = async () => {
    const { data } = await supabase
      .from("events")
      .select("*")
      .order("event_date", { ascending: true });

    if (data) setEvents(data);
  };

  const fetchMyRegistrations = async () => {
    if (!user) return; // 🔥 กัน null ก่อนเลย

    const { data } = await supabase
      .from("event_registrations")
      .select("event_id")
      .eq("user_id", user.id);

    if (data) {
      setRegisteredIds(data.map((d) => d.event_id));
    }
  };

  const upcoming = events.filter((e) => new Date(e.event_date) >= today);

  const past = events.filter((e) => new Date(e.event_date) < today);

  const registered = events.filter((e) => registeredIds.includes(e.id));
  
  const handleRegister = async (eventId: string) => {
    if (!user) return;

    const { error } = await supabase.from("event_registrations").insert({
      event_id: eventId,
      user_id: user.id,
    });

    if (error) {
      Swal.fire("ผิดพลาด", "ลงทะเบียนไม่ได้", "error");
      return;
    }

    setRegisteredIds((prev) => [...prev, eventId]);

    Swal.fire("สำเร็จ", "ลงทะเบียนเรียบร้อย", "success");
  };

  // ✅ COUNT PEOPLE
  const getCount = async (eventId: string) => {
    const { count } = await supabase
      .from("event_registrations")
      .select("*", { count: "exact", head: true })
      .eq("event_id", eventId);

    return count || 0;
  };

  // =====================
  // 🎯 CARD COMPONENT
  // =====================
  const EventCard = ({ event }: { event: EventItem }) => {
    const isRegistered = registeredIds.includes(event.id);
    const [count, setCount] = useState(0);

    useEffect(() => {
      getCount(event.id).then(setCount);
    }, []);

    return (
      <Card className="overflow-hidden">
        <img src={event.image_url} className="h-40 w-full object-cover" />

        <CardContent className="p-4 space-y-2">
          <Badge>{event.category}</Badge>

          <h3 className="font-semibold">{event.title}</h3>

          <p className="text-sm text-muted-foreground">{event.description}</p>

          <div className="text-xs space-y-1 text-muted-foreground">
            <div className="flex items-center gap-2">
              <Calendar className="w-3 h-3" />
              {new Date(event.event_date).toLocaleDateString("th-TH")}
            </div>

            <div className="flex items-center gap-2">
              <Clock className="w-3 h-3" />
              {event.start_time} - {event.end_time}
            </div>

            <div className="flex items-center gap-2">
              <MapPin className="w-3 h-3" />
              {event.location}
            </div>
          </div>

          <div className="flex justify-between items-center pt-3 border-t">
            <div className="flex items-center gap-1 text-xs">
              <Users className="w-3 h-3" />
              {count}/{event.max_attendees}
            </div>

            <Button
              size="sm"
              onClick={() => handleRegister(event.id)}
              variant={isRegistered ? "outline" : "default"}
            >
              {isRegistered ? "ดูรายละเอียด" : "ลงทะเบียน"}
              <ArrowRight className="w-3 h-3 ml-1" />
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  };

  // =====================
  // 🎯 UI
  // =====================
  return (
    <div className="space-y-6">
      {/* ✅ STATS */}
      <div className="grid grid-cols-3 gap-4">
        <Card>
          <CardContent className="p-4 text-center">
            <p className="text-2xl font-bold">{upcoming.length}</p>
            <p className="text-xs">กำลังจะมาถึง</p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4 text-center">
            <p className="text-2xl font-bold">{registered.length}</p>
            <p className="text-xs">ที่ลงทะเบียน</p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4 text-center">
            <p className="text-2xl font-bold">{past.length}</p>
            <p className="text-xs">ที่ผ่านมา</p>
          </CardContent>
        </Card>
      </div>

      {/* ✅ TABS */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid grid-cols-3 w-full max-w-md">
          <TabsTrigger value="upcoming">กำลังจะมาถึง</TabsTrigger>
          <TabsTrigger value="registered">ที่ลงทะเบียน</TabsTrigger>
          <TabsTrigger value="past">ผ่านมาแล้ว</TabsTrigger>
        </TabsList>

        <TabsContent value="upcoming">
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 mt-6">
            {upcoming.map((e) => (
              <EventCard key={e.id} event={e} />
            ))}
          </div>
        </TabsContent>

        <TabsContent value="registered">
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 mt-6">
            {registered.map((e) => (
              <EventCard key={e.id} event={e} />
            ))}
          </div>
        </TabsContent>

        <TabsContent value="past">
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 mt-6">
            {past.map((e) => (
              <EventCard key={e.id} event={e} />
            ))}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
