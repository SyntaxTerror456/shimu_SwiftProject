
"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { format } from "date-fns";
import { de } from "date-fns/locale";
import html2canvas from "html2canvas";
import jsPDF from "jspdf";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useRef, useState, useCallback } from "react";
import { FormProvider, useFieldArray, useForm } from "react-hook-form";
import * as z from "zod";

// --- Firebase Imports ---
import { collection, getDocs } from "firebase/firestore"; // ADDED THIS LINE
import { db } from "@/lib/firebaseConfig"; // Your local firebase instance

// --- UI Components ---
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";

// --- Hooks & Types ---
import { useAuth } from "@/hooks/use-auth";
import { useToast } from "@/hooks/use-toast";
import type { Request, RequestItem, Supplier } from "@/lib/types";
import { cn } from "@/lib/utils";

// --- Icons & Other Components ---
import { CalendarIcon, Minus, Plus } from "lucide-react";
import { RequestView } from "../[id]/request-view";

// --- Server Actions ---
import { addRequest, updateRequest } from "../actions";

// --- Zod Schemas ---
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
  contactEmail: z
    .string()
    .email("Ungültige E-Mail-Adresse.")
    .optional()
    .or(z.literal("")),
  contactPhone: z.string().optional(),

  supplierId: z.string().optional(),

  requestDate: z.date().optional(),
  validUntil: z.date().optional(),

  items: z.array(requestItemSchema).optional(),
  notes: z.string().optional(),
});

type RequestWizardValues = z.infer<typeof requestWizardSchema>;

interface RequestWizardProps {
  existingRequest?: Request | null;
}

