import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
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
import { useState } from "react";
import { mediaLocations, customers } from "@/lib/data";
import { useToast } from "@/hooks/use-toast";
import { Plus, Check, ChevronsUpDown, Trash2, CalendarPlus } from "lucide-react";
import { cn } from "@/lib/utils";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";

interface BookingItem {
  tempId: string;
  mediaId: string;
  mediaName: string;
  mediaType: string;
  startDate: string;
  endDate: string;
  amount: string;
}

export function CreateBookingDialog() {
  const [open, setOpen] = useState(false);
  const { toast } = useToast();

  // --- Global Booking State ---
  const [customerId, setCustomerId] = useState("");
  const [bookingQueue, setBookingQueue] = useState<BookingItem[]>([]);

  // --- Search Dropdown States ---
  const [customerOpen, setCustomerOpen] = useState(false);
  const [mediaOpen, setMediaOpen] = useState(false);

  // --- Current Item State (The "Add" Form) ---
  const [currentItem, setCurrentItem] = useState({
    mediaId: "",
    startDate: "",
    endDate: "",
    amount: "",
  });

  const selectedCustomer = customers.find((c) => c.id === customerId);
  const currentMedia = mediaLocations.find((m) => m.id === currentItem.mediaId);

  // Helper: Reset the "Add Item" form only
  const resetCurrentItem = () => {
    setCurrentItem({
      mediaId: "",
      startDate: "",
      endDate: "",
      amount: "",
    });
  };

  // Action: Add Item to Queue
  const handleAddItem = () => {
    if (
      !currentItem.mediaId ||
      !currentItem.startDate ||
      !currentItem.endDate ||
      !currentItem.amount
    ) {
      toast({
        variant: "destructive",
        title: "Incomplete Item",
        description: "Please select a media, dates, and amount before adding.",
      });
      return;
    }

    const media = mediaLocations.find((m) => m.id === currentItem.mediaId);
    if (!media) return;

    const newItem: BookingItem = {
      tempId: Math.random().toString(36).substring(7),
      mediaId: media.id,
      mediaName: media.name,
      mediaType: media.type,
      startDate: currentItem.startDate,
      endDate: currentItem.endDate,
      amount: currentItem.amount,
    };

    setBookingQueue([...bookingQueue, newItem]);
    resetCurrentItem();
    toast({ description: "Item added to booking list." });
  };

  // Action: Remove Item from Queue
  const handleRemoveItem = (id: string) => {
    setBookingQueue(bookingQueue.filter((item) => item.tempId !== id));
  };

  // Action: Submit All
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!customerId) {
      toast({
        variant: "destructive",
        title: "Missing Customer",
        description: "Please select a customer for these bookings.",
      });
      return;
    }

    if (bookingQueue.length === 0) {
      toast({
        variant: "destructive",
        title: "Empty Booking List",
        description: "Please add at least one media item to the list.",
      });
      return;
    }

    // --- API Integration Point ---
    // Here you would loop through `bookingQueue` and send requests to your backend
    console.log("Submitting Bookings:", { customerId, bookings: bookingQueue });

    toast({
      title: "Success",
      description: `Created ${bookingQueue.length} booking(s) for ${selectedCustomer?.name}.`,
    });

    setBookingQueue([]);
    setCustomerId("");
    resetCurrentItem();
    setOpen(false);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>
          <Plus className="mr-2 h-4 w-4" />
          Create Booking
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[700px] max-h-[90vh] overflow-y-auto flex flex-col">
        <DialogHeader>
          <DialogTitle>Create New Booking</DialogTitle>
          <DialogDescription>
            Create multiple bookings for a single customer. Add items to the list
            and save.
          </DialogDescription>
        </DialogHeader>

        <div className="grid gap-6 py-4">
          {/* 1. Global Customer Selection */}
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="customer" className="text-right font-medium text-sm">
              Customer
            </Label>
            <div className="col-span-3">
              <Popover open={customerOpen} onOpenChange={setCustomerOpen}>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    role="combobox"
                    aria-expanded={customerOpen}
                    className={cn(
                      "w-full justify-between font-normal text-left",
                      !selectedCustomer && "text-muted-foreground"
                    )}
                  >
                    {selectedCustomer ? (
                      <span className="truncate">
                        {selectedCustomer.company}{" "}
                        <span className="text-muted-foreground ml-1">
                          ({selectedCustomer.name})
                        </span>
                      </span>
                    ) : (
                      "Select customer..."
                    )}
                    <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-[400px] p-0" align="start">
                  <Command>
                    <CommandInput placeholder="Search customer..." />
                    <CommandList>
                      <CommandEmpty>No customer found.</CommandEmpty>
                      <CommandGroup>
                        {customers.map((customer) => (
                          <CommandItem
                            key={customer.id}
                            value={customer.company + " " + customer.name}
                            onSelect={() => {
                              setCustomerId(customer.id);
                              setCustomerOpen(false);
                            }}
                          >
                            <Check
                              className={cn(
                                "mr-2 h-4 w-4",
                                customerId === customer.id
                                  ? "opacity-100"
                                  : "opacity-0"
                              )}
                            />
                            <div className="flex flex-col">
                              <span className="font-medium">
                                {customer.company}
                              </span>
                              <span className="text-xs text-muted-foreground">
                                {customer.name}
                              </span>
                            </div>
                          </CommandItem>
                        ))}
                      </CommandGroup>
                    </CommandList>
                  </Command>
                </PopoverContent>
              </Popover>
            </div>
          </div>

          <Separator />

          {/* 2. Add Item Section (The "Builder") */}
          <div className="bg-muted/40 p-4 rounded-lg border border-dashed border-muted-foreground/30 space-y-4">
            <div className="flex items-center gap-2 mb-2">
              <CalendarPlus className="h-4 w-4 text-primary" />
              <span className="text-sm font-semibold">Add Media to Booking</span>
            </div>

            {/* Media Select */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2 md:col-span-2">
                <Label className="text-xs text-muted-foreground uppercase tracking-wider">
                  Select Media
                </Label>
                <Popover open={mediaOpen} onOpenChange={setMediaOpen}>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      role="combobox"
                      aria-expanded={mediaOpen}
                      className={cn(
                        "w-full justify-between font-normal text-left bg-background",
                        !currentMedia && "text-muted-foreground"
                      )}
                    >
                      {currentMedia ? (
                        <span className="truncate">
                          {currentMedia.name}{" "}
                          <span className="text-muted-foreground ml-1">
                            ({currentMedia.id})
                          </span>
                        </span>
                      ) : (
                        "Search media location..."
                      )}
                      <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-[400px] p-0" align="start">
                    <Command>
                      <CommandInput placeholder="Search media..." />
                      <CommandList>
                        <CommandEmpty>No media found.</CommandEmpty>
                        <CommandGroup>
                          {mediaLocations.slice(0, 50).map((media) => (
                            <CommandItem
                              key={media.id}
                              value={media.name + " " + media.id}
                              onSelect={() => {
                                setCurrentItem({
                                  ...currentItem,
                                  mediaId: media.id,
                                  amount: media.pricePerMonth.toString(),
                                });
                                setMediaOpen(false);
                              }}
                            >
                              <Check
                                className={cn(
                                  "mr-2 h-4 w-4",
                                  currentItem.mediaId === media.id
                                    ? "opacity-100"
                                    : "opacity-0"
                                )}
                              />
                              <div className="flex flex-col">
                                <span className="font-medium">{media.name}</span>
                                <span className="text-xs text-muted-foreground">
                                  {media.city} • {media.type}
                                </span>
                              </div>
                            </CommandItem>
                          ))}
                        </CommandGroup>
                      </CommandList>
                    </Command>
                  </PopoverContent>
                </Popover>
              </div>

              {/* Start Date */}
              <div className="space-y-2">
                <Label className="text-xs text-muted-foreground uppercase tracking-wider">
                  Start Date
                </Label>
                <Input
                  type="date"
                  className="bg-background"
                  value={currentItem.startDate}
                  onChange={(e) =>
                    setCurrentItem({ ...currentItem, startDate: e.target.value })
                  }
                />
              </div>

              {/* End Date */}
              <div className="space-y-2">
                <Label className="text-xs text-muted-foreground uppercase tracking-wider">
                  End Date
                </Label>
                <Input
                  type="date"
                  className="bg-background"
                  value={currentItem.endDate}
                  onChange={(e) =>
                    setCurrentItem({ ...currentItem, endDate: e.target.value })
                  }
                />
              </div>

              {/* Amount */}
              <div className="space-y-2">
                <Label className="text-xs text-muted-foreground uppercase tracking-wider">
                  Agreed Rate (₹)
                </Label>
                <Input
                  type="number"
                  className="bg-background"
                  placeholder="0.00"
                  value={currentItem.amount}
                  onChange={(e) =>
                    setCurrentItem({ ...currentItem, amount: e.target.value })
                  }
                />
              </div>

              {/* Add Button */}
              <div className="flex items-end">
                <Button
                  type="button"
                  variant="secondary"
                  className="w-full"
                  onClick={handleAddItem}
                >
                  <Plus className="mr-2 h-4 w-4" /> Add to List
                </Button>
              </div>
            </div>
          </div>

          {/* 3. Items Queue (The List) */}
          <div className="space-y-2">
            <div className="flex justify-between items-center px-1">
              <Label>Booking List ({bookingQueue.length})</Label>
              {bookingQueue.length > 0 && (
                <span className="text-xs font-medium text-muted-foreground">
                  Total Value: ₹
                  {bookingQueue
                    .reduce((sum, item) => sum + Number(item.amount), 0)
                    .toLocaleString()}
                </span>
              )}
            </div>

            {bookingQueue.length === 0 ? (
              <div className="text-center py-6 border rounded-md bg-muted/10 text-muted-foreground text-sm">
                No items added yet.
              </div>
            ) : (
              <div className="border rounded-md overflow-hidden max-h-[200px] overflow-y-auto">
                <table className="w-full text-sm">
                  <thead className="bg-muted text-muted-foreground text-xs uppercase">
                    <tr>
                      <th className="px-3 py-2 text-left font-medium">Media</th>
                      <th className="px-3 py-2 text-left font-medium">Dates</th>
                      <th className="px-3 py-2 text-right font-medium">Amount</th>
                      <th className="w-[40px]"></th>
                    </tr>
                  </thead>
                  <tbody className="divide-y">
                    {bookingQueue.map((item) => (
                      <tr key={item.tempId} className="bg-card hover:bg-muted/50">
                        <td className="px-3 py-2">
                          <div className="font-medium">{item.mediaName}</div>
                          <Badge variant="outline" className="text-[10px] h-4 px-1">
                            {item.mediaType}
                          </Badge>
                        </td>
                        <td className="px-3 py-2 text-muted-foreground text-xs">
                          <div>{item.startDate}</div>
                          <div>{item.endDate}</div>
                        </td>
                        <td className="px-3 py-2 text-right font-medium">
                          ₹{Number(item.amount).toLocaleString()}
                        </td>
                        <td className="px-2 py-2 text-center">
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-6 w-6 text-muted-foreground hover:text-destructive"
                            onClick={() => handleRemoveItem(item.tempId)}
                          >
                            <Trash2 className="h-3 w-3" />
                          </Button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>

        <DialogFooter className="mt-auto pt-4 border-t">
          <Button variant="outline" onClick={() => setOpen(false)}>
            Cancel
          </Button>
          <Button onClick={handleSubmit} disabled={bookingQueue.length === 0}>
            Confirm {bookingQueue.length} Bookings
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}