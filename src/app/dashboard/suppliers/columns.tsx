"use client";

import { ColumnDef } from "@tanstack/react-table";
import { MoreHorizontal, ArrowUpDown } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";

import type { Supplier } from "@/lib/types";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import Link from "next/link";
import { useToast } from "@/hooks/use-toast";
import { useTransition } from "react";


export const columns: ColumnDef<Supplier>[] = [
  {
    id: "select",
    header: ({ table }) => (
      <Checkbox
        checked={
          table.getIsAllPageRowsSelected() ||
          (table.getIsSomePageRowsSelected() && "indeterminate")
        }
        onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
        aria-label="Alle auswählen"
      />
    ),
    cell: ({ row }) => (
      <Checkbox
        checked={row.getIsSelected()}
        onCheckedChange={(value) => row.toggleSelected(!!value)}
        aria-label="Zeile auswählen"
      />
    ),
    enableSorting: false,
    enableHiding: false,
  },
  {
    accessorKey: "name",
    header: ({ column }) => (
      <Button
        variant="ghost"
        onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
      >
        Firmenname
        <ArrowUpDown className="ml-2 h-4 w-4" />
      </Button>
    ),
    cell: ({ row }) => {
      const supplier = row.original;
      return (
        <Link href={`/dashboard/suppliers/${supplier.id}`} className="font-medium text-primary hover:underline">
          {row.getValue("name")}
        </Link>
      )
    },
  },
  {
    accessorKey: "contactPerson",
    header: "Ansprechpartner",
  },
  {
    accessorKey: "email",
    header: "Email",
  },
  {
    accessorKey: "country",
    header: "Land",
  },
  {
    id: "actions",
    cell: ({ row, table }) => {
      const supplier = row.original;
      const meta = table.options.meta as {
        deleteSupplier: (id: string) => Promise<void>;
      };
      const { toast } = useToast();
      const [isPending, startTransition] = useTransition();

      const handleDelete = () => {
        if (!supplier || !meta.deleteSupplier) return;
        startTransition(async () => {
          await meta.deleteSupplier(supplier.id);
          toast({
            title: "Lieferant gelöscht",
            description: `Der Lieferant "${supplier.name}" wurde gelöscht.`,
            variant: "destructive"
          });
        });
      }

      return (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="h-8 w-8 p-0">
              <span className="sr-only">Menü öffnen</span>
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
              <DropdownMenuLabel>Aktionen</DropdownMenuLabel>
              <DropdownMenuItem asChild>
                  <Link href={`/dashboard/suppliers/${supplier.id}`}>Details anzeigen</Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <Link href={`/dashboard/suppliers/edit/${supplier.id}`}>Bearbeiten</Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                  <Link href={`/dashboard/requests/new?supplierId=${supplier.id}`}>Anfrage erstellen</Link>
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem className="text-red-600" onSelect={handleDelete} disabled={isPending}>Löschen</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      );
    },
  },
];