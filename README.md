# Swiss-GlobalTech GmbH - Anfragenverwaltung

Dies ist eine mit Firebase Studio erstellte Anwendung zur Verwaltung von Lieferantenanfragen. Dieses Dokument führt Sie durch die Einrichtung des Projekts in Ihrer lokalen Entwicklungsumgebung wie Visual Studio Code.

## Technologie-Stack

*   **Framework**: [Next.js](https://nextjs.org/) (mit App Router)
*   **UI-Bibliothek**: [React](https://react.dev/)
*   **Sprache**: [TypeScript](https://www.typescriptlang.org/)
*   **Styling**: [Tailwind CSS](https://tailwindcss.com/)
*   **UI-Komponenten**: [ShadCN UI](https://ui.shadcn.com/)
*   **AI-Funktionen**: [Genkit](https://firebase.google.com/docs/genkit)

## Voraussetzungen

Stellen Sie sicher, dass die folgenden Programme auf Ihrem System installiert sind:
*   [Node.js](https://nodejs.org/en/) (Version 20 oder höher empfohlen)
*   [npm](https://www.npmjs.com/) (wird mit Node.js geliefert) oder ein anderer Paketmanager wie [yarn](https://yarnpkg.com/) oder [pnpm](https://pnpm.io/).

## Einrichtung in VS Code

Folgen Sie diesen Schritten, um das Projekt lokal zum Laufen zu bringen:

1.  **Dateien kopieren**: Erstellen Sie einen neuen Ordner auf Ihrem Computer für dieses Projekt. Kopieren Sie alle Projektdateien und -ordner (wie `src`, `public`, `package.json` usw.) in diesen neuen Ordner.

2.  **Terminal öffnen**: Öffnen Sie ein Terminal in Visual Studio Code (`Ansicht` -> `Terminal` oder `Strg+``).

3.  **Abhängigkeiten installieren**: Führen Sie den folgenden Befehl im Terminal aus, um alle notwendigen Pakete herunterzuladen, die in `package.json` aufgeführt sind:
    ```bash
    npm install
    ```

4.  **Entwicklungsserver starten**: Sobald die Installation abgeschlossen ist, starten Sie den lokalen Entwicklungsserver:
    ```bash
    npm run dev
    ```

5.  **Anwendung öffnen**: Öffnen Sie Ihren Webbrowser und navigieren Sie zu [http://localhost:9002](http://localhost:9002). Sie sollten nun die laufende Anwendung sehen.

## Wichtige Skripte

*   `npm run dev`: Startet die Anwendung im Entwicklungsmodus.
*   `npm run build`: Erstellt eine optimierte Version der Anwendung für die Produktion.
*   `npm run start`: Startet die Produktionsversion (nachdem `build` ausgeführt wurde).
*   `npm run lint`: Überprüft den Code auf Stil- und Syntaxfehler.

## Projektstruktur

Hier ist ein kurzer Überblick über die wichtigsten Ordner:

*   **/src/app**: Enthält die Hauptseiten und Layouts der Anwendung (App Router).
*   **/src/components**: Beinhaltet wiederverwendbare React-Komponenten, einschließlich der UI-Komponenten von ShadCN.
*   **/src/lib**: Hilfsfunktionen, Typdefinitionen (`types.ts`) und Testdaten (`mock-data.ts`).
*   **/src/hooks**: Benutzerdefinierte React-Hooks, z.B. für die Authentifizierung (`use-auth.tsx`).
*   **/src/ai**: Code für die KI-Funktionen mit Genkit.
*   **public/**: Statische Dateien wie Bilder oder Schriftarten.
*   **package.json**: Definiert die Projektabhängigkeiten und verfügbare Skripte.
