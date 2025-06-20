"use client";

import { useState } from "react";
import { z } from "zod";
import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useDropzone } from "react-dropzone";
import { toast } from "sonner";
import { useAdminCreateHotel } from "@/hooks/hotels/hotels.adamin";
import { useAllHotels } from "@/hooks/hotels/hotels";

export type Hotel = {
  id: number;
  name: string;
  location: string;
  description: string;
  mapUrl?: string;
  logoUrl?: string;
  createdAt: string;
};

const hotelSchema = z.object({
  name: z.string().min(1, "Hotel name is required"),
  location: z.string().min(1, "Location is required"),
  description: z.string().min(1, "Description is required"),
  mapUrl: z.string().url("Invalid URL").optional().or(z.literal("")),
});

export default function AdminHotelsPage() {
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState<Omit<Hotel, "id" | "createdAt">>({
    name: "",
    location: "",
    description: "",
    mapUrl: "",
    logoUrl: "",
  });
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});
  const [logoFile, setLogoFile] = useState<File | null>(null);
  const [logoPreview, setLogoPreview] = useState<string | null>(null);

  const { data: hotels, refetch } = useAllHotels();
  const { mutate: createHotel, isPending } = useAdminCreateHotel();

  const resetForm = () => {
    setForm({
      name: "",
      location: "",
      description: "",
      mapUrl: "",
      logoUrl: "",
    });
    setFormErrors({});
    setLogoFile(null);
    setLogoPreview(null);
  };

  const onDrop = (acceptedFiles: File[]) => {
    const file = acceptedFiles[0];
    if (file) {
      setLogoFile(file);
      setLogoPreview(URL.createObjectURL(file));
    }
  };

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: { "image/*": [] },
    multiple: false,
  });

  const handleSaveHotel = () => {
    const result = hotelSchema.safeParse({ ...form });

    if (!result.success) {
      const errors: Record<string, string> = {};
      result.error.errors.forEach((err) => {
        if (err.path.length > 0) {
          errors[err.path[0] as string] = err.message;
        }
      });
      setFormErrors(errors);
      return;
    }

    if (!logoFile) {
      toast.error("Please upload a logo image");
      return;
    }

    const formData = new FormData();
    formData.append("name", form.name);
    formData.append("location", form.location);
    formData.append("description", form.description);
    if (form.mapUrl) formData.append("mapUrl", form.mapUrl);
    formData.append("logoUrl", form.logoUrl || ""); // optional fallback
    formData.append("images", logoFile); // single image
    formData.append("captions", "Hotel logo"); // optional caption

    createHotel(formData, {
      onSuccess: () => {
        toast.success("Hotel created successfully!");
        refetch();
        setOpen(false);
        resetForm();
      },
      onError: (err: any) => {
        toast.error(err.response?.data?.error || "Failed to create hotel");
      },
    });
  };

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-2xl font-semibold">Hotel Management</h1>
        <Dialog
          open={open}
          onOpenChange={(v) => {
            setOpen(v);
            if (!v) resetForm();
          }}
        >
          <DialogTrigger asChild>
            <Button>Add New Hotel</Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Create Hotel</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Input
                  placeholder="Hotel Name"
                  value={form.name}
                  onChange={(e) => {
                    setForm({ ...form, name: e.target.value });
                    setFormErrors((prev) => ({ ...prev, name: "" }));
                  }}
                />
                {formErrors.name && (
                  <p className="text-sm text-red-500">{formErrors.name}</p>
                )}
              </div>

              <div>
                <Input
                  placeholder="Location"
                  value={form.location}
                  onChange={(e) => {
                    setForm({ ...form, location: e.target.value });
                    setFormErrors((prev) => ({ ...prev, location: "" }));
                  }}
                />
                {formErrors.location && (
                  <p className="text-sm text-red-500">{formErrors.location}</p>
                )}
              </div>

              <div>
                <Input
                  placeholder="Description"
                  value={form.description}
                  onChange={(e) => {
                    setForm({ ...form, description: e.target.value });
                    setFormErrors((prev) => ({ ...prev, description: "" }));
                  }}
                />
                {formErrors.description && (
                  <p className="text-sm text-red-500">
                    {formErrors.description}
                  </p>
                )}
              </div>

              <div>
                <Input
                  placeholder="Map URL"
                  value={form.mapUrl}
                  onChange={(e) => {
                    setForm({ ...form, mapUrl: e.target.value });
                    setFormErrors((prev) => ({ ...prev, mapUrl: "" }));
                  }}
                />
                {formErrors.mapUrl && (
                  <p className="text-sm text-red-500">{formErrors.mapUrl}</p>
                )}
              </div>

              <div>
                <label className="block mb-1 text-sm font-medium text-gray-700">
                  Logo
                </label>
                <div
                  {...getRootProps()}
                  className={`border-2 border-dashed p-4 rounded-md text-center cursor-pointer transition ${
                    isDragActive
                      ? "border-blue-400 bg-blue-50"
                      : "border-gray-300"
                  }`}
                >
                  <input {...getInputProps()} />
                  {logoPreview ? (
                    <img
                      src={logoPreview}
                      alt="Logo Preview"
                      className="w-full h-24 object-contain rounded"
                    />
                  ) : (
                    <p className="text-sm text-gray-500">
                      Drag and drop logo image, or click to select
                    </p>
                  )}
                </div>
              </div>
            </div>
            <DialogFooter>
              <Button onClick={handleSaveHotel} disabled={isPending}>
                {isPending ? "Saving..." : "Create Hotel"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>ID</TableHead>
            <TableHead>Name</TableHead>
            <TableHead>Location</TableHead>
            <TableHead>Description</TableHead>
            <TableHead>Map URL</TableHead>
            <TableHead>Logo</TableHead>
            <TableHead>Created At</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {hotels?.map((hotel) => (
            <TableRow key={hotel.id}>
              <TableCell>{hotel.id}</TableCell>
              <TableCell>{hotel.name}</TableCell>
              <TableCell>{hotel.location}</TableCell>
              <TableCell>{hotel.description}</TableCell>
              <TableCell>
                {hotel.mapUrl ? (
                  <a
                    href={hotel.mapUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-500 underline text-sm"
                  >
                    View Map
                  </a>
                ) : (
                  "—"
                )}
              </TableCell>
              <TableCell>
                {hotel.logoUrl ? (
                  <img
                    src={hotel.logoUrl}
                    alt="Logo"
                    className="w-12 h-12 object-contain rounded"
                  />
                ) : (
                  <span className="text-xs text-gray-400">No logo</span>
                )}
              </TableCell>
              <TableCell className="text-sm">
                {new Date(hotel.createdAt).toLocaleDateString()}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
