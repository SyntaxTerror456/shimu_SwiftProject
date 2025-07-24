"use client";

import { useState, useEffect } from "react";
import { notFound, useParams, useRouter } from "next/navigation";
import { SupplierForm, type SupplierFormValues } from "../../supplier-form";
import type { Supplier } from "@/lib/types";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/hooks/use-toast";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { doc, getDoc, updateDoc } from "firebase/firestore";
import { db } from "@/lib/firebaseConfig";

export default function EditSupplierPage() {
  const params = useParams();
  const id = params.id as string;
  const router = useRouter();
  const { toast } = useToast();
  
  const [supplier, setSupplier] = useState<Supplier | null>(null);
  const [loading, setLoading] = useState(true);
  const [isPending, startTransition] = useState(false);

  useEffect(() => {
    if (!id) return;

    const fetchSupplier = async () => {
      const docRef = doc(db, "suppliers", id);
      const docSnap = await getDoc(docRef);

      if (docSnap.exists()) {
        setSupplier({ id: docSnap.id, ...docSnap.data() } as Supplier);
      } else {
        setSupplier(null);
      }
      setLoading(false);
    };

    fetchSupplier().catch((error) => {
      console.error("Fehler beim Laden des Lieferanten:", error);
      setLoading(false);
    });
  }, [id]);

  const handleSubmit = async (data: SupplierFormValues) => {
    if (!id) return;
    startTransition(true);
    try {
      const docRef = doc(db, "suppliers", id);
      await updateDoc(docRef, data);
      
      toast({
        title: "Lieferant aktualisiert",
        description: `${data.name} wurde erfolgreich aktualisiert.`,
      });
      router.push("/dashboard/suppliers");
    } catch (error) {
      console.error("Fehler beim Aktualisieren des Lieferanten:", error);
      toast({
        title: "Fehler",
        description: "Der Lieferant konnte nicht aktualisiert werden.",
        variant: "destructive",
      });
    } finally {
      startTransition(false);
    }
  };

  if (loading) {
    return (
      <div className="flex flex-1 flex-col gap-4">
        <div>
          <Skeleton className="h-8 w-64 mb-2" />
          <Skeleton className="h-4 w-96" />
        </div>
        <div className="flex justify-center py-8">
            <Card className="w-full max-w-2xl">
                <CardHeader>
                    <Skeleton className="h-6 w-1/3" />
                    <Skeleton className="h-4 w-2/3" />
                </CardHeader>
                <CardContent>
                    <div className="space-y-4 pt-4">
                        <div className="space-y-2">
                            <Skeleton className="h-4 w-1/4" />
                            <Skeleton className="h-10 w-full" />
                        </div>
                         <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Skeleton className="h-4 w-1/3" />
                                <Skeleton className="h-10 w-full" />
                            </div>
                            <div className="space-y-2">
                                <Skeleton className="h-4 w-1/3" />
                                <Skeleton className="h-10 w-full" />
                            </div>
                        </div>
                    </div>
                </CardContent>
            </Card>
        </div>
      </div>
    );
  }

  if (!supplier) {
    return notFound();
  }

  return (
    <div className="flex flex-1 flex-col gap-4">
      <div>
        <h1 className="text-2xl font-semibold md:text-3xl">Lieferant bearbeiten</h1>
        <p className="text-muted-foreground">
          Aktualisieren Sie die Details für {supplier.name}.
        </p>
      </div>
      <div className="flex justify-center py-8">
        <Card className="w-full max-w-2xl shadow-lg">
          <CardHeader>
            <CardTitle>Lieferantendetails</CardTitle>
            <CardDescription>Aktualisieren Sie die Details des bestehenden Lieferanten.</CardDescription>
          </CardHeader>
          <CardContent>
            <SupplierForm 
                supplier={supplier}
                onSubmit={handleSubmit}
                isPending={isPending}
                onCancel={() => router.back()}
             />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}