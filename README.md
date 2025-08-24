# PDF Collaboration System

A modern web application for real-time PDF collaboration, built with React and Firebase.

Loom Video - https://www.loom.com/share/d3fce55d932b4355aa2e761b74d79ad4?sid=be1b7144-b7f8-4e4d-82f9-ecdea6bf82d9 

## Features

- Real-time PDF viewing and collaboration
- Firebase integration for authentication and data storage
- Modern UI with Tailwind CSS
- Responsive design for all devices

## Tech Stack

- **Frontend Framework:** React 19
- **Build Tool:** Vite
- **Styling:** Tailwind CSS
- **Backend:** Firebase
- **PDF Handling:** react-pdf
- **Routing:** React Router DOM
- **Code Quality:** ESLint, Prettier

## Prerequisites

- Node.js (version specified in .nvmrc)
- npm or yarn
- Firebase account and project setup

## Installation

1. Clone the repository:
```bash
git clone [your-repository-url]
cd pdf-collab-system
```

2. Install dependencies:
```bash
npm install
```

3. Set up Firebase:
   - Create a Firebase project
   - Enable Authentication and Firestore
   - Add your Firebase configuration to `firebase.js`

4. Start the development server:
```bash
npm run dev
```

## Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `npm run lint` - Run ESLint
- `npm run format` - Format code with Prettier

## Project Structure

```
pdf-collab-system/
├── src/
│   ├── assets/        # Static assets
│   ├── components/    # React components
│   ├── App.jsx        # Main application component
│   └── main.jsx       # Application entry point
├── public/            # Public assets
└── ...config files
```

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the LICENSE file for details.
