"use client";

import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/hooks/use-toast";
import type { Supplier } from "@/lib/types";
import {
  Building2,
  ChevronRight,
  Edit,
  FileText,
  MoreVertical,
  PlusCircle,
  Trash2,
} from "lucide-react";
import Link from "next/link";
import { useEffect, useMemo, useState, useTransition } from "react";
import { type SupplierFormValues } from "./supplier-dialog";

import { db } from "@/lib/firebaseConfig";
import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  onSnapshot,
  updateDoc,
} from "firebase/firestore";

export default function SuppliersPage() {
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [loading, setLoading] = useState(true);
  const [isPending, startTransition] = useTransition();
  const { toast } = useToast();

  useEffect(() => {
    setLoading(true);
    const unsubscribe = onSnapshot(
      collection(db, "suppliers"),
      (snapshot) => {
        const fetchedSuppliers: Supplier[] = snapshot.docs.map((doc) => ({
          ...(doc.data() as Supplier),
          id: doc.id,
        }));
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

    return () => unsubscribe();
  }, [toast]);

  const addSupplier = async (data: SupplierFormValues) => {
    try {
      const newSupplier: Omit<Supplier, "id"> = {
        name: data.name,
        contactPerson: data.contactPerson || "",
        email: data.email || "",
        phone: data.phone || "",
        address: data.address || "",
        country: data.country || "",
      };
      await addDoc(collection(db, "suppliers"), newSupplier);
      toast({
        title: "Lieferant hinzugefügt",
        description: `Der Lieferant "${data.name}" wurde erfolgreich hinzugefügt.`,
      });
    } catch (error) {
      console.error("Error adding supplier:", error);
      toast({
        title: "Fehler beim Hinzufügen",
        description: "Der Lieferant konnte nicht hinzugefügt werden.",
        variant: "destructive",
      });
    }
  };

  const updateSupplier = async (updatedSupplier: Supplier) => {
    try {
      await updateDoc(doc(db, "suppliers", updatedSupplier.id), {
        name: updatedSupplier.name,
        contactPerson: updatedSupplier.contactPerson || "",
        email: updatedSupplier.email || "",
        phone: updatedSupplier.phone || "",
        address: updatedSupplier.address || "",
        country: updatedSupplier.country || "",
      });
      toast({
        title: "Lieferant aktualisiert",
        description: `Der Lieferant "${updatedSupplier.name}" wurde erfolgreich aktualisiert.`,
      });
    } catch (error) {
      console.error("Error updating supplier:", error);
      toast({
        title: "Fehler beim Aktualisieren",
        description: "Der Lieferant konnte nicht aktualisiert werden.",
        variant: "destructive",
      });
    }
  };

  const groupedSuppliers = useMemo(() => {
    return suppliers.reduce((acc, supplier) => {
      const country = supplier.country || "Unbekannt";
      if (!acc[country]) {
        acc[country] = [];
      }
      acc[country].push(supplier);
      return acc;
    }, {} as Record<string, Supplier[]>);
  }, [suppliers]);

  const deleteSupplier = async (supplierId: string) => {
    try {
      await deleteDoc(doc(db, "suppliers", supplierId));
      toast({
        title: "Lieferant gelöscht",
        description: `Der Lieferant wurde erfolgreich gelöscht.`,
        variant: "destructive",
      });
    } catch (error) {
      console.error("Error deleting supplier:", error);
      toast({
        title: "Fehler beim Löschen",
        description: "Der Lieferant konnte nicht gelöscht werden.",
        variant: "destructive",
      });
    }
  };

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
        <Card>
          <CardHeader>
            <Skeleton className="h-6 w-1/3" />
            <Skeleton className="h-4 w-2/3" />
          </CardHeader>
          <CardContent className="space-y-4">
            <Skeleton className="h-12 w-full" />
            <Skeleton className="h-12 w-full" />
            <Skeleton className="h-12 w-full" />
          </CardContent>
        </Card>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center">
        Lieferanten werden geladen...
      </div>
    );
  }

  return (
    <div className="flex flex-1 flex-col gap-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold md:text-3xl">Lieferanten</h1>
          <p className="text-muted-foreground">
            Verwalten Sie Ihre Lieferanten, gruppiert nach Ländern.
          </p>
        </div>
        <Button asChild>
          <Link href="/dashboard/suppliers/new">
            <PlusCircle className="mr-2 h-4 w-4" />
            Lieferant hinzufügen
          </Link>
        </Button>
      </div>
      <Card>
        <CardHeader>
          <CardTitle>Lieferanten nach Land</CardTitle>
          <CardDescription>
            Klappen Sie ein Land auf, um die zugehörigen Lieferanten anzuzeigen.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {Object.keys(groupedSuppliers).length > 0 ? (
            <Accordion type="multiple" className="w-full">
              {Object.entries(groupedSuppliers)
                .sort(([countryA], [countryB]) =>
                  countryA.localeCompare(countryB)
                )
                .map(([country, suppliersInCountry]) => (
                  <AccordionItem value={country} key={country}>
                    <AccordionTrigger className="text-lg font-medium hover:no-underline">
                      <div className="flex items-center">
                        {country} ({suppliersInCountry.length})
                      </div>
                    </AccordionTrigger>
                    <AccordionContent>
                      <div className="space-y-2 pl-4">
                        {suppliersInCountry.map((supplier) => (
                          <div
                            key={supplier.id}
                            className="group flex items-center justify-between rounded-md p-3 hover:bg-muted/50"
                          >
                            <Link
                              href={`/dashboard/suppliers/${supplier.id}`}
                              className="flex-1"
                            >
                              <div className="flex items-center gap-2">
                                <Building2 className="h-4 w-4 text-muted-foreground" />
                                <p className="font-semibold text-primary">
                                  {supplier.name}
                                </p>
                              </div>
                              <p className="text-sm text-muted-foreground">
                                {supplier.contactPerson} &middot;{" "}
                                {supplier.email}
                              </p>
                            </Link>
                            <div className="opacity-0 group-hover:opacity-100 transition-opacity">
                              <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                  <Button variant="ghost" size="icon">
                                    <MoreVertical className="h-4 w-4" />
                                    <span className="sr-only">
                                      Aktionen für {supplier.name}
                                    </span>
                                  </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end">
                                  <DropdownMenuItem asChild>
                                    <Link
                                      href={`/dashboard/suppliers/${supplier.id}`}
                                    >
                                      <ChevronRight className="mr-2 h-4 w-4" />{" "}
                                      Details anzeigen
                                    </Link>
                                  </DropdownMenuItem>
                                  <DropdownMenuItem asChild>
                                    <Link
                                      href={`/dashboard/suppliers/edit/${supplier.id}`}
                                    >
                                      <Edit className="mr-2 h-4 w-4" />{" "}
                                      Bearbeiten
                                    </Link>
                                  </DropdownMenuItem>
                                  <DropdownMenuItem asChild>
                                    <Link
                                      href={`/dashboard/requests/new?supplierId=${supplier.id}`}
                                    >
                                      <FileText className="mr-2 h-4 w-4" />{" "}
                                      Anfrage erstellen
                                    </Link>
                                  </DropdownMenuItem>
                                  <AlertDialog>
                                    <AlertDialogTrigger asChild>
                                      <Button
                                        variant="ghost"
                                        className="w-full justify-start text-red-600 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/50 px-2 py-1.5 text-sm font-normal relative flex cursor-default select-none items-center rounded-sm outline-none transition-colors"
                                      >
                                        <Trash2 className="mr-2 h-4 w-4" />{" "}
                                        Löschen
                                      </Button>
                                    </AlertDialogTrigger>
                                    <AlertDialogContent>
                                      <AlertDialogHeader>
                                        <AlertDialogTitle>
                                          Sind Sie sicher?
                                        </AlertDialogTitle>
                                        <AlertDialogDescription>
                                          Diese Aktion kann nicht rückgängig
                                          gemacht werden. Dadurch wird der
                                          Lieferant "{supplier.name}" endgültig
                                          gelöscht.
                                        </AlertDialogDescription>
                                      </AlertDialogHeader>
                                      <AlertDialogFooter>
                                        <AlertDialogCancel>
                                          Abbrechen
                                        </AlertDialogCancel>
                                        <AlertDialogAction
                                          onClick={() =>
                                            deleteSupplier(supplier.id)
                                          }
                                          disabled={isPending}
                                        >
                                          Löschen
                                        </AlertDialogAction>
                                      </AlertDialogFooter>
                                    </AlertDialogContent>
                                  </AlertDialog>
                                </DropdownMenuContent>
                              </DropdownMenu>
                            </div>
                          </div>
                        ))}
                      </div>
                    </AccordionContent>
                  </AccordionItem>
                ))}
            </Accordion>
          ) : (
            <div className="text-center py-20 text-muted-foreground">
              <p>Noch keine Lieferanten angelegt.</p>
              <Button variant="link" asChild className="mt-2">
                <Link href="/dashboard/suppliers/new">
                  Jetzt ersten Lieferanten erstellen
                </Link>
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
