"use client";

import { useState, useEffect, useRef } from "react";
import { PlusCircle } from "lucide-react";
import Link from "next/link";
import jsPDF from "jspdf";
import html2canvas from "html2canvas";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import type { Request, RequestStatus } from "@/lib/types";
import { columns } from "./columns";
import { DataTable } from "../suppliers/data-table"; 
import { useToast } from "@/hooks/use-toast";
import { RequestView } from "./[id]/request-view";

import { db } from "@/lib/firebaseConfig";
import { collection, onSnapshot, deleteDoc, doc, updateDoc } from "firebase/firestore";

export default function RequestsPage() {
  const [requests, setRequests] = useState<Request[]>([]);
  const { toast } = useToast();
  const [requestToPrint, setRequestToPrint] = useState<Request | null>(null);
  const printComponentRef = useRef<HTMLDivElement>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    const unsubscribe = onSnapshot(collection(db, "requests"), (snapshot) => {
      const fetchedRequests: Request[] = snapshot.docs.map(doc => {
        const data = doc.data();
        const { id: _, ...restOfData } = data; // Destructure to exclude the 'id' field from data
        return {
          id: doc.id,
          ...restOfData,
          createdAt: data.createdAt.toDate(), // Use data.createdAt as it's a Timestamp
        } as Request;
      });
      setRequests(fetchedRequests);
      setLoading(false);
    }, (error) => {
      console.error("Error fetching requests:", error);
      toast({ title: "Error", description: "Failed to load requests.", variant: "destructive" });
      setLoading(false);
    });

    return () => unsubscribe();
  }, [toast]);

  const deleteRequest = async (requestId: string) => {
    try {
      await deleteDoc(doc(db, "requests", requestId));
      toast({
        title: "Anfrage gelöscht",
        description: `Die Anfrage wurde erfolgreich gelöscht.`,
        variant: "destructive",
      });
    } catch (error) {
      console.error("Error deleting request:", error);
      toast({
        title: "Fehler beim Löschen",
        description: "Die Anfrage konnte nicht gelöscht werden.",
        variant: "destructive",
      });
    }
  };

  const updateRequestStatus = async (requestId: string, status: RequestStatus) => {
    try {
      await updateDoc(doc(db, "requests", requestId), {
        status: status
      });
      toast({
        title: "Status aktualisiert",
        description: `Der Status der Anfrage wurde auf "${status}" geändert.`,
      });
    } catch (error) {
      console.error("Error updating request status:", error);
      toast({
        title: "Fehler beim Aktualisieren",
        description: "Der Status konnte nicht aktualisiert werden.",
        variant: "destructive",
      });
    }
  };

  const downloadPdf = (request: Request) => {
    setRequestToPrint(request);
  };

  useEffect(() => {
    if (requestToPrint && printComponentRef.current) {
      const input = printComponentRef.current.querySelector("#pdf-content");
      if (!input) {
        console.error("PDF content element not found in printComponentRef!");
        toast({ title: "Fehler", description: "PDF-Inhaltselement nicht gefunden.", variant: "destructive" });
        setRequestToPrint(null); // Reset to avoid re-triggering
        return;
      }

      toast({ title: "PDF wird erstellt...", description: "Bitte warten Sie einen Moment." });
      
      html2canvas(input as HTMLElement, { useCORS: true, scale: 2 }).then((canvas) => {
        const imgData = canvas.toDataURL("image/png");

        try {
          const pdf = new jsPDF("p", "mm", "a4");
          const pdfWidth = pdf.internal.pageSize.getWidth();
          const canvasWidth = canvas.width;
          const canvasHeight = canvas.height;
          const pdfHeight = (canvasHeight * pdfWidth) / canvasWidth;

          const pageHeight = pdf.internal.pageSize.getHeight();
          let heightLeft = pdfHeight;
          let position = 0;

          pdf.addImage(imgData, "PNG", 0, position, pdfWidth, pdfHeight);
          heightLeft -= pageHeight;

          while (heightLeft > 0) {
            position -= pageHeight;
            pdf.addPage();
            pdf.addImage(imgData, "PNG", 0, position, pdfWidth, pdfHeight);
            heightLeft -= pageHeight;
          }

          pdf.save(`anfrage-${requestToPrint.requestNumber}.pdf`);
          toast({ title: "PDF heruntergeladen!", description: "Ihre Datei ist bereit." });
        } catch (pdfError) {
          console.error("Error during PDF creation or saving:", pdfError);
          toast({ title: "Fehler", description: "Fehler beim Erstellen oder Speichern der PDF-Datei.", variant: "destructive" });
        } finally {
          setRequestToPrint(null); // Reset after download attempt
        }
      }).catch(html2canvasError => {
        console.error("Error generating canvas with html2canvas:", html2canvasError);
        toast({ title: "Fehler", description: "Fehler beim Erstellen des PDF-Inhalts.", variant: "destructive" });
        setRequestToPrint(null); // Reset after error
      });
    }
  }, [requestToPrint, toast]);

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center">
        Anfragen werden geladen...
      </div>
    );
  }

  return (
    <>
      <div className="flex flex-1 flex-col gap-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-semibold md:text-3xl">Angebotsanfragen</h1>
            <p className="text-muted-foreground">
              Erstellen und verfolgen Sie alle Ihre Angebotsanfragen.
            </p>
          </div>
          <Button asChild>
            <Link href="/dashboard/requests/new">
              <PlusCircle className="mr-2 h-4 w-4" />
              Anfrage erstellen
            </Link>
          </Button>
        </div>
        <Card>
          <CardHeader>
            <CardTitle>Anfrageliste</CardTitle>
            <CardDescription>Eine Zusammenfassung all Ihrer Anfragen.</CardDescription>
          </CardHeader>
          <CardContent>
            <DataTable 
              columns={columns} 
              data={requests} 
              filterColumn="title" 
              filterPlaceholder="Nach Titel filtern..."
              meta={{
                deleteRequest,
                updateRequestStatus,
                downloadPdf,
              }}
            />
          </CardContent>
        </Card>
      </div>
       <div className="absolute left-[-9999px] top-[-9999px]">
        {requestToPrint && (
            <div ref={printComponentRef}>
                <RequestView request={requestToPrint} />
            </div>
        )}
      </div>
    </>
  );
}