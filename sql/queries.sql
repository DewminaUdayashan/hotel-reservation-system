CREATE TABLE Hotels (
    id INT IDENTITY(1,1) PRIMARY KEY,
    name NVARCHAR(255) NOT NULL,
    location NVARCHAR(255) NULL,
    description NVARCHAR(MAX) NULL,
    createdAt DATETIME DEFAULT GETDATE()
);

ALTER TABLE Hotels
ADD
    mapUrl NVARCHAR(MAX) NULL,
    logoUrl NVARCHAR(MAX) NULL;

CREATE TABLE HotelImages (
    id INT IDENTITY(1,1) PRIMARY KEY,
    hotelId INT NOT NULL,
    imageUrl NVARCHAR(MAX) NOT NULL,
    caption NVARCHAR(255) NULL,
    createdAt DATETIME DEFAULT GETDATE(),
    FOREIGN KEY (hotelId) REFERENCES Hotels(id) ON DELETE CASCADE
);

CREATE TABLE Users (
    id INT IDENTITY(1,1) PRIMARY KEY,
    email NVARCHAR(255) NOT NULL UNIQUE,
    passwordHash NVARCHAR(255) NOT NULL,
    firstName NVARCHAR(100) NOT NULL,
    lastName NVARCHAR(100) NOT NULL,
    role NVARCHAR(50) NOT NULL CHECK (role IN ('customer', 'clerk', 'manager', 'admin')),
    createdAt DATETIME DEFAULT GETDATE()
);

ALTER TABLE Users
ADD isActive BIT NOT NULL DEFAULT 1;

CREATE TABLE Agencies (
    id INT IDENTITY(1,1) PRIMARY KEY,
    name NVARCHAR(255) NOT NULL,
    phone NVARCHAR(50),
    createdAt DATETIME DEFAULT GETDATE()
); 

CREATE TABLE Customers (
    id INT PRIMARY KEY,  -- 1-to-1 with Users
    phone NVARCHAR(50) NOT NULL,
    homeTown NVARCHAR(50) NULL,
    FOREIGN KEY (id) REFERENCES Users(id) ON DELETE CASCADE
);

ALTER TABLE Customers
ADD
    customerType NVARCHAR(20) NOT NULL DEFAULT 'individual'
        CHECK (customerType IN ('individual', 'agency'));

ALTER TABLE Customers
ADD agencyId INT NULL,
    FOREIGN KEY (agencyId) REFERENCES Agencies(id) ON DELETE SET NULL;
 

CREATE TABLE HotelUsers (
    id INT IDENTITY(1,1) PRIMARY KEY,
    userId INT NOT NULL,
    hotelId INT NOT NULL,
    role NVARCHAR(50) NOT NULL CHECK (role IN ('clerk', 'manager')),
    FOREIGN KEY (userId) REFERENCES Users(id) ON DELETE CASCADE,
    FOREIGN KEY (hotelId) REFERENCES Hotels(id) ON DELETE CASCADE
);

CREATE TABLE RoomTypes (
    id INT PRIMARY KEY,
    name NVARCHAR(255) NOT NULL,
    description NVARCHAR(MAX),
    capacity INT NOT NULL,
    price DECIMAL(10, 2) NOT NULL,
    weeklyRate DECIMAL(10, 2) NULL,
    monthlyRate DECIMAL(10, 2) NULL,
    isResidential BIT NULL,
    bedType NVARCHAR(100) NOT NULL,
    viewType NVARCHAR(100) NOT NULL
);


CREATE TABLE Amenities (
    id INT IDENTITY(1,1) PRIMARY KEY,
    amenity NVARCHAR(255),
);

CREATE TABLE RoomTypeAmenities (
    id INT IDENTITY(1,1) PRIMARY KEY,
    roomTypeId INT NOT NULL,
    amenitiesId INT NOT NULL,
    FOREIGN KEY (roomTypeId) REFERENCES RoomTypes(id) ON DELETE CASCADE,
    FOREIGN KEY (amenitiesId) REFERENCES Amenities(id) ON DELETE CASCADE
);

CREATE TABLE Rooms (
    id INT PRIMARY KEY,
    name NVARCHAR(255) NOT NULL,
    description NVARCHAR(MAX),
    status NVARCHAR(20) NOT NULL CHECK (status IN ('available', 'maintenance')),
    type INT NOT NULL,
    bedType NVARCHAR(100) NULL,
    viewType NVARCHAR(100) NULL,
    FOREIGN KEY (type) REFERENCES RoomTypes(id)
);

ALTER TABLE Rooms
ADD hotelId INT;

ALTER TABLE Rooms
ADD CONSTRAINT FK_Rooms_Hotels FOREIGN KEY (hotelId)
REFERENCES Hotels(id)
ON DELETE CASCADE;

CREATE TABLE Images (
    id INT IDENTITY(1,1) PRIMARY KEY,
    imageUrl NVARCHAR(MAX) NOT NULL
);

