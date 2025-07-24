"use client";

import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";

import type { Supplier } from "@/lib/types";

const supplierSchema = z.object({
  name: z.string().min(2, { message: "Firmenname muss mindestens 2 Zeichen lang sein." }),
  contactPerson: z.string().min(2, { message: "Name muss mindestens 2 Zeichen lang sein." }),
  email: z.string().email({ message: "Bitte geben Sie eine gültige E-Mail-Adresse ein." }),
  phone: z.string().min(10, { message: "Telefonnummer muss mindestens 10 Ziffern haben." }),
  address: z.string().min(5, { message: "Adresse muss mindestens 5 Zeichen lang sein." }),
  country: z.string().min(2, { message: "Land muss mindestens 2 Zeichen lang sein." }),
});

export type SupplierFormValues = z.infer<typeof supplierSchema>;

interface SupplierDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: SupplierFormValues, id?: string) => void;
  supplier: Supplier | null;
}

export function SupplierDialog({ isOpen, onClose, onSave, supplier }: SupplierDialogProps) {
  const [isPending, setIsPending] = useState(false);
  const [formKey, setFormKey] = useState(() => Math.random().toString());

  const form = useForm<SupplierFormValues>({
    resolver: zodResolver(supplierSchema),
    defaultValues: supplier || {
      name: "",
      contactPerson: "",
      email: "",
      phone: "",
      address: "",
      country: "",
    },
  });

  useEffect(() => {
    if (isOpen) {
      setFormKey(Math.random().toString());
      form.reset(supplier || {
        name: "",
        contactPerson: "",
        email: "",
        phone: "",
        address: "",
        country: "",
      });
    }
  }, [isOpen, supplier, form]);

  const handleSubmit = async (data: SupplierFormValues) => {
    setIsPending(true);
    try {
      onSave(data, supplier?.id);
    } catch (error) {
      console.error("Failed to save supplier", error);
    } finally {
      setIsPending(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle>{supplier ? "Lieferant bearbeiten" : "Neuen Lieferant anlegen"}</DialogTitle>
          <DialogDescription>
            {supplier
              ? `Aktualisieren Sie die Details für ${supplier.name}.`
              : "Füllen Sie das Formular aus, um einen neuen Lieferanten zu erstellen."}
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form key={formKey} onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4 pt-4">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Firmenname</FormLabel>
                  <FormControl>
                    <Input placeholder="Global Tech Inc." {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="contactPerson"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Ansprechpartner</FormLabel>
                    <FormControl>
                      <Input placeholder="Alice Johnson" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
               <FormField
                control={form.control}
                name="phone"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Telefonnummer</FormLabel>
                    <FormControl>
                      <Input placeholder="123-456-7890" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            
            <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                    <FormItem>
                    <FormLabel>Email</FormLabel>
                    <FormControl>
                        <Input placeholder="contact@globaltech.com" {...field} />
                    </FormControl>
                    <FormMessage />
                    </FormItem>
                )}
                />

            <FormField
              control={form.control}
              name="address"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Adresse</FormLabel>
                  <FormControl>
                    <Textarea placeholder="Strasse, PLZ Ort" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="country"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Land</FormLabel>
                  <FormControl>
                    <Input placeholder="Schweiz" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <div className="flex justify-end gap-2 pt-4">
              <Button type="button" variant="secondary" onClick={onClose} disabled={isPending}>
                Abbrechen
              </Button>
              <Button type="submit" disabled={isPending}>
                Speichern
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
