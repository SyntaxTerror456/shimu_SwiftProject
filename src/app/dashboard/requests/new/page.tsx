import { RequestWizard } from "./request-wizard";

export default function NewRequestPage() {
  return (
    <div className="flex flex-1 flex-col gap-4">
      <div>
        <h1 className="text-2xl font-semibold md:text-3xl">Neue Anfrage erstellen</h1>
        <p className="text-muted-foreground">
          Füllen Sie das untenstehende Formular aus, um eine neue Angebotsanfrage zu erstellen.
        </p>
      </div>
      <div className="flex justify-center py-8">
        <RequestWizard />
      </div>
    </div>
  );
}
