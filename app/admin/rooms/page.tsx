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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

import { useDropzone } from "react-dropzone";

type Room = {
  id: number;
  name: string;
  status: string;
  hotel: string;
  images: string[];
  description: string;
  amenities: string[];
};

const dummyHotels = [
  { id: 1, name: "Luxe Galle Paradies" },
  { id: 2, name: "Luxe Hambanthota Bay" },
];
const initialRooms: Room[] = [
  {
    id: 1,
    name: "Standard Room 101",
    status: "available",
    hotel: "Luxe Galle Paradies",
    images: [],
    description: "",
    amenities: [],
  },
  {
    id: 2,
    name: "Deluxe Room 202",
    status: "maintenance",
    hotel: "Luxe Hambanthota Bay",
    images: [],
    description: "",
    amenities: [],
  },
];
export default function AdminRoomsPage() {
  const [rooms, setRooms] = useState(initialRooms);
  const [open, setOpen] = useState(false);
  const [editRoomId, setEditRoomId] = useState<number | null>(null);
  const [roomForm, setRoomForm] = useState({
    name: "",
    status: "available",
    hotelId: "",
    description: "",
    amenities: "",
  });
  const [imageFiles, setImageFiles] = useState<File[]>([]);
  const [imagePreviews, setImagePreviews] = useState<string[]>([]);

  const resetForm = () => {
    setRoomForm({
      name: "",
      status: "available",
      hotelId: "",
      description: "",
      amenities: "",
    });
    setEditRoomId(null);
    setImageFiles([]);
    setImagePreviews([]);
  };

  const onDrop = (acceptedFiles: File[]) => {
    const previews = acceptedFiles.map((file) => URL.createObjectURL(file));
    setImageFiles((prev) => [...prev, ...acceptedFiles]);
    setImagePreviews((prev) => [...prev, ...previews]);
  };

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: { "image/*": [] },
    multiple: true,
  });

  const handleSaveRoom = () => {
    const hotelName =
      dummyHotels.find((h) => h.id === Number(roomForm.hotelId))?.name ||
      "Unknown Hotel";

    const amenitiesArray = roomForm.amenities
      .split(",")
      .map((a) => a.trim())
      .filter((a) => a.length > 0);

    if (editRoomId !== null) {
      setRooms((prev) =>
        prev.map((room) =>
          room.id === editRoomId
            ? {
                ...room,
                name: roomForm.name,
                status: roomForm.status,
                hotel: hotelName,
                images: imagePreviews.length > 0 ? imagePreviews : room.images,
                description: roomForm.description,
                amenities: amenitiesArray,
              }
            : room
        )
      );
    } else {
      const newRoom = {
        id: rooms.length + 1,
        name: roomForm.name,
        status: roomForm.status,
        hotel: hotelName,
        images: imagePreviews,
        description: roomForm.description,
        amenities: amenitiesArray,
      };
      setRooms([...rooms, newRoom]);
    }

    resetForm();
    setOpen(false);
  };

  const handleEditClick = (room: (typeof initialRooms)[number]) => {
    const hotelId =
      dummyHotels.find((h) => h.name === room.hotel)?.id.toString() || "";
    setRoomForm({
      name: room.name,
      status: room.status,
      hotelId,
      description: room.description || "",
      amenities: room.amenities?.join(", ") || "",
    });
    setImageFiles([]);
    setImagePreviews(room.images || []);
    setEditRoomId(room.id);
    setOpen(true);
  };

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-2xl font-semibold">Rooms Management</h1>
        <Dialog
          open={open}
          onOpenChange={(v) => {
            setOpen(v);
            if (!v) resetForm();
          }}
        >
          <DialogTrigger asChild>
            <Button>Add New Room</Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>
                {editRoomId ? "Edit Room" : "Create New Room"}
              </DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <Input
                placeholder="Room Name"
                value={roomForm.name}
                onChange={(e) =>
                  setRoomForm({ ...roomForm, name: e.target.value })
                }
              />
              <Input
                placeholder="Description"
                value={roomForm.description}
                onChange={(e) =>
                  setRoomForm({ ...roomForm, description: e.target.value })
                }
              />
              <Input
                placeholder="Amenities (comma-separated)"
                value={roomForm.amenities}
                onChange={(e) =>
                  setRoomForm({ ...roomForm, amenities: e.target.value })
                }
              />
              <Select
                value={roomForm.status}
                onValueChange={(value) =>
                  setRoomForm({ ...roomForm, status: value })
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="available">Available</SelectItem>
                  <SelectItem value="maintenance">Maintenance</SelectItem>
                </SelectContent>
              </Select>
              <Select
                value={roomForm.hotelId}
                onValueChange={(value) =>
                  setRoomForm({ ...roomForm, hotelId: value })
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Assign to Hotel" />
                </SelectTrigger>
                <SelectContent>
                  {dummyHotels.map((hotel) => (
                    <SelectItem key={hotel.id} value={hotel.id.toString()}>
                      {hotel.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <div>
                <label className="block mb-1 text-sm font-medium text-gray-700">
                  Room Images
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
                  <p className="text-sm text-gray-500">
                    Drag and drop images here, or click to select
                  </p>
                  {imagePreviews.length > 0 && (
                    <div className="mt-4 grid grid-cols-3 gap-2">
                      {imagePreviews.map((src, index) => (
                        <img
                          key={index}
                          src={src}
                          alt={`Preview ${index}`}
                          className="h-24 w-full object-cover rounded"
                        />
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>
            <DialogFooter>
              <Button onClick={handleSaveRoom}>
                {editRoomId ? "Update Room" : "Create Room"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>ID</TableHead>
            <TableHead>Room Name</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Hotel</TableHead>
            <TableHead>Images</TableHead>
            <TableHead>Amenities</TableHead>
            <TableHead>Description</TableHead>
            <TableHead>Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {rooms.map((room) => (
            <TableRow key={room.id}>
              <TableCell>{room.id}</TableCell>
              <TableCell>{room.name}</TableCell>
              <TableCell>{room.status}</TableCell>
              <TableCell>{room.hotel}</TableCell>
              <TableCell>
                {room.images.length > 0 ? (
                  <div className="flex gap-2">
                    {room.images.slice(0, 2).map((img, index) => (
                      <img
                        key={index}
                        src={img}
                        alt="Room"
                        className="w-12 h-10 object-cover rounded"
                      />
                    ))}
                    {room.images.length > 2 && (
                      <span className="text-xs text-gray-500">
                        +{room.images.length - 2} more
                      </span>
                    )}
                  </div>
                ) : (
                  <span className="text-xs text-gray-400">No images</span>
                )}
              </TableCell>
              <TableCell>
                {room.amenities?.length > 0 ? room.amenities.join(", ") : "—"}
              </TableCell>
              <TableCell>{room.description || "—"}</TableCell>
              <TableCell>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleEditClick(room)}
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
