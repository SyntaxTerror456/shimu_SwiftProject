"use client";

import { useState, useEffect } from "react";
import { notFound, useParams } from "next/navigation";
import { RequestWizard } from "../../new/request-wizard";
import type { Request } from "@/lib/types";
import { Skeleton } from "@/components/ui/skeleton";
import { doc, getDoc } from "firebase/firestore";
import { db } from "@/lib/firebaseConfig";

export default function EditRequestPage() {
  const params = useParams();
  const id = params.id as string;
  const [request, setRequest] = useState<Request | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchRequest = async () => {
      try {
        const docRef = doc(db, "requests", id);
        const docSnap = await getDoc(docRef);

        if (docSnap.exists()) {
          const data = docSnap.data();
          setRequest({
            id: docSnap.id,
            ...data,
            createdAt: data.createdAt && typeof data.createdAt.toDate === "function"
              ? data.createdAt.toDate()
              : data.createdAt instanceof Date
              ? data.createdAt
              : new Date(),
            validUntil: data.validUntil && typeof data.validUntil.toDate === "function"
              ? data.validUntil.toDate()
              : data.validUntil instanceof Date
              ? data.validUntil
              : undefined,
          } as Request);
        } else {
          setRequest(null);
        }
      } catch (error) {
        console.error("Fehler beim Laden der Anfrage:", error);
        setRequest(null);
      } finally {
        setLoading(false);
      }
    };

    fetchRequest();
  }, [id]);

  if (loading) {
    return (
      <div className="flex flex-1 flex-col gap-4">
        <div>
          <Skeleton className="h-8 w-64 mb-2" />
          <Skeleton className="h-4 w-96" />
        </div>
        <div className="flex justify-center py-8">
            <div className="w-full max-w-4xl space-y-8">
                <Skeleton className="h-48 w-full" />
                <Skeleton className="h-96 w-full" />
                <Skeleton className="h-64 w-full" />
            </div>
        </div>
      </div>
    );
  }

  if (!request) {
    return notFound();
  }

  return (
    <div className="flex flex-1 flex-col gap-4">
      <div>
        <h1 className="text-2xl font-semibold md:text-3xl">Anfrage bearbeiten</h1>
        <p className="text-muted-foreground">
          Bearbeiten Sie die Details für die Anfrage {request.requestNumber}.
        </p>
      </div>
      <div className="flex justify-center py-8">
        <RequestWizard existingRequest={request} />
      </div>
    </div>
  );
}
