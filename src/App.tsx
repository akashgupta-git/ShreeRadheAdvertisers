import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/contexts/AuthContext";
import { LocationDataProvider } from "@/contexts/LocationDataContext";
import { ProtectedRoute } from "@/components/auth/ProtectedRoute";
import { PublicLayout } from "@/layouts/PublicLayout";
import { AdminLayout } from "@/layouts/AdminLayout";

// Public Pages
import Index from "./pages/Index";
import Explore from "./pages/Explore";
import MediaDetail from "./pages/MediaDetail";
import Contact from "./pages/Contact";
import About from "./pages/About"; 

// Admin Pages
import Login from "./pages/admin/Login";
import Dashboard from "./pages/admin/Dashboard";
import MediaManagement from "./pages/admin/MediaManagement";
import AdminMediaDetail from "./pages/admin/AdminMediaDetail";
import AddMedia from "./pages/admin/AddMedia";
import Availability from "./pages/admin/Availability";
import Analytics from "./pages/admin/Analytics";
import Maintenance from "./pages/admin/Maintenance";
import CustomerBookings from "./pages/admin/CustomerBookings";
import Reports from "./pages/admin/Reports";
import Payments from "./pages/admin/Payments";
import NotFound from "./pages/NotFound";
import Documents from "./pages/admin/Documents";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <LocationDataProvider>
        <TooltipProvider>
          <Toaster />
          <Sonner />
        <BrowserRouter
          future={{
            v7_startTransition: true,
            v7_relativeSplatPath: true,
          }}
        >
          <Routes>
            {/* Public Routes */}
            <Route element={<PublicLayout />}>
              <Route path="/" element={<Index />} />
              <Route path="/about" element={<About />} />
              <Route path="/explore" element={<Explore />} />
              <Route path="/media/:id" element={<MediaDetail />} />
              <Route path="/contact" element={<Contact />} />
            </Route>

            {/* Admin Login - Outside Protected Area */}
            <Route path="/admin/login" element={<Login />} />

            {/* Protected Admin Routes */}
            <Route 
              path="/admin" 
              element={
                <ProtectedRoute>
                  <AdminLayout />
                </ProtectedRoute>
              }
            >
              <Route index element={<Dashboard />} />
              <Route path="media" element={<MediaManagement />} />
              <Route path="media/new" element={<AddMedia />} />
              <Route path="media/:id" element={<AdminMediaDetail />} />
              <Route path="bookings" element={<CustomerBookings />} />
              <Route path="payments" element={<Payments />} />
              <Route path="availability" element={<Availability />} />
              <Route path="analytics" element={<Analytics />} />
              <Route path="reports" element={<Reports />} />
              <Route path="documents" element={<Documents />} />
              <Route path="maintenance" element={<Maintenance />} />
            </Route>

            {/* 404 */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
        </TooltipProvider>
      </LocationDataProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;