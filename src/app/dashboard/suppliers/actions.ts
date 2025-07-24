'use server';

import { db } from '@/lib/firebaseConfig';
import { addDoc, collection } from 'firebase/firestore';
import { revalidatePath } from 'next/cache';
import { z } from 'zod';

const supplierSchema = z.object({
  name: z.string().min(2),
  contactPerson: z.string().min(2),
  email: z.string().email(),
  phone: z.string().min(10),
  address: z.string().min(5),
  country: z.string().min(2),
});

export async function addSupplier(data: z.infer<typeof supplierSchema>) {
  const validatedData = supplierSchema.parse(data);

  await addDoc(collection(db, 'suppliers'), validatedData);

  revalidatePath('/dashboard/suppliers');
}

export async function updateSupplier(id: string, data: z.infer<typeof supplierSchema>) {
  const validatedData = supplierSchema.parse(data);

  await prisma.supplier.update({
    where: { id },
    data: validatedData,
  });

  revalidatePath('/dashboard/suppliers');
}

export async function deleteSupplier(id: string) {
  await prisma.supplier.delete({
    where: { id },
  });

  revalidatePath('/dashboard/suppliers');
}