CREATE TABLE RoomImages (
    imageId INT NOT NULL,
    roomId INT NOT NULL,
    PRIMARY KEY (imageId, roomId),
    FOREIGN KEY (imageId) REFERENCES Images(id) ON DELETE CASCADE,
    FOREIGN KEY (roomId) REFERENCES Rooms(id) ON DELETE CASCADE
);

CREATE TABLE RoomTypeImages (
    imageId INT NOT NULL,
    roomTypeId INT NOT NULL,
    PRIMARY KEY (imageId, roomTypeId),
    FOREIGN KEY (imageId) REFERENCES Images(id) ON DELETE CASCADE,
    FOREIGN KEY (roomTypeId) REFERENCES RoomTypes(id) ON DELETE CASCADE
);

CREATE TABLE Reservations (
    id INT IDENTITY(1,1) PRIMARY KEY,
    customerId INT NOT NULL,
    roomId INT NOT NULL,
    numberOfGuests INT NOT NULL,
    checkInDate DATE NOT NULL,
    checkOutDate DATE NOT NULL,
    specialRequests NVARCHAR(500) NULL,
    createdAt DATETIME DEFAULT GETDATE(),
    status NVARCHAR(50) NOT NULL DEFAULT 'pending' CHECK (status IN (
        'pending', 'confirmed', 'cancelled', 'checked-in', 'checked-out', 'no-show'
    )),
    FOREIGN KEY (customerId) REFERENCES Customers(id),
    FOREIGN KEY (roomId) REFERENCES Rooms(id)
);

CREATE TABLE ReservationPayments (
    id INT IDENTITY(1,1) PRIMARY KEY,
    reservationId INT NOT NULL UNIQUE,  -- One-to-one with reservation
    cardHolderName NVARCHAR(100) NOT NULL,
    maskedCardNumber NVARCHAR(25) NOT NULL,       -- e.g., **** **** **** 1234
    cardType NVARCHAR(50),                        -- e.g., Visa, MasterCard
    expiryMonth INT NOT NULL,
    expiryYear INT NOT NULL,
    createdAt DATETIME DEFAULT GETDATE(),
    FOREIGN KEY (reservationId) REFERENCES Reservations(id) ON DELETE CASCADE
);

CREATE TABLE AssignedRooms (
    id INT IDENTITY(1,1) PRIMARY KEY,
    reservationId INT NOT NULL,
    roomId INT NOT NULL,
    assignedAt DATETIME NOT NULL DEFAULT GETDATE(),
    FOREIGN KEY (reservationId) REFERENCES Reservations(id) ON DELETE CASCADE,
    FOREIGN KEY (roomId) REFERENCES Rooms(id)
);

CREATE TABLE ServiceTypes (
    id INT IDENTITY(1,1) PRIMARY KEY,
    name NVARCHAR(100) NOT NULL UNIQUE,         -- e.g., 'restaurant', 'laundry'
    description NVARCHAR(255) NULL
);

CREATE TABLE Invoices (
    id INT IDENTITY(1,1) PRIMARY KEY,
    reservationId INT NOT NULL UNIQUE,
    invoiceDate DATETIME DEFAULT GETDATE(),
    dueDate DATETIME NULL,
    totalAmount DECIMAL(10, 2) NOT NULL,
    status NVARCHAR(50) NOT NULL DEFAULT 'unpaid' CHECK (status IN ('unpaid', 'partially_paid', 'paid')),
    paymentMethod NVARCHAR(50) NULL CHECK (paymentMethod IN ('cash', 'credit_card')),
    FOREIGN KEY (reservationId) REFERENCES Reservations(id) ON DELETE CASCADE
);

CREATE TABLE InvoiceLineItems (
    id INT IDENTITY(1,1) PRIMARY KEY,
    invoiceId INT NOT NULL,
    description NVARCHAR(255) NOT NULL,
    amount DECIMAL(10, 2) NOT NULL,
    serviceTypeId INT NULL,  -- optional: null for room rate, not null for extras
    FOREIGN KEY (invoiceId) REFERENCES Invoices(id) ON DELETE CASCADE,
    FOREIGN KEY (serviceTypeId) REFERENCES ServiceTypes(id)
);

CREATE TABLE Payments (
    id INT IDENTITY(1,1) PRIMARY KEY,
    invoiceId INT NOT NULL,
    amountPaid DECIMAL(10,2) NOT NULL,            -- Amount customer gave
    changeReturned DECIMAL(10,2) DEFAULT 0.00,    -- Change given back (if any)
    paymentDate DATETIME DEFAULT GETDATE(),
    paymentMethod NVARCHAR(50) NOT NULL CHECK (paymentMethod IN ('cash', 'credit_card')),
    transactionId NVARCHAR(255) NULL,
    FOREIGN KEY (invoiceId) REFERENCES Invoices(id) ON DELETE CASCADE
);

