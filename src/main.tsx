
import { createRoot } from 'react-dom/client'
import App from './App.tsx'
import './index.css'

// For WordPress integration, look for specific container ID
const rootElement = document.getElementById("budget-tracker-root") || document.getElementById("root");

if (rootElement) {
  createRoot(rootElement).render(<App />);
  console.log("Budget Tracker initialized in container:", rootElement.id);
} else {
  console.error("Root element not found. Make sure there's a div with id 'budget-tracker-root' in your WordPress page.");
}
