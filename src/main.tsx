
import { createRoot } from 'react-dom/client'
import App from './App.tsx'
import './index.css'

// Find the root element with the specific ID for PHP embedding
const rootElement = document.getElementById("budget-tracker-root") || document.getElementById("root");

if (rootElement) {
  createRoot(rootElement).render(<App />);
} else {
  console.error("Root element not found. Make sure there's a div with id 'budget-tracker-root' in your HTML.");
}
