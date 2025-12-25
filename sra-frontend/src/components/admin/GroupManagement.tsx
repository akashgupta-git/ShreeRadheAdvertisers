import { useState } from "react";
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { 
  Plus, 
  Pencil, 
  Trash2, 
  X, 
  Save, 
  Users, 
  ArrowLeft, 
  UserPlus, 
  ChevronsUpDown,
} from "lucide-react";
import { toast } from "@/hooks/use-toast";
import { type Customer } from "@/lib/data";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
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


interface ManageGroupsDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  groups: string[];
  customers: Customer[];
  onUpdateGroups: (newGroups: string[]) => void;
  onUpdateCustomers: (updatedCustomers: Customer[]) => void;
}

export function ManageGroupsDialog({ 
  open, 
  onOpenChange, 
  groups, 
  customers, 
  onUpdateGroups,
  onUpdateCustomers
}: ManageGroupsDialogProps) {
  const [newGroup, setNewGroup] = useState("");
  const [editingGroup, setEditingGroup] = useState<string | null>(null);
  const [editValue, setEditValue] = useState("");
  const [deleteCandidate, setDeleteCandidate] = useState<string | null>(null);
  
  // State for Member Management View
  const [managingGroup, setManagingGroup] = useState<string | null>(null);

  // Stats
  const getGroupCount = (groupName: string) => customers.filter(c => c.group === groupName).length;

  // --- Group Operations ---

  const handleAddGroup = () => {
    if (!newGroup.trim()) return;
    if (groups.includes(newGroup.trim())) {
      toast({ variant: "destructive", title: "Group already exists" });
      return;
    }
    onUpdateGroups([...groups, newGroup.trim()]);
    setNewGroup("");
    toast({ title: "Group Added", description: `${newGroup} is now available.` });
  };

  const startEdit = (group: string) => {
    setEditingGroup(group);
    setEditValue(group);
  };

  const saveEdit = () => {
    if (!editValue.trim() || editValue === editingGroup) {
      setEditingGroup(null);
      return;
    }
    const updatedGroups = groups.map(g => g === editingGroup ? editValue.trim() : g);
    onUpdateGroups(updatedGroups);

    const updatedCustomers = customers.map(c => 
      c.group === editingGroup ? { ...c, group: editValue.trim() } : c
    );
    onUpdateCustomers(updatedCustomers);

    toast({ title: "Group Renamed", description: `Updated customers to "${editValue}".` });
    setEditingGroup(null);
  };

  const confirmDelete = () => {
    if (!deleteCandidate) return;
    const count = getGroupCount(deleteCandidate);
    if (count > 0) {
      toast({ 
        variant: "destructive", 
        title: "Cannot Delete Group", 
        description: `There are ${count} customers in this group. Move them first.` 
      });
      setDeleteCandidate(null);
      return;
    }
    onUpdateGroups(groups.filter(g => g !== deleteCandidate));
    setDeleteCandidate(null);
    toast({ title: "Group Deleted" });
  };

  // --- Member Operations ---

  const handleAddMember = (customerId: string) => {
    if (!managingGroup) return;
    const updated = customers.map(c => c.id === customerId ? { ...c, group: managingGroup } : c);
    onUpdateCustomers(updated);
    toast({ description: "Customer added to group." });
  };

  const handleRemoveMember = (customerId: string) => {
    const updated = customers.map(c => c.id === customerId ? { ...c, group: "" } : c);
    onUpdateCustomers(updated);
    toast({ description: "Customer removed from group." });
  };

  // Helper function to handle dialog closing
  const handleOpenChange = (isOpen: boolean) => {
    if (!isOpen) setManagingGroup(null); // Reset view on close
    onOpenChange(isOpen);
  };

  return (
    <>
      <Dialog open={open} onOpenChange={handleOpenChange}>
        <DialogContent className="max-w-md max-h-[85vh] flex flex-col">
          
          {managingGroup ? (
            // ================= VIEW 2: MANAGE MEMBERS =================
            <GroupMembersView 
              groupName={managingGroup}
              customers={customers}
              onBack={() => setManagingGroup(null)}
              onAddMember={handleAddMember}
              onRemoveMember={handleRemoveMember}
            />
          ) : (
            // ================= VIEW 1: MANAGE GROUPS =================
            <>
              <DialogHeader>
                <DialogTitle>Manage Customer Groups</DialogTitle>
                <DialogDescription>Add, rename, or remove customer sectors.</DialogDescription>
              </DialogHeader>

              <div className="space-y-4 py-2">
                {/* Add New Input */}
                <div className="flex gap-2">
                  <Input 
                    placeholder="New group name (e.g. Retail)" 
                    value={newGroup}
                    onChange={(e) => setNewGroup(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleAddGroup()}
                  />
                  <Button onClick={handleAddGroup} size="icon">
                    <Plus className="h-4 w-4" />
                  </Button>
                </div>

                {/* Groups List */}
                <ScrollArea className="h-[300px] pr-4">
                  <div className="space-y-2">
                    {groups.map((group) => (
                      <div key={group} className="flex items-center justify-between p-2 rounded-md border bg-card hover:bg-accent/50 transition-colors group/item">
                        
                        {editingGroup === group ? (
                          <div className="flex items-center gap-2 flex-1">
                            <Input 
                              value={editValue} 
                              onChange={(e) => setEditValue(e.target.value)}
                              className="h-8"
                              autoFocus
                            />
                            <Button size="icon" variant="ghost" className="h-8 w-8 text-green-600" onClick={saveEdit}>
                              <Save className="h-4 w-4" />
                            </Button>
                            <Button size="icon" variant="ghost" className="h-8 w-8 text-muted-foreground" onClick={() => setEditingGroup(null)}>
                              <X className="h-4 w-4" />
                            </Button>
                          </div>
                        ) : (
                          <>
                            <div className="flex items-center gap-2">
                              <span className="font-medium">{group}</span>
                              <Badge variant="secondary" className="text-[10px] h-5 px-1.5 gap-1">
                                <Users className="h-3 w-3" />
                                {getGroupCount(group)}
                              </Badge>
                            </div>
                            
                            <div className="flex items-center gap-1">
                              {/* Manage Members Button */}
                              <Button 
                                size="icon" 
                                variant="ghost" 
                                className="h-7 w-7 text-primary opacity-70 hover:opacity-100" 
                                onClick={() => setManagingGroup(group)}
                                title="Manage Members"
                              >
                                <Users className="h-3.5 w-3.5" />
                              </Button>
                              
                              {/* Separator */}
                              <div className="w-px h-4 bg-border mx-1" />

                              {/* Edit Button */}
                              <Button size="icon" variant="ghost" className="h-7 w-7 opacity-70 hover:opacity-100" onClick={() => startEdit(group)}>
                                <Pencil className="h-3.5 w-3.5" />
                              </Button>
                              
                              {/* Delete Button */}
                              <Button size="icon" variant="ghost" className="h-7 w-7 text-destructive opacity-70 hover:opacity-100 hover:text-destructive" onClick={() => setDeleteCandidate(group)}>
                                <Trash2 className="h-3.5 w-3.5" />
                              </Button>
                            </div>
                          </>
                        )}
                      </div>
                    ))}
                  </div>
                </ScrollArea>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Alert */}
      <AlertDialog open={!!deleteCandidate} onOpenChange={(open) => !open && setDeleteCandidate(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Group?</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete the <strong>{deleteCandidate}</strong> group?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={confirmDelete} className="bg-destructive hover:bg-destructive/90">
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}

// ================= SUB-COMPONENT: GROUP MEMBER VIEW =================

interface GroupMembersViewProps {
  groupName: string;
  customers: Customer[];
  onBack: () => void;
  onAddMember: (customerId: string) => void;
  onRemoveMember: (customerId: string) => void;
}

function GroupMembersView({ groupName, customers, onBack, onAddMember, onRemoveMember }: GroupMembersViewProps) {
  const [openCombobox, setOpenCombobox] = useState(false);
  const [searchValue, setSearchValue] = useState("");

  const members = customers.filter(c => c.group === groupName);
  const availableCustomers = customers.filter(c => c.group !== groupName);

  return (
    <>
      <DialogHeader className="flex flex-row items-center gap-2 border-b pb-4 mb-2 space-y-0">
        <Button variant="ghost" size="icon" className="-ml-2 h-8 w-8" onClick={onBack}>
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <div>
          <DialogTitle>Manage {groupName}</DialogTitle>
          <DialogDescription className="text-xs">
            {members.length} member(s) assigned
          </DialogDescription>
        </div>
      </DialogHeader>

      <div className="space-y-4 flex-1 overflow-hidden flex flex-col">
        {/* ADD MEMBER SEARCH */}
        <div className="space-y-2">
          <Popover open={openCombobox} onOpenChange={setOpenCombobox}>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                role="combobox"
                aria-expanded={openCombobox}
                className="w-full justify-between"
              >
                <span className="flex items-center gap-2 text-muted-foreground">
                  <UserPlus className="h-4 w-4" />
                  Add customer to group...
                </span>
                <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-[var(--radix-popover-trigger-width)] p-0" align="start">
              <Command>
                <CommandInput 
                  placeholder="Search customers..." 
                  value={searchValue}
                  onValueChange={setSearchValue}
                />
                <CommandList>
                  <CommandEmpty>No customer found.</CommandEmpty>
                  <CommandGroup heading="Available Customers">
                    {availableCustomers.map((customer) => (
                      <CommandItem
                        key={customer.id}
                        value={customer.name + " " + customer.company}
                        onSelect={() => {
                          onAddMember(customer.id);
                          setOpenCombobox(false);
                          setSearchValue("");
                        }}
                      >
                        <div className="flex flex-col">
                          <span className="font-medium">{customer.company}</span>
                          <span className="text-xs text-muted-foreground">{customer.name} • {customer.group || 'Unassigned'}</span>
                        </div>
                        <Plus className="ml-auto h-4 w-4 opacity-50" />
                      </CommandItem>
                    ))}
                  </CommandGroup>
                </CommandList>
              </Command>
            </PopoverContent>
          </Popover>
        </div>

        {/* MEMBERS LIST */}
        <div className="flex-1 overflow-hidden flex flex-col">
          <h4 className="text-sm font-medium mb-2 text-muted-foreground flex items-center gap-2">
            <Users className="h-3.5 w-3.5" /> Current Members
          </h4>
          
          <ScrollArea className="flex-1 pr-4 -mr-4">
            <div className="space-y-2">
              {members.length === 0 ? (
                <div className="text-center py-8 text-sm text-muted-foreground border border-dashed rounded-md">
                  No customers in this group yet.
                </div>
              ) : (
                members.map((member) => (
                  <div key={member.id} className="flex items-center justify-between p-3 rounded-md bg-muted/40 border group">
                    <div className="flex flex-col gap-0.5">
                      <span className="font-medium text-sm">{member.company}</span>
                      <span className="text-xs text-muted-foreground">{member.name}</span>
                    </div>
                    <Button 
                      size="icon" 
                      variant="ghost" 
                      className="h-8 w-8 text-muted-foreground hover:text-destructive hover:bg-destructive/10"
                      onClick={() => onRemoveMember(member.id)}
                      title="Remove from group"
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                ))
              )}
            </div>
          </ScrollArea>
        </div>
      </div>
    </>
  );
}