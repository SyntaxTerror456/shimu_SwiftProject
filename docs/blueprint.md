# **App Name**: RequestEase

## Core Features:

- Supplier Management: Manage suppliers (CRUD operations) using a reactive form component, connected to Firestore.
- Request Creation: Create new requests for quotations from suppliers. Display them with Angular components, save in Firestore.
- Authentication & Security: Enable role-based access (admin vs. normal user) via Firebase Authentication, protected by Firestore Security Rules.
- PDF Generation: Generate PDF documents from request data using jsPDF/pdfmake, including the company logo.
- Wizard Form: Generate a multi-step wizard form to guide users through the request creation process.

## Style Guidelines:

- Primary color: Deep Red (#B53F51) to convey trust and reliability in business operations.
- Background color: White (#FFFFFF) to ensure a clean and professional look.
- Accent color: Light Blue (#ADD8E6) to highlight key actions and elements, providing a fresh contrast.
- Body and headline font: 'Inter', a grotesque-style sans-serif font for a clean and modern interface.
- Use clear, professional icons from a standard library like FontAwesome or Material Icons.
- Implement a clean, responsive layout optimized for desktop and mobile devices, ensuring usability across all screen sizes.
- Subtle animations to give feedback to user interactions (e.g. button presses, form validation). Don't distract from the usability of the app.