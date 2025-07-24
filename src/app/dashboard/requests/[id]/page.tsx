"use client";

import { useState, useEffect } from "react";
import { notFound, useParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Download, Edit, Send } from "lucide-react";
import { RequestView } from "./request-view";
import jsPDF from "jspdf";
import html2canvas from "html2canvas";
import { useToast } from "@/hooks/use-toast";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import type { Request } from "@/lib/types";
import Link from "next/link";

import { db } from "@/lib/firebaseConfig";
import { doc, getDoc } from "firebase/firestore";

export default function RequestDetailPage() {
  const params = useParams();
  const id = params.id as string;
  const { toast } = useToast();
  const [request, setRequest] = useState<Request | null>(null);
  const [loading, setLoading] = useState(true);

  const handleDownloadPdf = () => {
    const input = document.getElementById("pdf-content");
    if (!input) {
      console.error("PDF content element not found!");
      toast({
        title: "Fehler",
        description: "PDF-Inhaltselement nicht gefunden.",
        variant: "destructive",
      });
      return;
    }
    if (!request) {
      console.error("Request data not available for PDF generation.");
      toast({
        title: "Fehler",
        description: "Anfragedaten für PDF-Generierung nicht verfügbar.",
        variant: "destructive",
      });
      return;
    }

    toast({
      title: "PDF wird erstellt...",
      description: "Bitte warten Sie einen Moment.",
    });

    setTimeout(() => {
      html2canvas(input, {
        useCORS: true,
        scale: 2,
        onclone: (document) => {
          // Customize cloned document if needed
        },
      })
        .then((canvas) => {
          const imgData = canvas.toDataURL("image/png");
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

          pdf.save(`anfrage-${request.requestNumber}.pdf`);
          toast({
            title: "PDF heruntergeladen!",
            description: "Ihre Datei ist bereit.",
          });
        })
        .catch((html2canvasError) => {
          console.error("Error generating canvas with html2canvas:", html2canvasError);
          toast({
            title: "Fehler",
            description: "Fehler beim Erstellen des PDF-Inhalts.",
            variant: "destructive",
          });
        });
    });
  };

  useEffect(() => {
    const fetchRequest = async () => {
      if (!id) {
        console.log("No ID found in params.");
        return;
      }
      setLoading(true);
      try {
        const docRef = doc(db, "requests", id);
        const docSnap = await getDoc(docRef);

        if (docSnap.exists()) {
          const data = docSnap.data();
          setRequest({
            id: docSnap.id,
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
          } as Request);
        } else {
          setRequest(null);
        }
      } catch (error) {
        console.error("Error fetching request:", error);
        toast({
          title: "Error",
          description: "Failed to load request.",
          variant: "destructive",
        });
        setRequest(null);
      } finally {
        setLoading(false);
      }
    };

    fetchRequest();
  }, [id, toast]);

  if (loading) {
    return (
      <div className="flex flex-1 flex-col gap-4">
        <div className="flex items-center justify-between">
          <div>
            <Skeleton className="h-8 w-64 mb-2" />
            <Skeleton className="h-4 w-80" />
          </div>
          <div className="flex gap-2">
            <Skeleton className="h-10 w-24" />
            <Skeleton className="h-10 w-44" />
            <Skeleton className="h-10 w-44" />
          </div>
        </div>
        <Card>
          <CardContent className="p-0">
            <div className="p-8">
              <Skeleton className="h-[600px] w-full" />
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!request) {
    return notFound();
  }

  return (
    <div className="flex flex-1 flex-col gap-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold md:text-3xl">Anfragedetails</h1>
          <p className="text-muted-foreground">
            Anzeige der Anfrage: {request.requestNumber}
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline">
            <Edit className="mr-2 h-4 w-4" /> Bearbeiten
          </Button>
          <Button>
            <Send className="mr-2 h-4 w-4" /> An Lieferant senden
          </Button>
          <Button variant="outline" asChild>
            <Link href={`/dashboard/requests/edit/${request.id}`}>
              <Edit className="mr-2 h-4 w-4" /> Bearbeiten
            </Link>
          </Button>
          <Button><Send className="mr-2 h-4 w-4" /> An Lieferant senden</Button>
          <Button variant="secondary" onClick={handleDownloadPdf}>
            <Download className="mr-2 h-4 w-4" />
            PDF herunterladen
          </Button>
        </div>
      </div>
      <Card>
        <CardContent className="p-0">
          <RequestView request={request} />
        </CardContent>
      </Card>
    </div>
  );
}
