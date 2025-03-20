
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, HashRouter } from "react-router-dom";
import Index from "./pages/Index";
import NotFound from "./pages/NotFound";

// Use HashRouter for WordPress or PHP compatibility
const isWordPress = window.location.href.includes('wp-content') || 
                    window.location.href.includes('wp-admin') ||
                    window.location.href.includes('wp-json');

// Check for PHP environment
const isPHP = document.querySelector('meta[name="integration-type"][content="php-compatible"]') !== null;

// Use HashRouter if in WordPress or PHP
const Router = (isWordPress || isPHP) ? HashRouter : BrowserRouter;

const queryClient = new QueryClient();

const App = () => {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <Router>
          <Routes>
            <Route path="/" element={<Index />} />
            {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </Router>
      </TooltipProvider>
    </QueryClientProvider>
  );
};

export default App;
