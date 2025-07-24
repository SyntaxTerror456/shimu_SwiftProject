import type { Supplier, Request } from './types';

export const MOCK_SUPPLIERS: Supplier[] = [
  { 
    id: "SUP-001", 
    name: "Global Tech Inc.", 
    contactPerson: "Alice Johnson",
    email: "alice@globaltech.com", 
    phone: "123-456-7890",
    address: "123 Tech Park, Silicon Valley, CA", 
    country: "USA",
  },
  { 
    id: "SUP-002", 
    name: "Innovate Solutions", 
    contactPerson: "Bob Williams",
    email: "bob@innovatesol.com",
    phone: "234-567-8901",
    address: "456 Innovation Dr, Boston, MA", 
    country: "USA",
  },
  { 
    id: "SUP-003", 
    name: "Reliable Parts Co.", 
    contactPerson: "Charlie Brown",
    email: "charlie@reliableparts.com",
    phone: "345-678-9012",
    address: "789 Industrial Ave, Chicago, IL", 
    country: "USA",
  },
  { 
    id: "SUP-004", 
    name: "Advanced Materials", 
    contactPerson: "Diana Prince",
    email: "diana@advancedmat.com",
    phone: "456-789-0123",
    address: "101 Element Rd, Metropolis, NY", 
    country: "USA",
  },
  { 
    id: "SUP-005", 
    name: "NextGen Components", 
    contactPerson: "Ethan Hunt",
    email: "ethan@nextgencomp.com",
    phone: "567-890-1234",
    address: "212 Future Way, Seattle, WA", 
    country: "USA",
  },
];

export const MOCK_REQUESTS: Request[] = [
  { 
    id: "REQ-001", 
    requestNumber: "2024-00001", 
    title: "Büro-Laptop-Beschaffung", 
    status: "Gesendet", 
    createdAt: new Date("2024-07-20"), 
    validUntil: new Date("2024-08-20"),
    supplier: { 
      id: "SUP-001", 
      name: "Global Tech Inc.", 
      address: "123 Tech Park, Silicon Valley, CA", 
      country: "USA",
      contactPerson: "Alice Johnson"
    }, 
    notes: "Bitte bieten Sie auch passende Dockingstations an.",
    items: [
      { id: "ITEM-001", materialNumber: "LT-DELL-5420", designation: "14-Zoll-Laptop, Modell XYZ", description: "Spezifikationen: 16GB RAM, 512GB SSD", quantity: 10 },
      { id: "ITEM-002", materialNumber: "MS-LOGI-MX3", designation: "Kabellose Maus, Ergonomisch, schwarz", quantity: 10 },
    ] 
  },
  { 
    id: "REQ-002", 
    requestNumber: "2024-00002", 
    title: "Neue Bürostühle", 
    status: "Abgeschlossen", 
    createdAt: new Date("2024-07-18"), 
    validUntil: new Date("2024-08-18"),
    supplier: { 
      id: "SUP-003", 
      name: "Reliable Parts Co.", 
      address: "789 Industrial Ave, Chicago, IL", 
      country: "USA",
      contactPerson: "Charlie Brown"
    },
    notes: "Lieferung in der Kalenderwoche 35 gewünscht.",
    items: [
        { id: "ITEM-003", materialNumber: "BS-HERM-AER", designation: "Ergonomischer Bürostuhl", description: "Schwarze Netzrückenlehne, verstellbare Lordosenstütze", quantity: 25 }
    ] 
  },
  { 
    id: "REQ-003", 
    requestNumber: "2024-00003", 
    title: "Server-Rack-Komponenten", 
    status: "Entwurf", 
    createdAt: new Date("2024-07-22"), 
    validUntil: new Date("2024-08-22"),
    supplier: {
      id: "SUP-005", 
      name: "NextGen Components", 
      address: "212 Future Way, Seattle, WA", 
      country: "USA",
      contactPerson: "Ethan Hunt"
    }, 
    items: [
       { id: "ITEM-004", materialNumber: "PP-CAT6-24", designation: "24-Port Patchpanel, Cat6a", quantity: 2 },
       { id: "ITEM-005", materialNumber: "RS-1U-VENT", designation: "1U Rack-Regal, belüftet", quantity: 4 },
    ] 
  },
  { 
    id: "REQ-004", 
    requestNumber: "2024-00004", 
    title: "Industrieschmierstoffe", 
    status: "Storniert", 
    createdAt: new Date("2024-07-15"), 
    validUntil: new Date("2024-08-15"),
    supplier: { 
      id: "SUP-004", 
      name: "Advanced Materials", 
      address: "101 Element Rd, Metropolis, NY", 
      country: "USA",
      contactPerson: "Diana Prince"
    }, 
    items: [] 
  },
];
