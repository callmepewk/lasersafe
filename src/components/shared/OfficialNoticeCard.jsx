import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Bell, Clock } from "lucide-react";

export default function OfficialNoticeCard({ title, message, sentAt }) {
  return (
    <Card className="bg-amber-50 border-amber-200 shadow-lg">
      <CardHeader className="space-y-3">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-amber-600 text-white">
              <Bell className="w-5 h-5" />
            </div>
            <div>
              <CardTitle className="text-xl text-slate-900">{title}</CardTitle>
              <p className="text-sm text-slate-600">Notificação formal</p>
            </div>
          </div>
          <Badge variant="outline" className="w-fit border-amber-300 text-amber-900 bg-white/70">
            <Clock className="w-3.5 h-3.5 mr-1" />
            {sentAt}
          </Badge>
        </div>
      </CardHeader>
      <CardContent>
        <ScrollArea className="max-h-[420px] pr-4">
          <div className="whitespace-pre-wrap text-sm md:text-base leading-7 text-slate-800">
            {message}
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  );
}