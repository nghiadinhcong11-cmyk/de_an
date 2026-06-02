import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card";
import { Badge } from "../components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "../components/ui/table";
import { Clock, UserCheck, Timer, MapPin } from "lucide-react";
import { mockShifts } from "../data/mockData";

export function OwnerShifts() {
  const [shifts] = useState(mockShifts);

  return (
    <div className="p-8 space-y-8 bg-gray-50 min-h-screen text-gray-900">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-black">Employee Shifts</h1>
          <p className="text-gray-500">Monitor attendance and active work hours</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {[
          { icon: UserCheck, label: 'ON DUTY NOW', val: shifts.filter(s => s.status === 'Active').length, color: 'text-green-600', bg: 'bg-green-100' },
          { icon: Clock, label: 'LATE TODAY', val: '2', color: 'text-red-600', bg: 'bg-red-100' },
          { icon: Timer, label: 'TOTAL HOURS', val: '142h', color: 'text-orange-600', bg: 'bg-orange-100' },
        ].map((s, i) => (
          <Card key={i} className="border-none shadow-sm overflow-hidden">
             <CardContent className="pt-6 flex items-center gap-4">
                <div className={`w-12 h-12 rounded-2xl flex items-center justify-center ${s.bg} ${s.color}`}><s.icon className="w-6 h-6" /></div>
                <div>
                   <div className="text-[10px] font-black text-gray-400 uppercase tracking-widest">{s.label}</div>
                   <div className={`text-2xl font-black ${s.color}`}>{s.val}</div>
                </div>
             </CardContent>
          </Card>
        ))}
      </div>

      <Card className="border-none shadow-sm overflow-hidden">
        <CardContent className="p-0">
          <Table>
            <TableHeader className="bg-gray-50/50">
              <TableRow>
                <TableHead className="font-bold">Employee</TableHead>
                <TableHead className="font-bold">Branch</TableHead>
                <TableHead className="font-bold">Check In</TableHead>
                <TableHead className="font-bold">Check Out</TableHead>
                <TableHead className="font-bold">Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {shifts.map((s) => (
                <TableRow key={s.id}>
                  <TableCell className="font-bold text-gray-900">{s.employeeName}</TableCell>
                  <TableCell><div className="flex items-center gap-1.5 text-xs text-gray-500 font-bold"><MapPin className="w-3 h-3" /> {s.branch}</div></TableCell>
                  <TableCell className="text-xs font-black text-gray-400">{new Date(s.checkIn).toLocaleTimeString()}</TableCell>
                  <TableCell className="text-xs font-black text-gray-400">{s.checkOut ? new Date(s.checkOut).toLocaleTimeString() : '—'}</TableCell>
                  <TableCell>
                    <Badge className={s.status === 'Active' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-400'} border-none>
                      {s.status}
                    </Badge>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
