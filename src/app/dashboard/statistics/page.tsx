"use client";

import { useState, useEffect, useMemo } from "react";
import type { Request, Supplier, RequestStatus } from "@/lib/types";
import { collection, onSnapshot } from "firebase/firestore";
import { db } from "@/lib/firebaseConfig";
import {
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Tooltip,
} from "recharts";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { ChartContainer, ChartTooltipContent } from "@/components/ui/chart";
import { CheckCircle, Clock, Package, Users } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const REQUESTS_STORAGE_KEY = "anfrageleicht-requests";
const SUPPLIERS_STORAGE_KEY = "anfrageleicht-suppliers";

const statusColors: Record<RequestStatus, string> = {
  Entwurf: "hsl(var(--muted-foreground))",
  Gesendet: "hsl(var(--primary))",
  Abgeschlossen: "hsl(var(--chart-2))",
  Storniert: "hsl(var(--destructive))",
};

export default function StatisticsPage() {
  const [requests, setRequests] = useState<Request[]>([]);
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedSupplierId, setSelectedSupplierId] = useState<string | null>(null);

  useEffect(() => {
    const unsubscribeRequests = onSnapshot(
      collection(db, "requests"),
      (snapshot) => {
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
        setLoading(false);
      },
      (error) => {
        console.error("Error fetching requests:", error);
        setLoading(false);
      }
    );

    const unsubscribeSuppliers = onSnapshot(
      collection(db, "suppliers"),
      (snapshot) => {
        const fetchedSuppliers: Supplier[] = snapshot.docs.map((doc) => {
          const data = doc.data();
          return {
            id: doc.id,
            ...data,
          } as Supplier;
        });
        setSuppliers(fetchedSuppliers);
      },
      (error) => {
        console.error("Error fetching suppliers:", error);
      }
    );

    return () => {
      unsubscribeRequests();
      unsubscribeSuppliers();
    };
  }, []);

  // Clear selectedSupplierId if no longer valid
  useEffect(() => {
    if (selectedSupplierId && !suppliers.find((s) => s.id === selectedSupplierId)) {
      setSelectedSupplierId(null);
    }
  }, [selectedSupplierId, suppliers]);

  const selectedSupplier = useMemo(() => {
    if (!selectedSupplierId) return null;
    return suppliers.find((s) => s.id === selectedSupplierId) ?? null;
  }, [selectedSupplierId, suppliers]);

  const supplierRequests = useMemo(() => {
    if (!selectedSupplierId) return [];
    return requests.filter((r) => r.supplier?.id === selectedSupplierId);
  }, [selectedSupplierId, requests]);

  const supplierStats = useMemo(() => {
    if (supplierRequests.length === 0) {
      return { total: 0, completed: 0, pending: 0 };
    }
    return {
      total: supplierRequests.length,
      completed: supplierRequests.filter((r) => r.status === "Abgeschlossen").length,
      pending: supplierRequests.filter(
        (r) => r.status === "Gesendet" || r.status === "Entwurf"
      ).length,
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
      fill: statusColors[status as RequestStatus],
    }));
  }, [supplierRequests]);

  if (loading) {
    return (
      <div className="flex flex-1 flex-col gap-4">
        <div>
          <Skeleton className="h-8 w-64 mb-2" />
          <Skeleton className="h-4 w-96" />
        </div>
        <div className="grid gap-4 md:grid-cols-2">
          <Skeleton className="h-28" />
          <Skeleton className="h-28" />
        </div>
        <Card>
          <CardHeader>
            <Skeleton className="h-10 w-1/2" />
          </CardHeader>
          <CardContent>
            <Skeleton className="h-80 w-full" />
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="flex flex-1 flex-col gap-4">
      <div>
        <h1 className="text-2xl font-semibold md:text-3xl">Statistik</h1>
        <p className="text-muted-foreground">
          Eine Übersicht über Ihre Anfragen und Lieferantenaktivitäten.
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Anfragen Gesamt</CardTitle>
            <Package className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{requests.length}</div>
            <p className="text-xs text-muted-foreground">Gesamtzahl aller Anfragen im System</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Lieferanten Gesamt</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{suppliers.length}</div>
            <p className="text-xs text-muted-foreground">Anzahl der erfassten Lieferanten</p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Lieferantenspezifische Auswertung</CardTitle>
          <CardDescription>
            Wählen Sie einen Lieferanten, um dessen Statistiken anzuzeigen.
          </CardDescription>
          <div className="pt-4">
            <Select onValueChange={setSelectedSupplierId} value={selectedSupplierId ?? undefined}>
              <SelectTrigger className="w-full md:w-1/2">
                <SelectValue placeholder="Bitte wählen Sie einen Lieferanten..." />
              </SelectTrigger>
              <SelectContent>
                {suppliers.map((s, i) => (
                  <SelectItem key={s.id ?? i} value={s.id ?? ""}>
                    {s.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardHeader>
        <CardContent>
          {selectedSupplier ? (
            <div className="grid gap-6">
              <div className="grid gap-4 md:grid-cols-3">
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">
                      Anfragen an {selectedSupplier.name}
                    </CardTitle>
                    <Package className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{supplierStats.total}</div>
                    <p className="text-xs text-muted-foreground">Gesamtzahl der Anfragen</p>
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Abgeschlossen</CardTitle>
                    <CheckCircle className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{supplierStats.completed}</div>
                    <p className="text-xs text-muted-foreground">Abgeschlossene Anfragen</p>
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Offen</CardTitle>
                    <Clock className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{supplierStats.pending}</div>
                    <p className="text-xs text-muted-foreground">
                      Offene Anfragen (Entwurf/Gesendet)
                    </p>
                  </CardContent>
                </Card>
              </div>
              {statusChartData.length > 0 ? (
                <Card>
                  <CardHeader>
                    <CardTitle>Anfragestatus</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ChartContainer config={{}} className="h-80 w-full">
                      <ResponsiveContainer>
                        <PieChart>
                          <Tooltip
                            cursor={{ fill: "hsl(var(--muted))" }}
                            content={<ChartTooltipContent nameKey="status" />}
                          />
                          <Pie
                            data={statusChartData}
                            dataKey="count"
                            nameKey="status"
                            cx="50%"
                            cy="50%"
                            outerRadius={120}
                            labelLine={false}
                            label={({
                              cx,
                              cy,
                              midAngle,
                              innerRadius,
                              outerRadius,
                              value,
                              index,
                            }) => {
                              if (!statusChartData[index]) return null;
                              const RADIAN = Math.PI / 180;
                              const radius = 25 + innerRadius + (outerRadius - innerRadius);
                              const x = cx + radius * Math.cos(-midAngle * RADIAN);
                              const y = cy + radius * Math.sin(-midAngle * RADIAN);

                              return (
                                <text
                                  x={x}
                                  y={y}
                                  textAnchor={x > cx ? "start" : "end"}
                                  dominantBaseline="central"
                                  className="fill-muted-foreground text-xs"
                                >
                                  {statusChartData[index].status} ({value})
                                </text>
                              );
                            }}
                          >
                            {statusChartData.map((entry, index) => (
                              <Cell key={`cell-${index}`} fill={entry.fill} />
                            ))}
                          </Pie>
                        </PieChart>
                      </ResponsiveContainer>
                    </ChartContainer>
                  </CardContent>
                </Card>
              ) : (
                <div className="text-center py-10">
                  <p className="text-muted-foreground">
                    Für diesen Lieferanten wurden keine Anfragen gefunden.
                  </p>
                </div>
              )}
            </div>
          ) : (
            <div className="text-center py-20">
              <p className="text-muted-foreground">
                Bitte wählen Sie einen Lieferanten aus, um die Statistiken anzuzeigen.
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
