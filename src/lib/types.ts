export interface Contact {
  id: string;
  name: string;
  email: string;
  phone: string;
}

export interface Supplier {
  id: string;
  name: string;
  contactPerson: string;
  email: string;
  phone: string;
  address: string;
  country: string;
}

export interface RequestItem {
  id: string;
  materialNumber: string;
  designation: string;
  description?: string;
  quantity: number;
}

export type RequestStatus = 'Entwurf' | 'Gesendet' | 'Abgeschlossen' | 'Storniert';

export interface Request {
  id: string;
  title: string;
  requestNumber: string;
  status: RequestStatus;
  createdAt: Date;
  supplier: {
    id: string;
    name: string;
    address: string;
    country: string;
    contactPerson: string; // The specific contact for this request
    email?: string;
    phone?: string;
  };
  items: RequestItem[];
  notes?: string;
  validUntil?: Date;
  contactPerson?: { // Our company's contact person
    firstName: string;
    lastName: string;
    email: string;
    phone: string;
  };
}