export function RequestWizard({ existingRequest }: RequestWizardProps) {
  const { toast } = useToast();
  const router = useRouter();
  const searchParams = useSearchParams();
  const { user } = useAuth();
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [requestToPrint, setRequestToPrint] = useState<Request | null>(null);
  const [isPrinting, setIsPrinting] = useState(false);
  const printComponentRef = useRef<HTMLDivElement>(null);

  const isEditMode = !!existingRequest;

  useEffect(() => {
    const fetchSuppliers = async () => {
      try {
        // 'getDocs' and 'collection' are now correctly imported
        const querySnapshot = await getDocs(collection(db, "suppliers"));
        const fetchedSuppliers: Supplier[] = querySnapshot.docs.map((doc) => {
          const data = doc.data();
          return {
            ...(data as Supplier),
            id: doc.id,
            name: (data.name as string) || "Unbekannter Lieferant",
          };
        });
        setSuppliers(fetchedSuppliers);
      } catch (error) {
        console.error("Error fetching suppliers:", error);
        toast({
          title: "Error",
          description: "Failed to load suppliers.",
          variant: "destructive",
        });
      }
    };
    fetchSuppliers();
  }, [toast]);

  const methods = useForm<RequestWizardValues>({
    resolver: zodResolver(requestWizardSchema),
    defaultValues: {
      contactFirstName: "",
      contactLastName: "",
      contactEmail: user?.email || "",
      contactPhone: "",
      supplierId: "",
      requestDate: new Date(),
      items: [
        { materialNumber: "", designation: "", description: "", quantity: 1 },
      ],
      notes: "",
    },
  });

  const { control, handleSubmit, watch, setValue, getValues, reset } = methods;

  const selectedSupplierId = watch("supplierId");
  const selectedSupplier = suppliers.find((s) => s.id === selectedSupplierId);

  useEffect(() => {
    if (isEditMode && existingRequest) {
      console.log("Edit mode: existingRequest", existingRequest);
      const defaultValues: Partial<RequestWizardValues> = {
        contactFirstName: existingRequest.contactPerson?.firstName,
        contactLastName: existingRequest.contactPerson?.lastName,
        contactEmail: existingRequest.contactPerson?.email,
        contactPhone: existingRequest.contactPerson?.phone,

        supplierId: existingRequest.supplier?.id || "",

        requestDate: new Date(existingRequest.createdAt),
        validUntil: existingRequest.validUntil
          ? new Date(existingRequest.validUntil)
          : undefined,

        items:
          existingRequest.items.length > 0
            ? existingRequest.items.map((item) => ({
                ...item,
                materialNumber:
                  item.materialNumber || (item as any).articleNumber,
              }))
            : [
                {
                  materialNumber: "",
                  designation: "",
                  description: "",
                  quantity: 1,
                },
              ],
        notes: existingRequest.notes,
      };
      console.log("Default values for form:", defaultValues);
      reset(defaultValues as any);
      console.log(
        "Form supplierId after reset:",
        methods.getValues("supplierId"),
      );
    }
  }, [isEditMode, existingRequest, reset, methods]);

  useEffect(() => {
    const prefillSupplierId = searchParams.get("supplierId");
    if (prefillSupplierId && suppliers.length > 0) {
      const foundSupplier = suppliers.find((s) => s.id === prefillSupplierId);
      if (foundSupplier) {
        setValue("supplierId", prefillSupplierId);
      }
    }
  }, [searchParams, suppliers, setValue]);

  const { fields, append, remove } = useFieldArray({
    control,
    name: "items",
  });

  const onSubmit = async (data: RequestWizardValues) => {
    const supplier = data.supplierId
      ? suppliers.find((s) => s.id === data.supplierId)
      : undefined;

    if (data.supplierId && !supplier) {
      toast({
        title: "Fehler",
        description: "Ausgewählter Lieferant nicht gefunden.",
        variant: "destructive",
      });
      return;
    }

    try {
      if (isEditMode && existingRequest) {
        await updateRequest(existingRequest.id, data, supplier || null);
      } else {
        await addRequest(data, supplier || null);
      }
      toast({
        title: "Anfrage gespeichert!",
        description:
          "Ihre neue Anfrage wurde erfolgreich als Entwurf gespeichert.",
      });
      router.push("/dashboard/requests");
    } catch (error) {
      console.error("Error saving request:", error);
      toast({
        title: "Error",
        description: "Failed to save request.",
        variant: "destructive",
      });
    }
  };

  // Memoize handleGeneratePdf to prevent unnecessary re-renders
  const handleGeneratePdf = useCallback(() => {
    const data = getValues();
    const supplier = data.supplierId
      ? suppliers.find((s) => s.id === data.supplierId)
      : undefined;

    if (data.supplierId && !supplier) {
      toast({
        title: "Fehler",
        description: "Bitte wählen Sie einen gültigen Lieferanten für die PDF.",
        variant: "destructive",
      });
      return;
    }

    const previewRequest: Request = {
      id: `REQ-PREVIEW-${Date.now()}`,
      requestNumber:
        isEditMode && existingRequest
          ? existingRequest.requestNumber
          : "ANFRAGE-VORSCHAU",
      title: `Anfrage für ${supplier?.name || "Unbekannter Lieferant"}`,
      status: "Entwurf",
      createdAt: data.requestDate || new Date(),
      validUntil: data.validUntil,
      contactPerson: {
        firstName: data.contactFirstName || "",
        lastName: data.contactLastName || "",
        email: data.contactEmail || "",
        phone: data.contactPhone || "",
      },
      supplier: supplier || null,
      items: (data.items || []).map(
        (item, index): RequestItem => ({
          id: `ITEM-PREVIEW-${Date.now()}-${index}`,
          materialNumber: item.materialNumber || "",
          designation: item.designation || "N/A",
          description: item.description || "",
          quantity: item.quantity ?? 0,
        }),
      ),
      notes: data.notes || "",
    };

    setRequestToPrint(previewRequest);
    setIsPrinting(true); // Indicate that printing process has started
  }, [getValues, suppliers, toast, isEditMode, existingRequest]);

  useEffect(() => {
    if (!isPrinting || !requestToPrint) return; // Only run if printing is initiated and request data is ready

    const input = printComponentRef.current;
    if (input) {
      toast({
        title: "PDF wird erstellt...",
        description: "Bitte warten Sie einen Moment.",
      });

      // Using requestAnimationFrame to ensure the DOM is fully stable
      // and rendered before html2canvas starts its work.
      const animationFrameId = requestAnimationFrame(() => {
        html2canvas(input, { scale: 2 })
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

            pdf.save(`anfrage-vorschau.pdf`);
            toast({
              title: "PDF heruntergeladen!",
              description: "Ihre Datei ist bereit.",
            });
          })
          .catch((error) => {
            console.error("Error generating PDF:", error);
            toast({
              title: "Fehler",
              description: "PDF-Generierung fehlgeschlagen.",
              variant: "destructive",
            });
          })
          .finally(() => {
            // IMPORTANT: Reset states only AFTER html2canvas and jsPDF are completely done
            setIsPrinting(false);
            setRequestToPrint(null);
          });
      });

      // Cleanup function for useEffect
      return () => cancelAnimationFrame(animationFrameId);
    }
  }, [isPrinting, requestToPrint, toast]); // Dependencies: isPrinting and requestToPrint

  return (
    <>
      <FormProvider {...methods}>
        <form onSubmit={handleSubmit(onSubmit)} className="w-full max-w-4xl space-y-8">
          <Card className="w-full shadow-lg">
            <CardHeader>
              <CardTitle>Ihre Kontaktperson</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={control}
                  name="contactFirstName"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Vorname</FormLabel>
                      <FormControl>
                        <Input placeholder="Max" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={control}
                  name="contactLastName"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Nachname</FormLabel>
                      <FormControl>
                        <Input placeholder="Mustermann" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={control}
                  name="contactEmail"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>E-Mail</FormLabel>
                      <FormControl>
                        <Input
                          type="email"
                          placeholder="max.mustermann@firma.ch"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={control}
                  name="contactPhone"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Telefonnummer</FormLabel>
                      <FormControl>
                        <Input placeholder="+41 12 345 67 89" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </CardContent>
          </Card>

          <Card className="w-full shadow-lg">
            <CardHeader>
              <CardTitle>Lieferanteninformationen</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <FormField
                  control={control}
                  name="supplierId"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Lieferant auswählen</FormLabel>
                      <Select
                        onValueChange={field.onChange}
                        value={field.value}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="— Bitte wählen —" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {suppliers.map((s) => (
                            <SelectItem key={s.id} value={s.id}>
                              {s.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <div>
                  {selectedSupplier && (
                    <div className="text-sm text-muted-foreground pt-8 space-y-1">
                      <p className="font-medium">
                        {selectedSupplier.contactPerson || "N/A"}
                      </p>
                      <p>{selectedSupplier.email || "N/A"}</p>
                      <p>{selectedSupplier.phone || "N/A"}</p>
                    </div>
                  )}
                </div>
                <FormField
                  control={control}
                  name="requestDate"
                  render={({ field }) => (
                    <FormItem className="flex flex-col">
                      <FormLabel>Anfrage Datum</FormLabel>
                      <Popover>
                        <PopoverTrigger asChild>
                          <FormControl>
                            <Button
                              variant={"outline"}
                              className={cn(
                                "pl-3 text-left font-normal",
                                !field.value && "text-muted-foreground",
                              )}
                            >
                              {field.value ? (
                                format(field.value, "PPP", { locale: de })
                              ) : (
                                <span>TT.mm.jjjj</span>
                              )}
                              <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                            </Button>
                          </FormControl>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0" align="start">
                          <Calendar
                            mode="single"
                            selected={field.value}
                            onSelect={field.onChange}
                            initialFocus
                          />
                        </PopoverContent>
                      </Popover>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={control}
                  name="validUntil"
                  render={({ field }) => (
                    <FormItem className="flex flex-col">
                      <FormLabel>Angebotsfrist</FormLabel>
                      <Popover>
                        <PopoverTrigger asChild>
                          <FormControl>
                            <Button
                              variant={"outline"}
                              className={cn(
                                "pl-3 text-left font-normal",
                                !field.value && "text-muted-foreground",
                              )}
                            >
                              {field.value ? (
                                format(field.value, "PPP", { locale: de })
                              ) : (
                                <span>TT.mm.jjjj</span>
                              )}
                              <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                            </Button>
                          </FormControl>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0" align="start">
                          <Calendar
                            mode="single"
                            selected={field.value}
                            onSelect={field.onChange}
                            initialFocus
                          />
                        </PopoverContent>
                      </Popover>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </CardContent>
          </Card>

          <Card className="w-full shadow-lg">
            <CardHeader>
              <CardTitle>Positionen</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-4">
                {fields.map((item, index) => (
                  <div
                    key={item.id}
                    className="grid grid-cols-12 gap-x-4 gap-y-2 items-end p-3 border rounded-md"
                  >
                    <div className="col-span-12 sm:col-span-1">
                      <Label>Pos</Label>
                      <Input readOnly value={index + 1} className="bg-muted" />
                    </div>
                    <div className="col-span-12 sm:col-span-3">
                      <FormField
                        control={control}
                        name={`items.${index}.materialNumber`}
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Material-Nr.</FormLabel>
                            <FormControl>
                              <Input placeholder="XYZ-123" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                    <div className="col-span-12 sm:col-span-4">
                      <FormField
                        control={control}
                        name={`items.${index}.designation`}
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Bezeichnung</FormLabel>
                            <FormControl>
                              <Input
                                placeholder="z.B. Laptop, Bürostuhl, etc."
                                {...field}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                    <div className="col-span-12 sm:col-span-3">
                      <FormField
                        control={control}
                        name={`items.${index}.quantity`}
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Menge</FormLabel>
                            <FormControl>
                              <Input type="number" placeholder="1" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                    <div className="col-span-12 sm:col-span-1">
                      <Button
                        type="button"
                        variant="destructive"
                        size="icon"
                        onClick={() => remove(index)}
                        disabled={fields.length <= 1}
                      >
                        <Minus className="h-4 w-4" />
                      </Button>
                    </div>
                    <div className="col-span-12 self-start">
                      <FormField
                        control={control}
                        name={`items.${index}.description`}
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="font-normal text-muted-foreground">
                              Zusätzliche Beschreibung (optional)
                            </FormLabel>
                            <FormControl>
                              <Textarea
                                placeholder="Weitere Details zum Material, Spezifikationen etc."
                                rows={2}
                                {...field}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                  </div>
                ))}
              </div>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() =>
                  append({
                    materialNumber: "",
                    designation: "",
                    description: "",
                    quantity: 1,
                  })
                }
              >
                <Plus className="mr-2 h-4 w-4" />
                Position hinzufügen
              </Button>
            </CardContent>
          </Card>

          <Card className="w-full shadow-lg">
            <CardHeader>
              <CardTitle>Anmerkungen</CardTitle>
            </CardHeader>
            <CardContent>
              <FormField
                control={control}
                name="notes"
                render={({ field }) => (
                  <FormItem>
                    <FormControl>
                      <Textarea
                        placeholder="Hier können Sie allgemeine Anmerkungen zur Anfrage hinzufügen..."
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </CardContent>
          </Card>

          <div className="flex justify-end gap-4">
            <Button type="submit" size="lg">
              {isEditMode ? "Änderungen speichern" : "Anfrage speichern"}
            </Button>
            <Button
              type="button"
              variant="outline"
              size="lg"
              onClick={handleGeneratePdf}
              disabled={isPrinting}
            >
              {isPrinting ? "PDF wird generiert..." : "PDF generieren"}
            </Button>
          </div>
        </form>
      </FormProvider>
      <div className="absolute left-[-9999px] top-[-9999px]">
        {/* Only render RequestView if we have data and we are in the printing process */}
        {isPrinting && requestToPrint && (
          <div ref={printComponentRef}>
            <RequestView request={requestToPrint} />
          </div>
        )}
      </div>
    </>
  );
}