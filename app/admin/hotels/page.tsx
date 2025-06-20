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
import { Edit } from "lucide-react";

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
  const [isEditing, setIsEditing] = useState(false);
  const [editingHotelId, setEditingHotelId] = useState<number | null>(null);
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
  const { mutate: createHotel, isPending: isCreating } = useAdminCreateHotel();

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
    setEditingHotelId(null);
    setIsEditing(false);
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

  const handleSubmit = () => {
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

    const formData = new FormData();
    formData.append("name", form.name);
    formData.append("location", form.location);
    formData.append("description", form.description);
    if (form.mapUrl) formData.append("mapUrl", form.mapUrl);
    if (logoFile) formData.append("images", logoFile);
    formData.append("captions", "Hotel logo");

    if (isEditing && editingHotelId !== null) {
    } else {
      if (!logoFile) {
        toast.error("Please upload a logo image");
        return;
      }

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
    }
  };

  const handleEdit = (hotel: Hotel) => {
    setForm({
      name: hotel.name,
      location: hotel.location,
      description: hotel.description,
      mapUrl: hotel.mapUrl || "",
      logoUrl: hotel.logoUrl || "",
    });
    setLogoPreview(hotel.logoUrl || null);
    setEditingHotelId(hotel.id);
    setIsEditing(true);
    setOpen(true);
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
            <Button
              onClick={() => {
                resetForm();
                setOpen(true);
              }}
            >
              Add New Hotel
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>
                {isEditing ? "Edit Hotel" : "Create Hotel"}
              </DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              {["name", "location", "description", "mapUrl"].map((field) => (
                <div key={field}>
                  <Input
                    placeholder={field
                      .replace(/([A-Z])/g, " $1")
                      .replace(/^./, (str) => str.toUpperCase())}
                    value={(form as any)[field]}
                    onChange={(e) => {
                      setForm({ ...form, [field]: e.target.value });
                      setFormErrors((prev) => ({ ...prev, [field]: "" }));
                    }}
                  />
                  {formErrors[field] && (
                    <p className="text-sm text-red-500">{formErrors[field]}</p>
                  )}
                </div>
              ))}

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
              <Button onClick={handleSubmit} disabled={isCreating}>
                {isEditing
                  ? "Update Hotel"
                  : isCreating
                    ? "Saving..."
                    : "Create Hotel"}
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
            <TableHead>Actions</TableHead>
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
                <Button
                  variant="ghost"
                  size="sm"
                  className="text-blue-500 hover:underline"
                  onClick={() => handleEdit(hotel)}
                >
                  <Edit color="white" />
                </Button>
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
