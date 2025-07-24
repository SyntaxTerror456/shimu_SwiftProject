"use client";

import { ColumnDef } from "@tanstack/react-table";
import { MoreHorizontal, ArrowUpDown } from "lucide-react";
import Link from "next/link";
import { format } from "date-fns";
import { de } from "date-fns/locale";

import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";

import type { Request, RequestStatus } from "@/lib/types";

const statusVariantMap: Record<RequestStatus, "default" | "secondary" | "destructive" | "outline"> = {
    'Entwurf': 'secondary',
    'Gesendet': 'default',
    'Abgeschlossen': 'outline',
    'Storniert': 'destructive',
}

export const columns: ColumnDef<Request>[] = [
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
    accessorKey: "requestNumber",
    header: "Anfrage-Nr.",
    cell: ({ row }) => {
        const request = row.original;
        return (
            <Link href={`/dashboard/requests/${request.id}`} className="font-medium text-primary hover:underline">
                {request.requestNumber}
            </Link>
        )
    }
  },
  {
    accessorKey: "title",
    header: ({ column }) => (
      <Button
        variant="ghost"
        onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
      >
        Titel
        <ArrowUpDown className="ml-2 h-4 w-4" />
      </Button>
    ),
    cell: ({ row }) => <div className="font-medium">{row.getValue("title")}</div>,
  },
  {
    accessorKey: "supplier.name",
    header: "Lieferant",
  },
  {
    accessorKey: "status",
    header: "Status",
    cell: ({ row }) => {
        const status = row.getValue("status") as RequestStatus;
        return <Badge variant={statusVariantMap[status]}>{status}</Badge>
    }
  },
  {
    accessorKey: "createdAt",
    header: "Erstellt am",
    cell: ({ row }) => {
        return format(new Date(row.getValue("createdAt")), "PPP", { locale: de });
    }
  },
  {
    id: "actions",
    cell: ({ row, table }) => {
      const request = row.original;
      const meta = table.options.meta as {
        deleteRequest: (requestId: string) => void;
        updateRequestStatus: (requestId: string, status: RequestStatus) => void;
        downloadPdf: (request: Request) => void;
      };

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
                <Link href={`/dashboard/requests/${request.id}`}>Details anzeigen</Link>
            </DropdownMenuItem>
            <DropdownMenuItem asChild>
                <Link href={`/dashboard/requests/edit/${request.id}`}>Bearbeiten</Link>
            </DropdownMenuItem>
            <DropdownMenuItem onSelect={() => meta.downloadPdf(request)}>
                PDF herunterladen
            </DropdownMenuItem>
            {request.status === 'Entwurf' && (
                <DropdownMenuItem onSelect={() => meta.updateRequestStatus(request.id, 'Gesendet')}>
                    Als gesendet markieren
                </DropdownMenuItem>
            )}
            {request.status === 'Gesendet' && (
                <DropdownMenuItem onSelect={() => meta.updateRequestStatus(request.id, 'Abgeschlossen')}>
                    Als abgeschlossen markieren
                </DropdownMenuItem>
            )}
            <DropdownMenuSeparator />
            <DropdownMenuItem 
              className="text-red-600"
              onSelect={() => meta.deleteRequest(request.id)}
            >
              Löschen
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      );
    },
  },
];
