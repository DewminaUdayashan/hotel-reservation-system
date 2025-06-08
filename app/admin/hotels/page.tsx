"use client";

import { useState } from "react";
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

export type Hotel = {
  id: number;
  name: string;
  location: string;
  description: string;
  mapUrl?: string;
  logoUrl?: string;
  createdAt: string;
};

const initialHotels: Hotel[] = [
  {
    id: 1,
    name: "Luxe Galle Paradies",
    location: "Galle, Sri Lanka",
    description: "A seaside luxury resort with serene ocean views.",
    mapUrl: "https://maps.example.com/galle-paradies",
    logoUrl: "",
    createdAt: new Date().toISOString(),
  },
  {
    id: 2,
    name: "Luxe Hambanthota Bay",
    location: "Hambanthota, Sri Lanka",
    description: "Elegant comfort at the southern coast.",
    mapUrl: "",
    logoUrl: "",
    createdAt: new Date().toISOString(),
  },
];

export default function AdminHotelsPage() {
  const [hotels, setHotels] = useState<Hotel[]>(initialHotels);
  const [open, setOpen] = useState(false);
  const [editHotelId, setEditHotelId] = useState<number | null>(null);
  const [form, setForm] = useState<Omit<Hotel, "id" | "createdAt">>({
    name: "",
    location: "",
    description: "",
    mapUrl: "",
    logoUrl: "",
  });
  const [logoFile, setLogoFile] = useState<File | null>(null);
  const [logoPreview, setLogoPreview] = useState<string | null>(null);

  const resetForm = () => {
    setForm({
      name: "",
      location: "",
      description: "",
      mapUrl: "",
      logoUrl: "",
    });
    setEditHotelId(null);
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
    const newLogoUrl = logoPreview || "";

    if (editHotelId !== null) {
      setHotels((prev) =>
        prev.map((hotel) =>
          hotel.id === editHotelId
            ? {
                ...hotel,
                ...form,
                logoUrl: newLogoUrl,
              }
            : hotel
        )
      );
    } else {
      const newHotel: Hotel = {
        id: hotels.length + 1,
        ...form,
        logoUrl: newLogoUrl,
        createdAt: new Date().toISOString(),
      };
      setHotels([...hotels, newHotel]);
    }

    resetForm();
    setOpen(false);
  };

  const handleEditClick = (hotel: Hotel) => {
    setForm({
      name: hotel.name,
      location: hotel.location,
      description: hotel.description,
      mapUrl: hotel.mapUrl || "",
      logoUrl: hotel.logoUrl || "",
    });
    setLogoPreview(hotel.logoUrl || null);
    setEditHotelId(hotel.id);
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
            <Button>Add New Hotel</Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>
                {editHotelId ? "Edit Hotel" : "Create Hotel"}
              </DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <Input
                placeholder="Hotel Name"
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
              />
              <Input
                placeholder="Location"
                value={form.location}
                onChange={(e) => setForm({ ...form, location: e.target.value })}
              />
              <Input
                placeholder="Description"
                value={form.description}
                onChange={(e) =>
                  setForm({ ...form, description: e.target.value })
                }
              />
              <Input
                placeholder="Map URL"
                value={form.mapUrl}
                onChange={(e) => setForm({ ...form, mapUrl: e.target.value })}
              />
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
              <Button onClick={handleSaveHotel}>
                {editHotelId ? "Update Hotel" : "Create Hotel"}
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
            <TableHead>Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {hotels.map((hotel) => (
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
              <TableCell>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleEditClick(hotel)}
                >
                  Edit
                </Button>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
