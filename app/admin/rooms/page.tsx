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
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useDropzone } from "react-dropzone";
import { useAllHotels } from "@/hooks/hotels/hotels";
import { z } from "zod";
import { useAdminCreateRoom } from "@/hooks/rooms/rooms.admin";
import { useAllRooms, useRoomTypes } from "@/hooks/rooms/rooms";
import { RoomItem } from "./room-item";

type Room = {
  id: number;
  name: string;
  status: string;
  hotel: string;
  images: string[];
  description: string;
  amenities: string[];
};

const roomSchema = z.object({
  name: z.string().min(1, "Room name is required"),
  description: z.string().optional(),
  amenities: z.string().optional(),
  status: z.enum(["available", "maintenance"]),
  hotelId: z.string().min(1, "Hotel is required"),
  roomTypeId: z.string().min(1, "Room type is required"),
});

type RoomFormValues = z.infer<typeof roomSchema>;

export default function AdminRoomsPage() {
  const [open, setOpen] = useState(false);
  const [editRoomId, setEditRoomId] = useState<number | null>(null);
  const [imageFiles, setImageFiles] = useState<File[]>([]);
  const [imagePreviews, setImagePreviews] = useState<string[]>([]);

  const { data: rooms, refetch } = useAllRooms({});
  const { data: hotels } = useAllHotels();
  const { mutate: createRoom, isPending } = useAdminCreateRoom();
  const { data: roomTypes } = useRoomTypes();

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    getValues,
    formState: { errors },
  } = useForm<RoomFormValues>({
    resolver: zodResolver(roomSchema),
    defaultValues: {
      name: "",
      status: "available",
      hotelId: "",
      description: "",
      amenities: "",
      roomTypeId: "",
    },
  });

  const resetForm = () => {
    reset();
    setImageFiles([]);
    setImagePreviews([]);
    setEditRoomId(null);
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

  const onSubmit = (data: RoomFormValues) => {
    const formData = new FormData();
    formData.append("name", data.name);
    formData.append("description", data.description || "");
    formData.append("status", data.status);
    formData.append("hotelId", data.hotelId);
    formData.append("roomTypeId", data.roomTypeId);

    const amenitiesArray = data.amenities
      ?.split(",")
      .map((a) => a.trim())
      .filter(Boolean);

    amenitiesArray?.forEach((amenity) =>
      formData.append("amenities[]", amenity)
    );
    imageFiles.forEach((file) => formData.append("images", file));

    createRoom(formData, {
      onSuccess: (newRoomData) => {
        const hotelName =
          hotels?.find((h) => h.id === Number(data.hotelId))?.name || "Unknown";
        const newRoom: Room = {
          id: newRoomData.id,
          name: data.name,
          status: data.status,
          hotel: hotelName,
          images: imagePreviews,
          description: data.description || "",
          amenities: amenitiesArray || [],
        };
        setOpen(false);
        resetForm();
        refetch();
      },
    });
  };

  const handleEditClick = () => {
    // const hotelId =
    //   hotels?.find((h) => h.name === room.hotel)?.id.toString() || "";
    // reset({
    //   name: room.name,
    //   status: room.status,
    //   hotelId,
    //   description: room.description,
    //   amenities: room.amenities.join(", "),
    // });
    // setImagePreviews(room.images || []);
    // setEditRoomId(room.id);
    // setOpen(true);
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
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              <Input placeholder="Room Name" {...register("name")} />
              {errors.name && (
                <p className="text-sm text-red-500">{errors.name.message}</p>
              )}

              <Input placeholder="Description" {...register("description")} />

              <Input
                placeholder="Amenities (comma-separated)"
                {...register("amenities")}
              />

              <Select
                onValueChange={(val) =>
                  setValue("status", val as "available" | "maintenance")
                }
                defaultValue={getValues("status")}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="available">Available</SelectItem>
                  <SelectItem value="maintenance">Maintenance</SelectItem>
                </SelectContent>
              </Select>
              {errors.status && (
                <p className="text-sm text-red-500">{errors.status.message}</p>
              )}

              <Select
                onValueChange={(val) => setValue("hotelId", val)}
                defaultValue={getValues("hotelId")}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Assign to Hotel" />
                </SelectTrigger>
                <SelectContent>
                  {hotels?.map((hotel) => (
                    <SelectItem key={hotel.id} value={hotel.id.toString()}>
                      {hotel.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {errors.hotelId && (
                <p className="text-sm text-red-500">{errors.hotelId.message}</p>
              )}

              <Select
                onValueChange={(val) => setValue("roomTypeId", val)}
                defaultValue={getValues("roomTypeId")}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select Room Type" />
                </SelectTrigger>
                <SelectContent>
                  {roomTypes?.map((type) => (
                    <SelectItem key={type.id} value={type.id.toString()}>
                      {type.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {errors.roomTypeId && (
                <p className="text-sm text-red-500">
                  {errors.roomTypeId.message}
                </p>
              )}

              <div>
                <label className="block mb-1 text-sm font-medium">
                  Room Images
                </label>
                <div
                  {...getRootProps()}
                  className={`border-2 border-dashed p-4 rounded-md text-center cursor-pointer ${
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

              <DialogFooter>
                <Button type="submit" disabled={isPending}>
                  {isPending ? "Creating..." : "Create Room"}
                </Button>
              </DialogFooter>
            </form>
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
          {rooms?.map((room) => (
            <RoomItem
              room={room}
              key={room.id}
              handleEditClick={() => handleEditClick()}
            />
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