INSERT INTO RoomTypes (id, name, description, capacity, price, weeklyRate, monthlyRate, isResidential, bedType, viewType) VALUES
(1, 'Standard Room', 'Comfortable room with all the essential amenities for a pleasant stay.', 2, 120.00, NULL, NULL, NULL, 'Queen', 'City'),
(2, 'Deluxe Room', 'Spacious room with premium amenities and a beautiful city view.', 2, 180.00, NULL, NULL, NULL, 'King', 'City or Partial Sea'),
(3, 'Executive Suite', 'Elegant suite with separate living area and premium amenities.', 3, 250.00, NULL, NULL, NULL, 'King + Sofa Bed', 'Sea or Panoramic'),
(4, 'Residential Suite', 'Long-term stay suite with kitchen and all the comforts of home.', 4, 350.00, 2100.00, 7500.00, 1, '2 Queens with Sofa', 'Panoramic, City or Sea');

INSERT INTO Amenities (amenity) VALUES
('Free WiFi'),
('TV'),
('Air Conditioning'),
('Private Bathroom'),
('Coffee Maker'),
('Smart TV'),
('Luxury Bathroom'),
('Mini Bar'),
('Work Desk'),
('Jacuzzi'),
('Lounge Area'),
('Full Kitchen'),
('Washer/Dryer'),
('Living Room'),
('Dining Area');


-- Standard Room (ID = 1)
INSERT INTO RoomTypeAmenities (roomTypeId, amenitiesId) VALUES
(1, 1), (1, 2), (1, 3), (1, 4), (1, 5);

-- Deluxe Room (ID = 2)
INSERT INTO RoomTypeAmenities (roomTypeId, amenitiesId) VALUES
(2, 1), (2, 6), (2, 3), (2, 7), (2, 8), (2, 5), (2, 9);

-- Executive Suite (ID = 3)
INSERT INTO RoomTypeAmenities (roomTypeId, amenitiesId) VALUES
(3, 1), (3, 6), (3, 3), (3, 10), (3, 8), (3, 5), (3, 11), (3, 9);

-- Residential Suite (ID = 4)
INSERT INTO RoomTypeAmenities (roomTypeId, amenitiesId) VALUES
(4, 1), (4, 6), (4, 3), (4, 12), (4, 13), (4, 14), (4, 15), (4, 9);

-- Standard Room Images
INSERT INTO Images (imageUrl) VALUES
('/images/room_types/standard-room.jpg'),          -- id = 1
('/images/room_types/standard-room-2.webp'),       -- id = 2

-- Deluxe Room Image
('/images/room_types/deluxe-room.jpg.avif'),       -- id = 3

-- Executive Suite Image
('/images/room_types/executive-suite.jpg'),        -- id = 4

-- Residential Suite Image
('/images/room_types/residential-suite.jpg');      -- id = 5


-- Standard Room (RoomType ID = 1)
INSERT INTO RoomTypeImages (imageId, roomTypeId) VALUES
(1, 1),
(2, 1);

-- Deluxe Room (RoomType ID = 2)
INSERT INTO RoomTypeImages (imageId, roomTypeId) VALUES
(3, 2);

-- Executive Suite (RoomType ID = 3)
INSERT INTO RoomTypeImages (imageId, roomTypeId) VALUES
(4, 3);

-- Residential Suite (RoomType ID = 4)
INSERT INTO RoomTypeImages (imageId, roomTypeId) VALUES
(5, 4);

INSERT INTO Rooms (id, name, description, status, type, bedType, viewType) VALUES
(1, 'Standard Room 101', 'A cozy standard room with a queen bed and city view.', 'available', 1, 'Queen', 'City'),
(2, 'Deluxe Room 201', 'Spacious deluxe room with a king bed and balcony.', 'available', 2, 'King', 'City'),
(5, 'Deluxe Room 202', 'Spacious deluxe room with a king bed and balcony.', 'available', 2, 'King', 'City'),
(3, 'Executive Suite 301', 'Luxurious executive suite with living area and workspace.', 'available', 3, 'King + Sofa Bed', 'Sea'),
(4, 'Residential Suite 401', 'Premium residential suite with kitchen and two bedrooms.', 'maintenance', 4, '2 Queens', 'Sea'),
(6, 'Residential Suite 422', 'Premium residential suite with kitchen and two bedrooms.', 'available', 4, '2 Queens', 'Panoramic');

INSERT INTO Hotels (name, location, description)
VALUES (
    'Luxe Galle Paradies',
    'Galle, Sri Lanka',
    'Nestled along the southern coastline, Luxe Galle Paradies offers breathtaking ocean views, serene tropical gardens, and world-class hospitality in a refined colonial setting.'
);

-- Assign rooms 1, 2, 3 to hotel 1 (Galle)
UPDATE Rooms SET hotelId = 1 WHERE id = 1;
UPDATE Rooms SET hotelId = 1 WHERE id = 2;
UPDATE Rooms SET hotelId = 1 WHERE id = 3;

-- Assign rooms 4, 5, 6 to hotel 2 (Hambanthota)
UPDATE Rooms SET hotelId = 2 WHERE id = 4;
UPDATE Rooms SET hotelId = 2 WHERE id = 5;
UPDATE Rooms SET hotelId = 2 WHERE id = 6;