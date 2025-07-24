"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useAuth } from "@/hooks/use-auth";
import { useToast } from "@/hooks/use-toast";
import { db } from "@/lib/firebaseConfig";
import type { Request, RequestStatus, Supplier } from "@/lib/types";
import { format } from "date-fns";
import { de } from "date-fns/locale";
import { collection, onSnapshot } from "firebase/firestore";
import { ArrowUpRight, CheckCircle, Clock, Package, Users } from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";

const statusVariantMap: Record<
  RequestStatus,
  "default" | "secondary" | "destructive" | "outline"
> = {
  Entwurf: "secondary",
  Gesendet: "default",
  Abgeschlossen: "outline",
  Storniert: "destructive",
};

export default function Dashboard() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [requests, setRequests] = useState<Request[]>([]);
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);

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
                : data.createdAt instanceof Date
                ? data.createdAt
                : new Date(),
            validUntil:
              data.validUntil && typeof data.validUntil.toDate === "function"
                ? data.validUntil.toDate()
                : data.validUntil instanceof Date
                ? data.validUntil
                : undefined,
          } as Request;
        });
        setRequests(fetchedRequests);
      },
      (error) => {
        console.error("Error fetching requests:", error);
        toast({
          title: "Error",
          description: "Failed to load requests.",
          variant: "destructive",
        });
      }
    );

    const unsubscribeSuppliers = onSnapshot(
      collection(db, "suppliers"),
      (snapshot) => {
        const fetchedSuppliers: Supplier[] = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        })) as Supplier[];
        setSuppliers(fetchedSuppliers);
        setLoading(false);
      },
      (error) => {
        console.error("Error fetching suppliers:", error);
        toast({
          title: "Error",
          description: "Failed to load suppliers.",
          variant: "destructive",
        });
        setLoading(false);
      }
    );

    return () => {
      unsubscribeRequests();
      unsubscribeSuppliers();
    };
  }, [toast]);

  const totalRequests = requests.length;
  const totalSuppliers = suppliers.length;
  const completedRequests = requests.filter(
    (r) => r.status === "Abgeschlossen"
  ).length;
  const pendingRequests = requests.filter(
    (r) => r.status === "Entwurf" || r.status === "Gesendet"
  ).length;

  const stats = [
    { title: "Anfragen Gesamt", value: totalRequests, icon: Package },
    { title: "Aktive Lieferanten", value: totalSuppliers, icon: Users },
    {
      title: "Abgeschl. Anfragen",
      value: completedRequests,
      icon: CheckCircle,
    },
    { title: "Offene Anfragen", value: pendingRequests, icon: Clock },
  ];

  const recentRequests = [...requests]
    .sort(
      (a, b) =>
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    )
    .slice(0, 5);

  if (loading) {
    return (
      <div className="flex flex-1 flex-col gap-4">
        <div className="flex items-center justify-between">
          <div>
            <Skeleton className="h-8 w-48 mb-2" />
            <Skeleton className="h-4 w-96" />
          </div>
          <Skeleton className="h-10 w-44" />
        </div>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {[...Array(4)].map((_, i) => (
            <Skeleton key={i} className="h-28" />
          ))}
        </div>
        <div className="grid gap-4">
          <Skeleton className="h-80" />
          <Skeleton className="h-56" />
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-1 flex-col gap-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold md:text-3xl">Dashboard</h1>
          <p className="text-muted-foreground">
            Willkommen zurück, {user?.email}. Hier ist eine Zusammenfassung
            Ihrer Aktivitäten.
          </p>
        </div>
        <Button asChild>
          <Link href="/dashboard/requests/new">Neue Anfrage erstellen</Link>
        </Button>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat, index) => (
          <Card key={index}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                {stat.title}
              </CardTitle>
              <stat.icon className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stat.value}</div>
              <p className="text-xs text-muted-foreground">Aktueller Stand</p>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid gap-4 grid-cols-1">
        <Card className="col-span-1">
          <CardHeader>
            <CardTitle>Letzte Anfragen</CardTitle>
            <CardDescription>
              Eine Übersicht Ihrer letzten 5 Angebotsanfragen.
            </CardDescription>
          </CardHeader>
          <CardContent className="p-0">
            {recentRequests.length > 0 ? (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-[120px] pl-6">
                      Anfrage-Nr.
                    </TableHead>
                    <TableHead>Titel</TableHead>
                    <TableHead>Lieferant</TableHead>
                    <TableHead>Erstellt am</TableHead>
                    <TableHead className="pr-6 text-right">Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {recentRequests.map((request) => (
                    <TableRow key={request.id}>
                      <TableCell className="font-medium pl-6">
                        <Link
                          href={`/dashboard/requests/${request.id}`}
                          className="hover:underline"
                        >
                          {request.requestNumber}
                        </Link>
                      </TableCell>
                      <TableCell>{request.title}</TableCell>
                      <TableCell>{request.supplier?.name || "N/A"}</TableCell>
                      <TableCell>
                        {format(new Date(request.createdAt), "dd.MM.yyyy", {
                          locale: de,
                        })}
                      </TableCell>
                      <TableCell className="text-right pr-6">
                        <Badge variant={statusVariantMap[request.status]}>
                          {request.status}
                        </Badge>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            ) : (
              <div className="p-6 pt-0">
                <p className="text-sm text-muted-foreground text-center py-10">
                  Noch keine Anfragen erstellt.
                </p>
              </div>
            )}
          </CardContent>
        </Card>
        <Card className="col-span-1">
          <CardHeader>
            <CardTitle>Schnellaktionen</CardTitle>
            <CardDescription>
              Ihre Verknüpfungen zu allgemeinen Aufgaben.
            </CardDescription>
          </CardHeader>
          <CardContent className="grid gap-4 md:grid-cols-2">
            <Link
              href="/dashboard/requests/new"
              className="flex items-center justify-between rounded-lg border p-4 hover:bg-muted/50 transition-colors"
            >
              <div>
                <h3 className="font-semibold">Neue Anfrage</h3>
                <p className="text-sm text-muted-foreground">
                  Starten Sie eine neue Angebotsanfrage.
                </p>
              </div>
              <ArrowUpRight className="h-5 w-5 text-muted-foreground" />
            </Link>
            <Link
              href="/dashboard/suppliers"
              className="flex items-center justify-between rounded-lg border p-4 hover:bg-muted/50 transition-colors"
            >
              <div>
                <h3 className="font-semibold">Lieferanten verwalten</h3>
                <p className="text-sm text-muted-foreground">
                  Lieferantendetails hinzufügen, anzeigen oder bearbeiten.
                </p>
              </div>
              <ArrowUpRight className="h-5 w-5 text-muted-foreground" />
            </Link>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
