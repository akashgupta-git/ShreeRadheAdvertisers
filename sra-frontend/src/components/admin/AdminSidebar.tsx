import { Link, useLocation, useNavigate } from "react-router-dom";
import { cn } from "@/lib/utils";
import { 
  LayoutDashboard, 
  MapPin, 
  PlusCircle, 
  Calendar, 
  BarChart3, 
  Clock,
  Users,
  FileText, // Added Icon
  ChevronLeft,
  ChevronRight,
  ExternalLink
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import logo from "@/assets/logo.png";

const navItems = [
  { icon: LayoutDashboard, label: 'Dashboard', path: '/admin' },
  { icon: MapPin, label: 'Media Management', path: '/admin/media' },
  { icon: PlusCircle, label: 'Add Media', path: '/admin/media/new' },
  { icon: Users, label: 'Customer Bookings', path: '/admin/bookings' },
  { icon: Calendar, label: 'Availability', path: '/admin/availability' },
  { icon: BarChart3, label: 'Analytics', path: '/admin/analytics' },
  { icon: FileText, label: 'Reports', path: '/admin/reports' }, // Added Reports
  { icon: Clock, label: 'Coming Soon', path: '/admin/maintenance' },
];

export function AdminSidebar() {
  const location = useLocation();
  const navigate = useNavigate();
  const [collapsed, setCollapsed] = useState(false);

  return (
    <aside 
      className={cn(
        "fixed left-0 top-0 bottom-0 z-40 flex flex-col bg-sidebar border-r border-sidebar-border transition-all duration-300",
        collapsed ? "w-16" : "w-64"
      )}
    >
      {/* Header / Logo */}
      <div className="flex items-center gap-2 p-4 border-b border-sidebar-border">
        {collapsed ? (
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary text-primary-foreground shrink-0">
            <MapPin className="h-5 w-5" />
          </div>
        ) : (
          <img src={logo} alt="Shree Radhe Advertisers" className="h-10 w-auto" />
        )}
      </div>

      {/* Navigation Items */}
      <nav className="flex-1 p-3 space-y-1 overflow-y-auto scrollbar-thin">
        {navItems.map((item) => {
          // MODIFIED LOGIC:
          // 1. Exact match for Dashboard
          // 2. For Media Management: Match prefix but EXCLUDE 'Add Media' path
          // 3. For others: Standard prefix match
          const isActive = 
            item.path === '/admin' 
              ? location.pathname === '/admin'
              : item.path === '/admin/media'
                ? location.pathname.startsWith(item.path) && !location.pathname.startsWith('/admin/media/new')
                : location.pathname.startsWith(item.path);
          
          return (
            <Link
              key={item.path}
              to={item.path}
              className={cn(
                "flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all duration-200 group relative overflow-hidden",
                isActive 
                  ? "bg-primary text-primary-foreground shadow-lg shadow-primary/20" 
                  : "text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
              )}
            >
              <item.icon className={cn("h-5 w-5 shrink-0 transition-colors", isActive ? "text-primary-foreground" : "text-muted-foreground group-hover:text-primary")} />
              {!collapsed && <span className="font-medium">{item.label}</span>}
            </Link>
          );
        })}
      </nav>

      {/* Footer / Actions */}
      <div className="p-3 border-t border-sidebar-border space-y-2">
        <Button
          variant="outline"
          className={cn(
            "w-full gap-3 relative overflow-hidden group border-primary/20 hover:border-primary hover:bg-primary hover:text-primary-foreground transition-all duration-300",
            collapsed ? "justify-center px-0" : "justify-start"
          )}
          onClick={() => navigate('/')}
        >
          <ExternalLink className="h-5 w-5 shrink-0 transition-transform group-hover:rotate-45" />
          
          {!collapsed && (
            <>
              <span className="font-medium relative z-10">Exit to Website</span>
              <div className="absolute inset-0 translate-y-full group-hover:translate-y-0 bg-white/10 transition-transform duration-300 ease-in-out" />
            </>
          )}
        </Button>
        
        <Button
          variant="ghost"
          size="icon"
          className="w-full text-muted-foreground hover:text-foreground"
          onClick={() => setCollapsed(!collapsed)}
        >
          {collapsed ? <ChevronRight className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
        </Button>
      </div>
    </aside>
  );
}