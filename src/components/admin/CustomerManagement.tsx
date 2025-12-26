import { useState } from "react";
import { Plus, Check, ChevronsUpDown } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { toast } from "@/hooks/use-toast";
import { type Customer, customerGroups as defaultGroups } from "@/lib/data";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { cn } from "@/lib/utils";

// Define the shape of the form data (Customer without system-generated fields)
type CustomerFormData = Omit<Customer, 'id' | 'totalBookings' | 'totalSpent'>;

interface CustomerFormProps {
  customer?: Customer;
  availableGroups?: string[];
  onSave: (customer: CustomerFormData) => void;
  onCancel: () => void;
  onAddGroup?: (newGroup: string) => void;
}

function CustomerForm({ customer, onSave, onCancel, availableGroups = defaultGroups, onAddGroup }: CustomerFormProps) {
  const [name, setName] = useState(customer?.name || "");
  const [company, setCompany] = useState(customer?.company || "");
  const [email, setEmail] = useState(customer?.email || "");
  const [phone, setPhone] = useState(customer?.phone || "");
  const [address, setAddress] = useState(customer?.address || "");
  const [group, setGroup] = useState(customer?.group || "");
  
  const [openGroup, setOpenGroup] = useState(false);
  const [groupSearch, setGroupSearch] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !company || !email || !phone || !group) {
      toast({
        title: "Missing fields",
        description: "Please fill all required fields, including Group.",
        variant: "destructive",
      });
      return;
    }
    onSave({ name, company, email, phone, address, group });
  };

  const handleCreateGroup = () => {
    if (groupSearch && !availableGroups.includes(groupSearch)) {
      if (onAddGroup) {
        onAddGroup(groupSearch);
      }
      setGroup(groupSearch);
      setOpenGroup(false);
      toast({ description: `Created new group: ${groupSearch}` });
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label>Contact Name *</Label>
          <Input value={name} onChange={(e) => setName(e.target.value)} placeholder="Name" />
        </div>
        <div className="space-y-2">
          <Label>Company Name *</Label>
          <Input value={company} onChange={(e) => setCompany(e.target.value)} placeholder="Company" />
        </div>
      </div>

      <div className="space-y-2">
        <Label>Customer Group *</Label>
        <Popover open={openGroup} onOpenChange={setOpenGroup}>
          <PopoverTrigger asChild>
            <Button variant="outline" role="combobox" aria-expanded={openGroup} className="w-full justify-between font-normal">
              {group || "Select group..."}
              <ChevronsUpDown className="ml-2 h-4 w-4 opacity-50" />
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-full p-0" align="start">
            <Command>
              <CommandInput placeholder="Search or create group..." value={groupSearch} onValueChange={setGroupSearch} />
              <CommandList>
                <CommandEmpty>
                   <div className="p-2">
                     <p className="text-sm text-muted-foreground mb-2">No group found.</p>
                     <Button size="sm" variant="secondary" className="w-full h-8 text-xs" onClick={handleCreateGroup} type="button">
                       <Plus className="h-3 w-3 mr-1" /> Create "{groupSearch}"
                     </Button>
                   </div>
                </CommandEmpty>
                <CommandGroup heading="Groups">
                  {availableGroups.map((g) => (
                    <CommandItem key={g} value={g} onSelect={(val) => { setGroup(val === group ? "" : val); setOpenGroup(false); }}>
                      <Check className={cn("mr-2 h-4 w-4", group === g ? "opacity-100" : "opacity-0")} />
                      {g}
                    </CommandItem>
                  ))}
                </CommandGroup>
              </CommandList>
            </Command>
          </PopoverContent>
        </Popover>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label>Email *</Label>
          <Input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="Email" />
        </div>
        <div className="space-y-2">
          <Label>Phone *</Label>
          <Input value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="Phone" />
        </div>
      </div>
      <div className="space-y-2">
        <Label>Address</Label>
        <Input value={address} onChange={(e) => setAddress(e.target.value)} placeholder="Address" />
      </div>
      <div className="flex justify-end gap-3 pt-4">
        <Button type="button" variant="outline" onClick={onCancel}>Cancel</Button>
        <Button type="submit">{customer ? 'Update' : 'Add'}</Button>
      </div>
    </form>
  );
}

// --- Wrapper Components ---

interface AddCustomerDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onCustomerAdded?: (customer: Customer) => void;
  availableGroups: string[];
  onAddGroup: (g: string) => void;
}

export function AddCustomerDialog({ open, onOpenChange, onCustomerAdded, availableGroups, onAddGroup }: AddCustomerDialogProps) {
  // Replaced 'any' with specific 'CustomerFormData' type
  const handleSave = (data: CustomerFormData) => {
    const newCustomer: Customer = { 
      ...data, 
      id: `CUS-${Date.now()}`, 
      totalBookings: 0, 
      totalSpent: 0 
    };
    toast({ title: "Customer Added", description: `${data.company} added.` });
    onCustomerAdded?.(newCustomer);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg">
        <DialogHeader><DialogTitle>Add Customer</DialogTitle></DialogHeader>
        <CustomerForm onSave={handleSave} onCancel={() => onOpenChange(false)} availableGroups={availableGroups} onAddGroup={onAddGroup} />
      </DialogContent>
    </Dialog>
  );
}

interface EditCustomerDialogProps {
  customer: Customer;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onCustomerUpdated?: (customer: Customer) => void;
  availableGroups: string[];
  onAddGroup: (g: string) => void;
}

export function EditCustomerDialog({ customer, open, onOpenChange, onCustomerUpdated, availableGroups, onAddGroup }: EditCustomerDialogProps) {
  // Replaced 'any' with specific 'CustomerFormData' type
  const handleSave = (data: CustomerFormData) => {
    const updated: Customer = { ...customer, ...data };
    toast({ title: "Customer Updated" });
    onCustomerUpdated?.(updated);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg">
        <DialogHeader><DialogTitle>Edit Customer</DialogTitle></DialogHeader>
        <CustomerForm customer={customer} onSave={handleSave} onCancel={() => onOpenChange(false)} availableGroups={availableGroups} onAddGroup={onAddGroup} />
      </DialogContent>
    </Dialog>
  );
}

// Added strict interface for DeleteDialog props
interface DeleteCustomerDialogProps {
  customer: Customer;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onCustomerDeleted: (id: string) => void;
}

export function DeleteCustomerDialog({ customer, open, onOpenChange, onCustomerDeleted }: DeleteCustomerDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader><DialogTitle>Delete Customer</DialogTitle></DialogHeader>
        <div className="py-4"><p>Are you sure you want to delete <strong>{customer.company}</strong>?</p></div>
        <div className="flex justify-end gap-3">
          <Button variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
          <Button variant="destructive" onClick={() => { onCustomerDeleted?.(customer.id); onOpenChange(false); }}>Delete</Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}