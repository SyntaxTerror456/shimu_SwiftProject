
'use server';

import { db } from '@/lib/firebaseConfig'; // Using client SDK as per your last update, assuming rules are open for now
// If you implement Admin SDK, use adminDb here
import { addDoc, collection, getDocs, limit, orderBy, query, doc, setDoc } from 'firebase/firestore';
import { revalidatePath } from 'next/cache';
import { z } from 'zod';
import type { Request, RequestItem, Supplier } from '@/lib/types';

const requestItemSchema = z.object({
  id: z.string().optional(),
  materialNumber: z.string().optional(),
  designation: z.string().optional(),
  description: z.string().optional(),
  quantity: z.coerce.number().optional(),
});

const requestWizardSchema = z.object({
  contactFirstName: z.string().optional(),
  contactLastName: z.string().optional(),
  contactEmail: z.string().email("Ungültige E-Mail-Adresse.").optional().or(z.literal("")),
  contactPhone: z.string().optional(),
  supplierId: z.string().optional(), // Made optional
  requestDate: z.date().optional(),
  validUntil: z.date().optional(), // This is the field that can be undefined
  items: z.array(requestItemSchema).optional(),
  notes: z.string().optional(),
});

type RequestWizardValues = z.infer<typeof requestWizardSchema>;

export async function addRequest(data: RequestWizardValues, supplier: Supplier | null) {
  const validatedData = requestWizardSchema.parse(data);

  let newRequestNumber = "";
  try {
    const q = query(
      collection(db, "requests"), // Use db from firebaseConfig for now as per your rules update
      orderBy("createdAt", "desc"),
      limit(1)
    );
    const querySnapshot = await getDocs(q);
    let lastRequestNumber = 0;
    if (!querySnapshot.empty) {
      const lastRequest = querySnapshot.docs[0].data() as Request;
      const numPart = lastRequest.requestNumber.split("-")[1];
      lastRequestNumber = numPart ? parseInt(numPart) : 0;
    }
    const newRequestNum = (lastRequestNumber + 1).toString().padStart(5, "0");
    newRequestNumber = `${new Date().getFullYear()}-${newRequestNum}`;
  } catch (error) {
    console.error("Error generating request number:", error);
    throw new Error("Failed to generate request number.");
  }

  const baseRequest: Omit<Request, "id"> = {
    requestNumber: newRequestNumber,
    title: `Anfrage für ${supplier?.name || "Unbekannter Lieferant"}`,
    status: "Entwurf",
    createdAt: validatedData.requestDate || new Date(),
    contactPerson: {
      firstName: validatedData.contactFirstName || "",
      lastName: validatedData.contactLastName || "",
      email: validatedData.contactEmail || "",
      phone: validatedData.contactPhone || "",
    },
    supplier: supplier,
    items: (validatedData.items || []).map(
      (item, index): RequestItem => ({
        id: `ITEM-${Date.now()}-${index}`,
        materialNumber: item.materialNumber || "",
        designation: item.designation || "N/A",
        description: item.description || "",
        quantity: item.quantity ?? 0,
      })
    ),
    notes: validatedData.notes || "",
  };

  const newRequest: Request = {
    ...baseRequest,
    ...(validatedData.validUntil && { validUntil: validatedData.validUntil }),
  } as Request;

  await addDoc(collection(db, "requests"), newRequest);

  revalidatePath('/dashboard/requests');
}

export async function updateRequest(id: string, data: RequestWizardValues, supplier: Supplier | null) {
  const validatedData = requestWizardSchema.parse(data);

  const updatedRequest: Partial<Omit<Request, "id">> = {
    title: `Anfrage für ${supplier?.name || "Unbekannter Lieferant"}`,
    contactPerson: {
      firstName: validatedData.contactFirstName || "",
      lastName: validatedData.contactLastName || "",
      email: validatedData.contactEmail || "",
      phone: validatedData.contactPhone || "",
    },
    supplier: supplier,
    items: (validatedData.items || []).map(
      (item, index): RequestItem => ({
        id: item.id || `ITEM-${Date.now()}-${index}`, // Keep existing ID or generate new for new items
        materialNumber: item.materialNumber || "",
        designation: item.designation || "N/A",
        description: item.description || "",
        quantity: item.quantity ?? 0,
      })
    ),
    notes: validatedData.notes || "",
    validUntil: validatedData.validUntil || null, // Set to null if undefined for Firebase
  };

  await setDoc(doc(db, "requests", id), updatedRequest, { merge: true });

  revalidatePath('/dashboard/requests');
  revalidatePath(`/dashboard/requests/${id}`);
}