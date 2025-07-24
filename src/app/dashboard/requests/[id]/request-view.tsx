import { Request } from "@/lib/types";
import { format, isValid } from "date-fns";
import { de } from "date-fns/locale";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Logo } from "@/components/logo";

interface RequestViewProps {
  request: Request;
}

export function RequestView({ request }: RequestViewProps) {
  console.log("RequestView received request:", request);
  console.log("RequestView createdAt:", request.createdAt);
  console.log("RequestView validUntil:", request.validUntil);
  const contactPersonFullName = request.contactPerson 
    ? `${request.contactPerson.firstName} ${request.contactPerson.lastName}`.trim()
    : '[Ansprechpartner nicht angegeben]';
  
  return (
    <div id="pdf-content" className="p-10 bg-white text-black font-sans text-sm">
      
      <header className="flex justify-between items-start mb-12">
        <div className="text-left ">
          {/* <Logo className="h-full w-full mr-48 mb-2" /> */}
           <div className="mt-4 " style={{ width: '180px', height: '90px' }}> {/* Increased size */}
      <Logo className="h-full mr-12  -mt-10" />
    </div>
          <h1 className="font-semibold text-xl mt-4 ">Swiss-GlobalTech GmbH</h1>
          <p>Rheinsichtweg 8, 8274 Tägerwilen, Schweiz</p>
        </div>
        <div className="text-right">
           <h2 className="font-bold text-base">Angebotsanfrage</h2>
        </div>
      </header>

      <section className="grid grid-cols-2 items-start gap-12 mb-8">
        {/* Left column: Our Company and Contact Person */}
        <div className="text-sm">
            <p className="font-bold text-gray-500 text-xs uppercase tracking-wider mb-2">Von</p>
            <p className="font-bold">Swiss-GlobalTech GmbH</p>
            <p>Rheinsichtweg 8</p>
            <p>8274 Tägerwilen</p>
            <p>Schweiz</p>
            <br/>
            {contactPersonFullName !== '[Ansprechpartner nicht angegeben]' && (
              <>
                <p className="font-bold">Ansprechpartner</p>
                <p>{contactPersonFullName}</p>
                {request.contactPerson && request.contactPerson.email && <p>{request.contactPerson.email}</p>}
                {request.contactPerson && request.contactPerson.phone && <p>{request.contactPerson.phone}</p>}
              </>
            )}
        </div>
        {/* Right column: Supplier */}
        <div className="text-sm">
            <p className="font-bold text-gray-500 text-xs uppercase tracking-wider mb-2">An</p>
            <p className="font-bold">{request.supplier.name}</p>
            {request.supplier.contactPerson && <p>{request.supplier.contactPerson}</p>}
            <p className="whitespace-pre-wrap">{request.supplier.address}</p>
            {request.supplier.country &&<p>{request.supplier.country}</p>}
        </div>
      </section>

      <section className="flex justify-between items-center my-10 text-sm">
          <p>
              <span className="font-semibold">Anfrage-Nr.:</span> {request.requestNumber}
          </p>
          <p>
              <span className="font-semibold">Datum:</span> {isValid(request.createdAt) ? format(request.createdAt, "dd. MMMM yyyy", { locale: de }) : "Invalid Date"}
              <span className="font-semibold">Anfrage Datum:</span> {format(request.createdAt, "dd. MMMM yyyy", { locale: de })}
          </p>
      </section>

      <main>
          <h3 className="font-bold text-base mb-4">Anfrage für die Lieferung von Waren / Dienstleistungen</h3>
          <p className="mb-6">Sehr geehrte Damen und Herren,</p>
          <p className="mb-6">im Namen der Swiss-GlobalTech GmbH bitten wir Sie um ein Angebot für die folgenden Positionen. Bitte geben Sie Ihre Preise und Lieferzeiten an. Die Angebotsfrist ist der <span className="font-bold">{
            request.validUntil 
              ? (isValid(request.validUntil) ? format(request.validUntil, "dd. MMMM yyyy", { locale: de }) : "Invalid Date")
              : 'N/A'
          }</span>.</p>
          
          <Table className="text-black">
              <TableHeader>
                  <TableRow className="bg-gray-50 hover:bg-gray-50 border-b-2 border-t border-gray-300">
                      <TableHead className="w-[50px] text-black font-semibold">Pos</TableHead>
                      <TableHead className="w-[150px] text-black font-semibold">Material-Nr.</TableHead>
                      <TableHead className="text-black font-semibold">Bezeichnung</TableHead>
                      <TableHead className="text-right w-[100px] text-black font-semibold">Menge</TableHead>
                  </TableRow>
              </TableHeader>
              <TableBody>
                  {request.items.map((item, index) => (
                      <TableRow key={item.id} className="border-b border-gray-200 last:border-b-0">
                          <TableCell className="font-medium align-top py-3">{index + 1}</TableCell>
                          <TableCell className="align-top py-3">{item.materialNumber || '-'}</TableCell>
                          <TableCell className="text-gray-800 align-top py-3 whitespace-pre-wrap">
                            {item.designation}
                            {item.description && <p className="text-xs text-gray-600 mt-1 whitespace-pre-wrap">{item.description}</p>}
                          </TableCell>
                          <TableCell className="text-right align-top py-3">{item.quantity}</TableCell>
                      </TableRow>
                  ))}
              </TableBody>
          </Table>
          
          {request.notes && (
              <section className="mt-8">
                  <h3 className="text-base font-semibold mb-2">Anmerkungen</h3>
                  <div className="text-sm text-gray-700 whitespace-pre-wrap border-t border-gray-300 pt-4">
                      {request.notes}
                  </div>
              </section>
          )}
      </main>

      <footer className="mt-16 pt-8 border-t border-gray-300 text-sm">
        <p>Wir freuen uns auf Ihr Angebot und verbleiben</p>
        <p className="mt-4">mit freundlichen Grüssen</p>
        <p className="mt-8 font-semibold">{contactPersonFullName !== '[Ansprechpartner nicht angegeben]' ? contactPersonFullName : 'Swiss-GlobalTech GmbH'}</p>
        {contactPersonFullName !== '[Ansprechpartner nicht angegeben]' && <p className="mt-0">Swiss-GlobalTech GmbH</p>}
      </footer>
    </div>
  );
}
