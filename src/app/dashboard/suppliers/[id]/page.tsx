"use client";

import { useState, useEffect, useMemo } from "react";
import { notFound, useParams } from "next/navigation";
import type { Request, Supplier, RequestStatus } from "@/lib/types";
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { ChartContainer, ChartTooltipContent } from "@/components/ui/chart";
import { CheckCircle, Clock, Package, Users, Mail, Phone, MapPin } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import Link from "next/link";
import { format } from "date-fns";
import { de } from "date-fns/locale";
import { Separator } from "@/components/ui/separator";
import { collection, doc, onSnapshot } from "firebase/firestore";
import { db } from "@/lib/firebaseConfig";

const statusColors: Record<RequestStatus, string> = {
  'Entwurf': 'hsl(var(--muted-foreground))',
  'Gesendet': 'hsl(var(--primary))',
  'Abgeschlossen': 'hsl(var(--chart-2))',
  'Storniert': 'hsl(var(--destructive))',
};

const statusVariantMap: Record<RequestStatus, "default" | "secondary" | "destructive" | "outline"> = {
    'Entwurf': 'secondary',
    'Gesendet': 'default',
    'Abgeschlossen': 'outline',
    'Storniert': 'destructive',
};

export default function SupplierDetailPage() {
  const params = useParams();
  const id = params.id as string;
  const [requests, setRequests] = useState<Request[]>([]);
  const [supplier, setSupplier] = useState<Supplier | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!id) return;

    const supplierDocRef = doc(db, "suppliers", id);
    const unsubscribeSupplier = onSnapshot(supplierDocRef, (doc) => {
      if (doc.exists()) {
        setSupplier({ id: doc.id, ...doc.data() } as Supplier);
      } else {
        setSupplier(null);
      }
      setLoading(false);
    }, (error) => {
      console.error("Error fetching supplier:", error);
      setLoading(false);
    });

    const requestsCollectionRef = collection(db, "requests");
    const unsubscribeRequests = onSnapshot(requestsCollectionRef, (snapshot) => {
      const fetchedRequests: Request[] = snapshot.docs.map((doc) => {
        const data = doc.data();
        return {
          id: doc.id,
          ...data,
          createdAt:
            data.createdAt && typeof data.createdAt.toDate === "function"
              ? data.createdAt.toDate()
              : new Date(),
          validUntil:
            data.validUntil && typeof data.validUntil.toDate === "function"
              ? data.validUntil.toDate()
              : undefined,
        } as Request;
      });
      setRequests(fetchedRequests);
    });

    return () => {
      unsubscribeSupplier();
      unsubscribeRequests();
    };
  }, [id]);

  const supplierRequests = useMemo(() => {
    if (!supplier) return [];
    return requests.filter(r => r.supplier?.id === supplier.id);
  }, [supplier, requests]);

  const supplierStats = useMemo(() => {
    if (supplierRequests.length === 0) {
      return { total: 0, completed: 0, pending: 0 };
    }
    return {
      total: supplierRequests.length,
      completed: supplierRequests.filter(r => r.status === 'Abgeschlossen').length,
      pending: supplierRequests.filter(r => r.status === 'Gesendet' || r.status === 'Entwurf').length,
    };
  }, [supplierRequests]);
  
  const statusChartData = useMemo(() => {
    if (supplierRequests.length === 0) return [];
    
    const statusCounts = supplierRequests.reduce((acc, req) => {
        acc[req.status] = (acc[req.status] || 0) + 1;
        return acc;
    }, {} as Record<RequestStatus, number>);

    return Object.entries(statusCounts).map(([status, count]) => ({
      status: status as RequestStatus,
      count,
      fill: statusColors[status as RequestStatus]
    }));

  }, [supplierRequests]);

  if (loading) {
    return (
      <div className="flex flex-1 flex-col gap-4">
        <div>
          <Skeleton className="h-8 w-64 mb-2" />
          <Skeleton className="h-4 w-96" />
        </div>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <Skeleton className="h-48 col-span-1 lg:col-span-1" />
            <div className="col-span-1 lg:col-span-3 grid gap-4 md:grid-cols-3">
                 <Skeleton className="h-24" />
                 <Skeleton className="h-24" />
                 <Skeleton className="h-24" />
                 <Skeleton className="h-[260px] md:col-span-3" />
            </div>
        </div>
        <Skeleton className="h-64 w-full" />
      </div>
    );
  }

  if (!supplier) {
    return notFound();
  }

  return (
    <div className="flex flex-1 flex-col gap-4">
      <div>
        <h1 className="text-2xl font-semibold md:text-3xl">Lieferantendetails</h1>
        <p className="text-muted-foreground">
          Statistiken und Anfragen für: {supplier.name}
        </p>
      </div>

       <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          <Card className="lg:col-span-1">
             <CardHeader>
                <CardTitle>{supplier.name}</CardTitle>
                <CardDescription>Kontaktinformationen</CardDescription>
             </CardHeader>
             <CardContent className="space-y-4 text-sm">
                <div className="flex items-start gap-3">
                    <MapPin className="h-4 w-4 text-muted-foreground mt-1" />
                    <span className="whitespace-pre-wrap">{supplier.address}<br />{supplier.country}</span>
                </div>
                <Separator />
                <div>
                    <div className="flex items-center gap-3">
                        <Users className="h-4 w-4 text-muted-foreground" />
                        <span className="font-semibold">{supplier.contactPerson}</span>
                    </div>
                    <div className="flex items-center gap-3 mt-2">
                        <Mail className="h-4 w-4 text-muted-foreground" />
                        <a href={`mailto:${supplier.email}`} className="text-primary hover:underline">{supplier.email}</a>
                    </div>
                    <div className="flex items-center gap-3 mt-2">
                        <Phone className="h-4 w-4 text-muted-foreground" />
                        <span>{supplier.phone}</span>
                    </div>
                </div>
             </CardContent>
          </Card>
           <div className="lg:col-span-3 grid gap-6">
                <div className="grid gap-4 md:grid-cols-3">
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Anfragen Gesamt</CardTitle>
                            <Package className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{supplierStats.total}</div>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Abgeschlossen</CardTitle>
                            <CheckCircle className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{supplierStats.completed}</div>
                        </CardContent>
                    </Card>
                     <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Offen</CardTitle>
                            <Clock className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{supplierStats.pending}</div>
                        </CardContent>
                    </Card>
                </div>
                {statusChartData.length > 0 && (
                    <Card>
                        <CardHeader>
                            <CardTitle>Anfragestatus</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <ChartContainer config={{}} className="h-64 w-full">
                                <ResponsiveContainer>
                                    <PieChart>
                                        <Tooltip
                                            cursor={{ fill: 'hsl(var(--muted))' }}
                                            content={<ChartTooltipContent nameKey="status" />}
                                        />
                                        <Pie data={statusChartData} dataKey="count" nameKey="status" cx="50%" cy="50%" outerRadius={80} label>
                                            {statusChartData.map((entry, index) => (
                                                <Cell key={`cell-${index}`} fill={entry.fill} />
                                            ))}
                                        </Pie>
                                    </PieChart>
                                </ResponsiveContainer>
                            </ChartContainer>
                        </CardContent>
                    </Card>
                )}
            </div>
       </div>

       <Card>
            <CardHeader>
                <CardTitle>Anfragen an {supplier.name}</CardTitle>
                <CardDescription>Eine Liste aller Anfragen an diesen Lieferanten.</CardDescription>
            </CardHeader>
            <CardContent>
                {supplierRequests.length > 0 ? (
                    <ul className="space-y-3">
                        {supplierRequests.map((request) => (
                            <li key={request.id}>
                                <Link href={`/dashboard/requests/${request.id}`} className="block rounded-lg border bg-card text-card-foreground shadow-sm hover:bg-muted/50 transition-colors p-4">
                                    <div className="flex justify-between items-center">
                                        <div>
                                            <p className="font-semibold text-primary">{request.requestNumber}: {request.title}</p>
                                            <p className="text-sm text-muted-foreground">
                                                Erstellt am: {format(new Date(request.createdAt), "dd. MMMM yyyy", { locale: de })}
                                            </p>
                                        </div>
                                        <Badge variant={statusVariantMap[request.status]}>{request.status}</Badge>
                                    </div>
                                </Link>
                            </li>
                        ))}
                    </ul>
                ) : (
                    <div className="text-center py-10">
                        <p className="text-muted-foreground">Für diesen Lieferanten wurden keine Anfragen gefunden.</p>
                    </div>
                )}
            </CardContent>
       </Card>
    </div>
  );
}