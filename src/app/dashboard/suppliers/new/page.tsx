"use client";

import { useRouter } from "next/navigation";
import { useTransition } from "react";
import { SupplierForm, type SupplierFormValues } from "../supplier-form";
import { useToast } from "@/hooks/use-toast";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { db } from "@/lib/firebaseConfig";
import { addDoc, collection } from "firebase/firestore";

export default function NewSupplierPage() {
  const router = useRouter();
  const { toast } = useToast();
  const [isPending, startTransition] = useTransition();

  const handleSubmit = (data: SupplierFormValues) => {
    startTransition(async () => {
      try {
        await addDoc(collection(db, "suppliers"), data);
        
        toast({
            title: "Lieferant erstellt",
            description: `${data.name} wurde erfolgreich hinzugefügt.`,
        });
        router.push("/dashboard/suppliers");
        router.refresh();
      } catch (error) {
        console.error("Error adding supplier:", error);
        toast({
          title: "Fehler",
          description: "Der Lieferant konnte nicht erstellt werden.",
          variant: "destructive",
        });
      }
    });
  };

  return (
    <div className="flex flex-1 flex-col gap-4">
      <div>
        <h1 className="text-2xl font-semibold md:text-3xl">Neuen Lieferant anlegen</h1>
        <p className="text-muted-foreground">
          Füllen Sie das Formular aus, um einen neuen Lieferanten zu erstellen.
        </p>
      </div>
      <div className="flex justify-center py-8">
        <Card className="w-full max-w-2xl shadow-lg">
          <CardHeader>
            <CardTitle>Lieferantendetails</CardTitle>
            <CardDescription>Geben Sie die Informationen für den neuen Lieferanten ein.</CardDescription>
          </CardHeader>
          <CardContent>
             <SupplierForm 
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