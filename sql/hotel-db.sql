USE [master]
GO
/****** Object:  Database [hotel-db]    Script Date: 6/6/2025 2:52:08 PM ******/
CREATE DATABASE [hotel-db]
 CONTAINMENT = NONE
 ON  PRIMARY 
( NAME = N'hotel-db', FILENAME = N'C:\Program Files\Microsoft SQL Server\MSSQL16.SQLEXPRESS\MSSQL\DATA\hotel-db.mdf' , SIZE = 8192KB , MAXSIZE = UNLIMITED, FILEGROWTH = 65536KB )
 LOG ON 
( NAME = N'hotel-db_log', FILENAME = N'C:\Program Files\Microsoft SQL Server\MSSQL16.SQLEXPRESS\MSSQL\DATA\hotel-db_log.ldf' , SIZE = 8192KB , MAXSIZE = 2048GB , FILEGROWTH = 65536KB )
 WITH CATALOG_COLLATION = DATABASE_DEFAULT, LEDGER = OFF
GO
ALTER DATABASE [hotel-db] SET COMPATIBILITY_LEVEL = 160
GO
IF (1 = FULLTEXTSERVICEPROPERTY('IsFullTextInstalled'))
begin
EXEC [hotel-db].[dbo].[sp_fulltext_database] @action = 'enable'
end
GO
ALTER DATABASE [hotel-db] SET ANSI_NULL_DEFAULT OFF 
GO
ALTER DATABASE [hotel-db] SET ANSI_NULLS OFF 
GO
ALTER DATABASE [hotel-db] SET ANSI_PADDING OFF 
GO
ALTER DATABASE [hotel-db] SET ANSI_WARNINGS OFF 
GO
ALTER DATABASE [hotel-db] SET ARITHABORT OFF 
GO
ALTER DATABASE [hotel-db] SET AUTO_CLOSE OFF 
GO
ALTER DATABASE [hotel-db] SET AUTO_SHRINK OFF 
GO
ALTER DATABASE [hotel-db] SET AUTO_UPDATE_STATISTICS ON 
GO
ALTER DATABASE [hotel-db] SET CURSOR_CLOSE_ON_COMMIT OFF 
GO
ALTER DATABASE [hotel-db] SET CURSOR_DEFAULT  GLOBAL 
GO
ALTER DATABASE [hotel-db] SET CONCAT_NULL_YIELDS_NULL OFF 
GO
ALTER DATABASE [hotel-db] SET NUMERIC_ROUNDABORT OFF 
GO
ALTER DATABASE [hotel-db] SET QUOTED_IDENTIFIER OFF 
GO
ALTER DATABASE [hotel-db] SET RECURSIVE_TRIGGERS OFF 
GO
ALTER DATABASE [hotel-db] SET  DISABLE_BROKER 
GO
ALTER DATABASE [hotel-db] SET AUTO_UPDATE_STATISTICS_ASYNC OFF 
GO
ALTER DATABASE [hotel-db] SET DATE_CORRELATION_OPTIMIZATION OFF 
GO
ALTER DATABASE [hotel-db] SET TRUSTWORTHY OFF 
GO
ALTER DATABASE [hotel-db] SET ALLOW_SNAPSHOT_ISOLATION OFF 
GO
ALTER DATABASE [hotel-db] SET PARAMETERIZATION SIMPLE 
GO
ALTER DATABASE [hotel-db] SET READ_COMMITTED_SNAPSHOT OFF 
GO
ALTER DATABASE [hotel-db] SET HONOR_BROKER_PRIORITY OFF 
GO
ALTER DATABASE [hotel-db] SET RECOVERY SIMPLE 
GO
ALTER DATABASE [hotel-db] SET  MULTI_USER 
GO
ALTER DATABASE [hotel-db] SET PAGE_VERIFY CHECKSUM  
GO
ALTER DATABASE [hotel-db] SET DB_CHAINING OFF 
GO
ALTER DATABASE [hotel-db] SET FILESTREAM( NON_TRANSACTED_ACCESS = OFF ) 
GO
ALTER DATABASE [hotel-db] SET TARGET_RECOVERY_TIME = 60 SECONDS 
GO
ALTER DATABASE [hotel-db] SET DELAYED_DURABILITY = DISABLED 
GO
ALTER DATABASE [hotel-db] SET ACCELERATED_DATABASE_RECOVERY = OFF  
GO
ALTER DATABASE [hotel-db] SET QUERY_STORE = ON
GO
ALTER DATABASE [hotel-db] SET QUERY_STORE (OPERATION_MODE = READ_WRITE, CLEANUP_POLICY = (STALE_QUERY_THRESHOLD_DAYS = 30), DATA_FLUSH_INTERVAL_SECONDS = 900, INTERVAL_LENGTH_MINUTES = 60, MAX_STORAGE_SIZE_MB = 1000, QUERY_CAPTURE_MODE = AUTO, SIZE_BASED_CLEANUP_MODE = AUTO, MAX_PLANS_PER_QUERY = 200, WAIT_STATS_CAPTURE_MODE = ON)
GO
USE [hotel-db]
GO
/****** Object:  User [hotelAdmin]    Script Date: 6/6/2025 2:52:08 PM ******/
CREATE USER [hotelAdmin] FOR LOGIN [hotelAdmin] WITH DEFAULT_SCHEMA=[dbo]
GO
/****** Object:  User [admin]    Script Date: 6/6/2025 2:52:08 PM ******/
CREATE USER [admin] FOR LOGIN [admin] WITH DEFAULT_SCHEMA=[dbo]
GO
ALTER ROLE [db_owner] ADD MEMBER [hotelAdmin]
GO
ALTER ROLE [db_owner] ADD MEMBER [admin]
GO
/****** Object:  Table [dbo].[Agencies]    Script Date: 6/6/2025 2:52:08 PM ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE TABLE [dbo].[Agencies](
	[id] [int] IDENTITY(1,1) NOT NULL,
	[name] [nvarchar](255) NOT NULL,
	[phone] [nvarchar](50) NULL,
	[createdAt] [datetime] NULL,
PRIMARY KEY CLUSTERED 
(
	[id] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
) ON [PRIMARY]
GO
/****** Object:  Table [dbo].[Amenities]    Script Date: 6/6/2025 2:52:08 PM ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE TABLE [dbo].[Amenities](
	[id] [int] IDENTITY(1,1) NOT NULL,
	[amenity] [nvarchar](255) NULL,
PRIMARY KEY CLUSTERED 
(
	[id] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
) ON [PRIMARY]
GO
/****** Object:  Table [dbo].[AssignedRooms]    Script Date: 6/6/2025 2:52:08 PM ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE TABLE [dbo].[AssignedRooms](
	[id] [int] IDENTITY(1,1) NOT NULL,
	[reservationId] [int] NOT NULL,
	[roomId] [int] NOT NULL,
	[assignedAt] [datetime] NOT NULL,
PRIMARY KEY CLUSTERED 
(
	[id] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
) ON [PRIMARY]
GO
/****** Object:  Table [dbo].[Customers]    Script Date: 6/6/2025 2:52:08 PM ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE TABLE [dbo].[Customers](
	[id] [int] NOT NULL,
	[phone] [nvarchar](50) NOT NULL,
	[homeTown] [nvarchar](50) NULL,
	[customerType] [nvarchar](20) NOT NULL,
	[agencyId] [int] NULL,
PRIMARY KEY CLUSTERED 
(
	[id] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
) ON [PRIMARY]
GO
/****** Object:  Table [dbo].[HotelImages]    Script Date: 6/6/2025 2:52:08 PM ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE TABLE [dbo].[HotelImages](
	[id] [int] IDENTITY(1,1) NOT NULL,
	[hotelId] [int] NOT NULL,
	[imageUrl] [nvarchar](max) NOT NULL,
	[caption] [nvarchar](255) NULL,
	[createdAt] [datetime] NULL,
PRIMARY KEY CLUSTERED 
(
	[id] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
) ON [PRIMARY] TEXTIMAGE_ON [PRIMARY]
GO
/****** Object:  Table [dbo].[Hotels]    Script Date: 6/6/2025 2:52:08 PM ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE TABLE [dbo].[Hotels](
	[id] [int] IDENTITY(1,1) NOT NULL,
	[name] [nvarchar](255) NOT NULL,
	[location] [nvarchar](255) NULL,
	[description] [nvarchar](max) NULL,
	[createdAt] [datetime] NULL,
	[mapUrl] [nvarchar](max) NULL,
	[logoUrl] [nvarchar](max) NULL,
PRIMARY KEY CLUSTERED 
(
	[id] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
) ON [PRIMARY] TEXTIMAGE_ON [PRIMARY]
GO
/****** Object:  Table [dbo].[HotelUsers]    Script Date: 6/6/2025 2:52:08 PM ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE TABLE [dbo].[HotelUsers](
	[id] [int] IDENTITY(1,1) NOT NULL,
	[userId] [int] NOT NULL,
	[hotelId] [int] NOT NULL,
	[role] [nvarchar](50) NOT NULL,
PRIMARY KEY CLUSTERED 
(
	[id] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
) ON [PRIMARY]
GO
/****** Object:  Table [dbo].[Images]    Script Date: 6/6/2025 2:52:08 PM ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE TABLE [dbo].[Images](
	[id] [int] IDENTITY(1,1) NOT NULL,
	[imageUrl] [nvarchar](max) NOT NULL,
PRIMARY KEY CLUSTERED 
(
	[id] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
) ON [PRIMARY] TEXTIMAGE_ON [PRIMARY]
GO
/****** Object:  Table [dbo].[InvoiceLineItems]    Script Date: 6/6/2025 2:52:08 PM ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE TABLE [dbo].[InvoiceLineItems](
	[id] [int] IDENTITY(1,1) NOT NULL,
	[invoiceId] [int] NOT NULL,
	[description] [nvarchar](255) NOT NULL,
	[amount] [decimal](10, 2) NOT NULL,
	[serviceTypeId] [int] NULL,
PRIMARY KEY CLUSTERED 
(
	[id] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
) ON [PRIMARY]
GO
/****** Object:  Table [dbo].[Invoices]    Script Date: 6/6/2025 2:52:08 PM ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE TABLE [dbo].[Invoices](
	[id] [int] IDENTITY(1,1) NOT NULL,
	[reservationId] [int] NOT NULL,
	[invoiceDate] [datetime] NULL,
	[dueDate] [datetime] NULL,
	[totalAmount] [decimal](10, 2) NOT NULL,
	[status] [nvarchar](50) NOT NULL,
	[paymentMethod] [nvarchar](50) NULL,
PRIMARY KEY CLUSTERED 
(
	[id] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY],
UNIQUE NONCLUSTERED 
(
	[reservationId] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
) ON [PRIMARY]
GO
/****** Object:  Table [dbo].[Payments]    Script Date: 6/6/2025 2:52:08 PM ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE TABLE [dbo].[Payments](
	[id] [int] IDENTITY(1,1) NOT NULL,
	[invoiceId] [int] NOT NULL,
	[amountPaid] [decimal](10, 2) NOT NULL,
	[changeReturned] [decimal](10, 2) NULL,
	[paymentDate] [datetime] NULL,
	[paymentMethod] [nvarchar](50) NOT NULL,
	[transactionId] [nvarchar](255) NULL,
PRIMARY KEY CLUSTERED 
(
	[id] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
) ON [PRIMARY]
GO
/****** Object:  Table [dbo].[ReservationPayments]    Script Date: 6/6/2025 2:52:08 PM ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE TABLE [dbo].[ReservationPayments](
	[id] [int] IDENTITY(1,1) NOT NULL,
	[reservationId] [int] NOT NULL,
	[cardHolderName] [nvarchar](100) NOT NULL,
	[maskedCardNumber] [nvarchar](25) NOT NULL,
	[cardType] [nvarchar](50) NULL,
	[expiryMonth] [int] NOT NULL,
	[expiryYear] [int] NOT NULL,
	[createdAt] [datetime] NULL,
	[bankName] [nvarchar](255) NULL,
PRIMARY KEY CLUSTERED 
(
	[id] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY],
UNIQUE NONCLUSTERED 
(
	[reservationId] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
) ON [PRIMARY]
GO
/****** Object:  Table [dbo].[Reservations]    Script Date: 6/6/2025 2:52:08 PM ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE TABLE [dbo].[Reservations](
	[id] [int] IDENTITY(1,1) NOT NULL,
	[customerId] [int] NOT NULL,
	[roomId] [int] NOT NULL,
	[numberOfGuests] [int] NOT NULL,
	[checkInDate] [date] NOT NULL,
	[checkOutDate] [date] NOT NULL,
	[specialRequests] [nvarchar](500) NULL,
	[createdAt] [datetime] NULL,
	[status] [nvarchar](50) NOT NULL,
PRIMARY KEY CLUSTERED 
(
	[id] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
) ON [PRIMARY]
GO
/****** Object:  Table [dbo].[RoomImages]    Script Date: 6/6/2025 2:52:08 PM ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE TABLE [dbo].[RoomImages](
	[imageId] [int] NOT NULL,
	[roomId] [int] NOT NULL,
PRIMARY KEY CLUSTERED 
(
	[imageId] ASC,
	[roomId] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
) ON [PRIMARY]
GO
/****** Object:  Table [dbo].[Rooms]    Script Date: 6/6/2025 2:52:08 PM ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE TABLE [dbo].[Rooms](
	[id] [int] NOT NULL,
	[name] [nvarchar](255) NOT NULL,
	[description] [nvarchar](max) NULL,
	[status] [nvarchar](20) NOT NULL,
	[type] [int] NOT NULL,
	[bedType] [nvarchar](100) NULL,
	[viewType] [nvarchar](100) NULL,
	[hotelId] [int] NULL,
PRIMARY KEY CLUSTERED 
(
	[id] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
) ON [PRIMARY] TEXTIMAGE_ON [PRIMARY]
GO
/****** Object:  Table [dbo].[RoomTypeAmenities]    Script Date: 6/6/2025 2:52:08 PM ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE TABLE [dbo].[RoomTypeAmenities](
	[id] [int] IDENTITY(1,1) NOT NULL,
	[roomTypeId] [int] NOT NULL,
	[amenitiesId] [int] NOT NULL,
PRIMARY KEY CLUSTERED 
(
	[id] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
) ON [PRIMARY]
GO
/****** Object:  Table [dbo].[RoomTypeImages]    Script Date: 6/6/2025 2:52:08 PM ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE TABLE [dbo].[RoomTypeImages](
	[imageId] [int] NOT NULL,
	[roomTypeId] [int] NOT NULL,
PRIMARY KEY CLUSTERED 
(
	[imageId] ASC,
	[roomTypeId] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
) ON [PRIMARY]
GO
/****** Object:  Table [dbo].[RoomTypes]    Script Date: 6/6/2025 2:52:08 PM ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE TABLE [dbo].[RoomTypes](
	[id] [int] NOT NULL,
	[name] [nvarchar](255) NOT NULL,
	[description] [nvarchar](max) NULL,
	[capacity] [int] NOT NULL,
	[price] [decimal](10, 2) NOT NULL,
	[weeklyRate] [decimal](10, 2) NULL,
	[monthlyRate] [decimal](10, 2) NULL,
	[isResidential] [bit] NULL,
	[bedType] [nvarchar](100) NOT NULL,
	[viewType] [nvarchar](100) NOT NULL,
PRIMARY KEY CLUSTERED 
(
	[id] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
) ON [PRIMARY] TEXTIMAGE_ON [PRIMARY]
GO
/****** Object:  Table [dbo].[ServiceTypes]    Script Date: 6/6/2025 2:52:08 PM ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE TABLE [dbo].[ServiceTypes](
	[id] [int] IDENTITY(1,1) NOT NULL,
	[name] [nvarchar](100) NOT NULL,
	[description] [nvarchar](255) NULL,
PRIMARY KEY CLUSTERED 
(
	[id] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY],
UNIQUE NONCLUSTERED 
(
	[name] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
) ON [PRIMARY]
GO
/****** Object:  Table [dbo].[Users]    Script Date: 6/6/2025 2:52:08 PM ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE TABLE [dbo].[Users](
	[id] [int] IDENTITY(1,1) NOT NULL,
	[email] [nvarchar](255) NOT NULL,
	[passwordHash] [nvarchar](255) NOT NULL,
	[firstName] [nvarchar](100) NOT NULL,
	[lastName] [nvarchar](100) NOT NULL,
	[role] [nvarchar](50) NOT NULL,
	[createdAt] [datetime] NULL,
	[isActive] [bit] NOT NULL,
	[isEmailVerified] [bit] NOT NULL,
	[emailVerificationToken] [uniqueidentifier] NULL,
	[mustResetPassword] [bit] NOT NULL,
PRIMARY KEY CLUSTERED 
(
	[id] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY],
UNIQUE NONCLUSTERED 
(
	[email] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
) ON [PRIMARY]
GO
ALTER TABLE [dbo].[Agencies] ADD  DEFAULT (getdate()) FOR [createdAt]
GO
ALTER TABLE [dbo].[AssignedRooms] ADD  DEFAULT (getdate()) FOR [assignedAt]
GO
ALTER TABLE [dbo].[Customers] ADD  DEFAULT ('individual') FOR [customerType]
GO
ALTER TABLE [dbo].[HotelImages] ADD  DEFAULT (getdate()) FOR [createdAt]
GO
ALTER TABLE [dbo].[Hotels] ADD  DEFAULT (getdate()) FOR [createdAt]
GO
ALTER TABLE [dbo].[Invoices] ADD  DEFAULT (getdate()) FOR [invoiceDate]
GO
ALTER TABLE [dbo].[Invoices] ADD  DEFAULT ('unpaid') FOR [status]
GO
ALTER TABLE [dbo].[Payments] ADD  DEFAULT ((0.00)) FOR [changeReturned]
GO
ALTER TABLE [dbo].[Payments] ADD  DEFAULT (getdate()) FOR [paymentDate]
GO
ALTER TABLE [dbo].[ReservationPayments] ADD  DEFAULT (getdate()) FOR [createdAt]
GO
ALTER TABLE [dbo].[Reservations] ADD  DEFAULT (getdate()) FOR [createdAt]
GO
ALTER TABLE [dbo].[Reservations] ADD  DEFAULT ('pending') FOR [status]
GO
ALTER TABLE [dbo].[Users] ADD  DEFAULT (getdate()) FOR [createdAt]
GO
ALTER TABLE [dbo].[Users] ADD  DEFAULT ((1)) FOR [isActive]
GO
ALTER TABLE [dbo].[Users] ADD  DEFAULT ((0)) FOR [isEmailVerified]
GO
ALTER TABLE [dbo].[Users] ADD  DEFAULT ((0)) FOR [mustResetPassword]
GO
ALTER TABLE [dbo].[AssignedRooms]  WITH CHECK ADD FOREIGN KEY([reservationId])
REFERENCES [dbo].[Reservations] ([id])
ON DELETE CASCADE
GO
ALTER TABLE [dbo].[AssignedRooms]  WITH CHECK ADD FOREIGN KEY([roomId])
REFERENCES [dbo].[Rooms] ([id])
GO
ALTER TABLE [dbo].[Customers]  WITH CHECK ADD FOREIGN KEY([agencyId])
REFERENCES [dbo].[Agencies] ([id])
ON DELETE SET NULL
GO
ALTER TABLE [dbo].[Customers]  WITH CHECK ADD FOREIGN KEY([id])
REFERENCES [dbo].[Users] ([id])
ON DELETE CASCADE
GO
ALTER TABLE [dbo].[HotelImages]  WITH CHECK ADD FOREIGN KEY([hotelId])
REFERENCES [dbo].[Hotels] ([id])
ON DELETE CASCADE
GO
ALTER TABLE [dbo].[HotelUsers]  WITH CHECK ADD FOREIGN KEY([hotelId])
REFERENCES [dbo].[Hotels] ([id])
ON DELETE CASCADE
GO
ALTER TABLE [dbo].[HotelUsers]  WITH CHECK ADD FOREIGN KEY([userId])
REFERENCES [dbo].[Users] ([id])
ON DELETE CASCADE
GO
ALTER TABLE [dbo].[InvoiceLineItems]  WITH CHECK ADD FOREIGN KEY([invoiceId])
REFERENCES [dbo].[Invoices] ([id])
ON DELETE CASCADE
GO
ALTER TABLE [dbo].[InvoiceLineItems]  WITH CHECK ADD FOREIGN KEY([serviceTypeId])
REFERENCES [dbo].[ServiceTypes] ([id])
GO
ALTER TABLE [dbo].[Invoices]  WITH CHECK ADD FOREIGN KEY([reservationId])
REFERENCES [dbo].[Reservations] ([id])
ON DELETE CASCADE
GO
ALTER TABLE [dbo].[Payments]  WITH CHECK ADD FOREIGN KEY([invoiceId])
REFERENCES [dbo].[Invoices] ([id])
ON DELETE CASCADE
GO
ALTER TABLE [dbo].[ReservationPayments]  WITH CHECK ADD FOREIGN KEY([reservationId])
REFERENCES [dbo].[Reservations] ([id])
ON DELETE CASCADE
GO
ALTER TABLE [dbo].[Reservations]  WITH CHECK ADD FOREIGN KEY([customerId])
REFERENCES [dbo].[Customers] ([id])
GO
ALTER TABLE [dbo].[Reservations]  WITH CHECK ADD FOREIGN KEY([roomId])
REFERENCES [dbo].[Rooms] ([id])
GO
ALTER TABLE [dbo].[RoomImages]  WITH CHECK ADD FOREIGN KEY([imageId])
REFERENCES [dbo].[Images] ([id])
ON DELETE CASCADE
GO
ALTER TABLE [dbo].[RoomImages]  WITH CHECK ADD FOREIGN KEY([roomId])
REFERENCES [dbo].[Rooms] ([id])
ON DELETE CASCADE
GO
ALTER TABLE [dbo].[Rooms]  WITH CHECK ADD FOREIGN KEY([type])
REFERENCES [dbo].[RoomTypes] ([id])
GO
ALTER TABLE [dbo].[Rooms]  WITH CHECK ADD  CONSTRAINT [FK_Rooms_Hotels] FOREIGN KEY([hotelId])
REFERENCES [dbo].[Hotels] ([id])
ON DELETE CASCADE
GO
ALTER TABLE [dbo].[Rooms] CHECK CONSTRAINT [FK_Rooms_Hotels]
GO
ALTER TABLE [dbo].[RoomTypeAmenities]  WITH CHECK ADD FOREIGN KEY([amenitiesId])
REFERENCES [dbo].[Amenities] ([id])
ON DELETE CASCADE
GO
ALTER TABLE [dbo].[RoomTypeAmenities]  WITH CHECK ADD FOREIGN KEY([roomTypeId])
REFERENCES [dbo].[RoomTypes] ([id])
ON DELETE CASCADE
GO
ALTER TABLE [dbo].[RoomTypeImages]  WITH CHECK ADD FOREIGN KEY([imageId])
REFERENCES [dbo].[Images] ([id])
ON DELETE CASCADE
GO
ALTER TABLE [dbo].[RoomTypeImages]  WITH CHECK ADD FOREIGN KEY([roomTypeId])
REFERENCES [dbo].[RoomTypes] ([id])
ON DELETE CASCADE
GO
ALTER TABLE [dbo].[Customers]  WITH CHECK ADD CHECK  (([customerType]='agency' OR [customerType]='individual'))
GO
ALTER TABLE [dbo].[HotelUsers]  WITH CHECK ADD CHECK  (([role]='manager' OR [role]='clerk'))
GO
ALTER TABLE [dbo].[Invoices]  WITH CHECK ADD CHECK  (([paymentMethod]='credit_card' OR [paymentMethod]='cash'))
GO
ALTER TABLE [dbo].[Invoices]  WITH CHECK ADD CHECK  (([status]='paid' OR [status]='partially_paid' OR [status]='unpaid'))
GO
ALTER TABLE [dbo].[Payments]  WITH CHECK ADD CHECK  (([paymentMethod]='credit_card' OR [paymentMethod]='cash'))
GO
ALTER TABLE [dbo].[Reservations]  WITH CHECK ADD CHECK  (([status]='no-show' OR [status]='checked-out' OR [status]='checked-in' OR [status]='cancelled' OR [status]='confirmed' OR [status]='pending'))
GO
ALTER TABLE [dbo].[Rooms]  WITH CHECK ADD CHECK  (([status]='maintenance' OR [status]='available'))
GO
ALTER TABLE [dbo].[Users]  WITH CHECK ADD CHECK  (([role]='admin' OR [role]='manager' OR [role]='clerk' OR [role]='customer'))
GO
/****** Object:  StoredProcedure [dbo].[AssignUserToHotel]    Script Date: 6/6/2025 2:52:08 PM ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE   PROCEDURE [dbo].[AssignUserToHotel]
  @UserId INT,
  @HotelId INT
AS
BEGIN
  SET NOCOUNT ON;

  -- Check if user exists
  IF NOT EXISTS (SELECT 1 FROM Users WHERE id = @UserId)
  BEGIN
    RAISERROR('User not found.', 16, 1);
    RETURN;
  END

  -- Check if hotel exists
  IF NOT EXISTS (SELECT 1 FROM Hotels WHERE id = @HotelId)
  BEGIN
    RAISERROR('Hotel not found.', 16, 1);
    RETURN;
  END

  -- If already assigned, update it
  IF EXISTS (SELECT 1 FROM HotelUsers WHERE userId = @UserId)
  BEGIN
    UPDATE HotelUsers SET hotelId = @HotelId WHERE userId = @UserId;
  END
  ELSE
  BEGIN
    INSERT INTO HotelUsers (userId, hotelId, role)
    SELECT @UserId, @HotelId, role FROM Users WHERE id = @UserId;
  END

  SELECT 'Hotel assigned successfully.' AS message;
END;
GO
/****** Object:  StoredProcedure [dbo].[AutoCancelUnconfirmedReservations]    Script Date: 6/6/2025 2:52:08 PM ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE   PROCEDURE [dbo].[AutoCancelUnconfirmedReservations]
AS
BEGIN
    SET NOCOUNT ON;

    UPDATE Reservations
    SET status = 'cancelled'
    WHERE status = 'pending';
END;
GO
/****** Object:  StoredProcedure [dbo].[CancelReservation]    Script Date: 6/6/2025 2:52:08 PM ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE   PROCEDURE [dbo].[CancelReservation]
    @reservationId INT
AS
BEGIN
    SET NOCOUNT ON;

    DECLARE @checkInDate DATETIME;

    SELECT @checkInDate = checkInDate
    FROM Reservations
    WHERE id = @reservationId;

    IF @checkInDate IS NULL
    BEGIN
        RAISERROR('Reservation not found.', 16, 1);
        RETURN;
    END

    -- Block cancellation within 24 hours of check-in
    IF DATEDIFF(HOUR, GETDATE(), @checkInDate) < 24
    BEGIN
        RAISERROR('Cannot cancel reservation within 24 hours of check-in.', 16, 1);
        RETURN;
    END

    -- Mark the reservation as cancelled
    UPDATE Reservations
    SET status = 'cancelled'
    WHERE id = @reservationId;
END;
GO
/****** Object:  StoredProcedure [dbo].[CreateAdminUser]    Script Date: 6/6/2025 2:52:08 PM ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE   PROCEDURE [dbo].[CreateAdminUser]
  @Email NVARCHAR(255),
  @PasswordHash NVARCHAR(255),
  @FirstName NVARCHAR(255),
  @LastName NVARCHAR(255),
  @Role NVARCHAR(20)
AS
BEGIN
  SET NOCOUNT ON;

  IF EXISTS (SELECT 1 FROM Users WHERE email = @Email)
  BEGIN
    RAISERROR('User with this email already exists.', 16, 1);
    RETURN;
  END

  INSERT INTO Users (email, passwordHash, firstName, lastName, role, createdAt)
  VALUES (@Email, @PasswordHash, @FirstName, @LastName, @Role, GETDATE());

  DECLARE @NewUserId INT = SCOPE_IDENTITY();

  SELECT @NewUserId AS userId;
END;
GO
/****** Object:  StoredProcedure [dbo].[CreateCustomer]    Script Date: 6/6/2025 2:52:08 PM ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE   PROCEDURE [dbo].[CreateCustomer]
    @email NVARCHAR(255),
    @passwordHash NVARCHAR(255),
    @firstName NVARCHAR(100),
    @lastName NVARCHAR(100),
    @phone NVARCHAR(50),
    @homeTown NVARCHAR(50) = NULL,
    @customerType NVARCHAR(20) = 'individual',
    @agencyId INT = NULL,
    @agencyName NVARCHAR(255) = NULL,
    @agencyPhone NVARCHAR(50) = NULL
AS
BEGIN
    SET NOCOUNT ON;

    DECLARE @newUserId INT;
    DECLARE @finalAgencyId INT;

    -- If customerType is 'agency' and agencyId is NULL, create a new agency
    IF @customerType = 'agency' AND @agencyId IS NULL
    BEGIN
        INSERT INTO Agencies (name, phone)
        VALUES (@agencyName, @agencyPhone);

        SET @finalAgencyId = SCOPE_IDENTITY();
    END
    ELSE
    BEGIN
        SET @finalAgencyId = @agencyId;
    END

    -- Create user
    INSERT INTO Users (email, passwordHash, firstName, lastName, role)
    VALUES (@email, @passwordHash, @firstName, @lastName, 'customer');

    SET @newUserId = SCOPE_IDENTITY();

    -- Create customer
    INSERT INTO Customers (id, phone, homeTown, customerType, agencyId)
    VALUES (@newUserId, @phone, @homeTown, @customerType, @finalAgencyId);

    SELECT @newUserId AS customerId;
END
GO
/****** Object:  StoredProcedure [dbo].[CreateInvoiceAndCheckout]    Script Date: 6/6/2025 2:52:08 PM ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE   PROCEDURE [dbo].[CreateInvoiceAndCheckout]
    @ReservationId INT,
    @LineItems NVARCHAR(MAX),
    @PaymentMethod NVARCHAR(50),
    @DueDate DATETIME = NULL,
    @AmountPaid DECIMAL(10,2),
    @TransactionId NVARCHAR(255) = NULL
AS
BEGIN
    SET NOCOUNT ON;

    BEGIN TRY
        BEGIN TRANSACTION;

        -- Validate reservation
        IF NOT EXISTS (SELECT 1 FROM Reservations WHERE id = @ReservationId)
        BEGIN
            RAISERROR('Reservation not found.', 16, 1);
            ROLLBACK TRANSACTION;
            RETURN;
        END

        -- Validate payment method
        IF @PaymentMethod NOT IN ('cash', 'credit_card')
        BEGIN
            RAISERROR('Invalid payment method.', 16, 1);
            ROLLBACK TRANSACTION;
            RETURN;
        END

        -- Safely calculate total from JSON using TRY_CAST
        DECLARE @TotalAmount DECIMAL(10, 2) = (
            SELECT SUM(TRY_CAST([amount] AS DECIMAL(10,2)))
            FROM OPENJSON(@LineItems)
            WITH (amount NVARCHAR(50) '$.amount')
        );

        IF @TotalAmount IS NULL
        BEGIN
            RAISERROR('Failed to calculate total amount from line items.', 16, 1);
            ROLLBACK TRANSACTION;
            RETURN;
        END

        -- Insert into Invoices
        DECLARE @InvoiceId INT;
        INSERT INTO Invoices (reservationId, invoiceDate, dueDate, totalAmount, status, paymentMethod)
        VALUES (@ReservationId, GETDATE(), @DueDate, @TotalAmount, 'unpaid', @PaymentMethod);

        SET @InvoiceId = SCOPE_IDENTITY();

        -- Insert Line Items (still need to use TRY_CAST for amount here)
        INSERT INTO InvoiceLineItems (invoiceId, description, amount, serviceTypeId)
        SELECT
            @InvoiceId,
            [description],
            TRY_CAST([amount] AS DECIMAL(10,2)),
            [serviceTypeId]
        FROM OPENJSON(@LineItems)
        WITH (
            description NVARCHAR(255) '$.description',
            amount NVARCHAR(50) '$.amount',
            serviceTypeId INT '$.serviceTypeId'
        );

        -- Insert into Payments
        DECLARE @ChangeReturned DECIMAL(10,2) = CASE
            WHEN @AmountPaid > @TotalAmount THEN @AmountPaid - @TotalAmount
            ELSE 0.00
        END;

        INSERT INTO Payments (
            invoiceId,
            amountPaid,
            changeReturned,
            paymentMethod,
            transactionId
        )
        VALUES (
            @InvoiceId,
            @AmountPaid,
            @ChangeReturned,
            @PaymentMethod,
            @TransactionId
        );

        -- Call check-out SP
        EXEC UpdateReservationStatus @ReservationId, 'check-out';

        COMMIT TRANSACTION;

        SELECT * FROM Invoices WHERE id = @InvoiceId;
    END TRY
    BEGIN CATCH
        ROLLBACK TRANSACTION;

        DECLARE @ErrMsg NVARCHAR(4000), @ErrSeverity INT, @ErrState INT;
        SELECT
            @ErrMsg = ERROR_MESSAGE(),
            @ErrSeverity = ERROR_SEVERITY(),
            @ErrState = ERROR_STATE();
        RAISERROR(@ErrMsg, @ErrSeverity, @ErrState);
    END CATCH
END
GO
/****** Object:  StoredProcedure [dbo].[DeleteReservation]    Script Date: 6/6/2025 2:52:08 PM ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE   PROCEDURE [dbo].[DeleteReservation]
    @reservationId INT
AS
BEGIN
    SET NOCOUNT ON;

    DECLARE @checkInDate DATETIME;

    SELECT @checkInDate = checkInDate
    FROM Reservations
    WHERE id = @reservationId;

    IF @checkInDate IS NULL
    BEGIN
        RAISERROR('Reservation not found.', 16, 1);
        RETURN;
    END

    IF DATEDIFF(HOUR, GETDATE(), @checkInDate) < 24
    BEGIN
        RAISERROR('Cannot delete reservation within 24 hours of check-in.', 16, 1);
        RETURN;
    END

    -- Delete related records first (e.g. invoices, payments, etc.)
    DELETE FROM Payments WHERE invoiceId IN (
        SELECT id FROM Invoices WHERE reservationId = @reservationId
    );

    DELETE FROM InvoiceLineItems WHERE invoiceId IN (
        SELECT id FROM Invoices WHERE reservationId = @reservationId
    );

    DELETE FROM ReservationPayments WHERE reservationId = @reservationId;
    DELETE FROM Invoices WHERE reservationId = @reservationId;
    DELETE FROM AssignedRooms WHERE reservationId = @reservationId;

    -- Finally delete the reservation
    DELETE FROM Reservations WHERE id = @reservationId;
END;
GO
/****** Object:  StoredProcedure [dbo].[GenerateFinancialReport]    Script Date: 6/6/2025 2:52:08 PM ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE   PROCEDURE [dbo].[GenerateFinancialReport]
    @FromDate DATE,
    @ToDate DATE,
    @HotelId INT = NULL
AS
BEGIN
    SET NOCOUNT ON;

    -- Generate daily records
    WITH DateRange AS (
        SELECT CAST(@FromDate AS DATE) AS reportDate
        UNION ALL
        SELECT DATEADD(DAY, 1, reportDate)
        FROM DateRange
        WHERE reportDate < @ToDate
    )
    SELECT
        d.reportDate,
        ISNULL(SUM(CASE WHEN CAST(p.paymentDate AS DATE) = d.reportDate THEN p.amountPaid ELSE 0 END), 0) AS totalRevenue,
        ISNULL(SUM(CASE WHEN CAST(p.paymentDate AS DATE) = d.reportDate AND li.serviceTypeId IS NULL THEN li.amount ELSE 0 END), 0) AS roomRevenue,
        ISNULL(SUM(CASE WHEN CAST(p.paymentDate AS DATE) = d.reportDate AND li.serviceTypeId IS NOT NULL THEN li.amount ELSE 0 END), 0) AS serviceRevenue,
        CAST(
            CASE 
                WHEN COUNT(DISTINCT r.id) > 0 
                THEN SUM(CASE WHEN CAST(p.paymentDate AS DATE) = d.reportDate AND li.serviceTypeId IS NULL THEN li.amount ELSE 0 END) 
                     / COUNT(DISTINCT r.id)
                ELSE 0 
            END AS DECIMAL(10, 2)
        ) AS avgRoomRate
    FROM DateRange d
    LEFT JOIN Payments p ON CAST(p.paymentDate AS DATE) = d.reportDate
    LEFT JOIN Invoices i ON p.invoiceId = i.id
    LEFT JOIN Reservations r ON i.reservationId = r.id
    LEFT JOIN Rooms rm ON r.roomId = rm.id
    LEFT JOIN InvoiceLineItems li ON i.id = li.invoiceId
    WHERE (@HotelId IS NULL OR rm.hotelId = @HotelId)
    GROUP BY d.reportDate
    ORDER BY d.reportDate
    OPTION (MAXRECURSION 1000);

    -- Summary
    SELECT
        ISNULL(SUM(p.amountPaid), 0) AS totalRevenue,
        ISNULL(SUM(CASE WHEN li.serviceTypeId IS NULL THEN li.amount ELSE 0 END), 0) AS totalRoomRevenue,
        ISNULL(SUM(CASE WHEN li.serviceTypeId IS NOT NULL THEN li.amount ELSE 0 END), 0) AS totalServiceRevenue,
        CAST(
            SUM(p.amountPaid) * 1.0 / NULLIF(DATEDIFF(DAY, @FromDate, @ToDate) + 1, 0)
            AS DECIMAL(10,2)
        ) AS averageRevenue
    FROM Payments p
    LEFT JOIN Invoices i ON p.invoiceId = i.id
    LEFT JOIN Reservations r ON i.reservationId = r.id
    LEFT JOIN Rooms rm ON r.roomId = rm.id
    LEFT JOIN InvoiceLineItems li ON i.id = li.invoiceId
    WHERE CAST(p.paymentDate AS DATE) BETWEEN @FromDate AND @ToDate
      AND (@HotelId IS NULL OR rm.hotelId = @HotelId);
END;
GO
/****** Object:  StoredProcedure [dbo].[GenerateForecastOccupancyReport]    Script Date: 6/6/2025 2:52:08 PM ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
-- Stored Procedure: Forecast Report with historical occupancy & revenue forecasting
CREATE   PROCEDURE [dbo].[GenerateForecastOccupancyReport]
    @FromDate DATE,
    @ToDate DATE,
    @HotelId INT = NULL
AS
BEGIN
    SET NOCOUNT ON;

    DECLARE @MinHistoryDate DATE = DATEADD(MONTH, -3, @FromDate);

    -- Check if we have enough historical data
    IF NOT EXISTS (
        SELECT 1
        FROM Reservations r
        LEFT JOIN Rooms rm ON r.roomId = rm.id
        WHERE r.checkInDate BETWEEN @MinHistoryDate AND DATEADD(DAY, -1, @FromDate)
        AND (@HotelId IS NULL OR rm.hotelId = @HotelId)
    )
    BEGIN
        SELECT CAST(0 AS BIT) AS hasSufficientHistory;
        RETURN;
    END

    -- Generate forecast range
    ;WITH ForecastDates AS (
        SELECT @FromDate AS forecastDate
        UNION ALL
        SELECT DATEADD(DAY, 1, forecastDate)
        FROM ForecastDates
        WHERE forecastDate < @ToDate
    )
    SELECT
        fd.forecastDate,
        CAST(1 AS BIT) AS hasSufficientHistory,
        ISNULL(history.avgOccupancyRate, 0) AS forecastOccupancy,
        ISNULL(history.avgRatePerNight, 0) * ISNULL(history.avgOccupiedRooms, 0) AS projectedRevenue,
        ISNULL(reals.confirmedReservations, 0) AS confirmedReservations,
        ISNULL(history.totalRooms, 0) - ISNULL(reals.confirmedReservations, 0) AS availableRooms
    FROM ForecastDates fd
    OUTER APPLY (
        SELECT
            COUNT(*) AS totalRooms
        FROM Rooms rm
        WHERE (@HotelId IS NULL OR rm.hotelId = @HotelId)
    ) AS tr
    OUTER APPLY (
        SELECT
            COUNT(DISTINCT r.id) AS confirmedReservations
        FROM Reservations r
        LEFT JOIN Rooms rm ON r.roomId = rm.id
        WHERE r.checkInDate = fd.forecastDate
        AND r.status IN ('confirmed', 'checked-in')
        AND (@HotelId IS NULL OR rm.hotelId = @HotelId)
    ) AS reals
    OUTER APPLY (
        SELECT
            COUNT(DISTINCT r.id) * 1.0 / NULLIF(tr.totalRooms * 1.0, 0) * 100.0 AS avgOccupancyRate,
            AVG(DATEDIFF(DAY, r.checkInDate, r.checkOutDate)) AS avgNights,
            AVG(li.amount) AS avgRatePerNight,
            COUNT(DISTINCT r.id) AS avgOccupiedRooms,
            tr.totalRooms
        FROM Reservations r
        LEFT JOIN Rooms rm ON r.roomId = rm.id
        LEFT JOIN Invoices i ON r.id = i.reservationId
        LEFT JOIN InvoiceLineItems li ON i.id = li.invoiceId AND li.serviceTypeId IS NULL
        WHERE r.checkInDate BETWEEN @MinHistoryDate AND DATEADD(DAY, -1, @FromDate)
        AND DATENAME(WEEKDAY, r.checkInDate) = DATENAME(WEEKDAY, fd.forecastDate)
        AND r.status IN ('confirmed', 'checked-in', 'checked-out')
        AND (@HotelId IS NULL OR rm.hotelId = @HotelId)
    ) AS history
    OPTION (MAXRECURSION 1000);
END;
GO
/****** Object:  StoredProcedure [dbo].[GenerateNoShowReport]    Script Date: 6/6/2025 2:52:08 PM ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE   PROCEDURE [dbo].[GenerateNoShowReport]
    @FromDate DATE,
    @ToDate DATE,
    @HotelId INT = NULL
AS
BEGIN
    SET NOCOUNT ON;

    -- Generate a list of report dates
    WITH DateRange AS (
        SELECT @FromDate AS reportDate
        UNION ALL
        SELECT DATEADD(DAY, 1, reportDate)
        FROM DateRange
        WHERE reportDate < @ToDate
    )
    -- Daily breakdown
    SELECT
        d.reportDate,
        COUNT(DISTINCT r.id) AS totalReservations,
        COUNT(DISTINCT CASE WHEN r.status = 'no-show' THEN r.id END) AS noShows,
        ISNULL(
            CAST(
                COUNT(DISTINCT CASE WHEN r.status = 'no-show' THEN r.id END) * 100.0 /
                NULLIF(COUNT(DISTINCT r.id), 0)
                AS DECIMAL(5, 2)
            ),
            0
        ) AS noShowRate
    FROM DateRange d
    LEFT JOIN Reservations r ON r.checkInDate = d.reportDate
    LEFT JOIN Rooms rm ON r.roomId = rm.id
    LEFT JOIN Invoices i ON r.id = i.reservationId
    WHERE (@HotelId IS NULL OR rm.hotelId = @HotelId)
    GROUP BY d.reportDate
    ORDER BY d.reportDate
    OPTION (MAXRECURSION 1000);

    -- Summary totals
    SELECT
        COUNT(DISTINCT r.id) AS totalReservations,
        COUNT(DISTINCT CASE WHEN r.status = 'no-show' THEN r.id END) AS totalNoShows,
        ISNULL(
            CAST(
                COUNT(DISTINCT CASE WHEN r.status = 'no-show' THEN r.id END) * 100.0 /
                NULLIF(COUNT(DISTINCT r.id), 0)
                AS DECIMAL(5, 2)
            ),
            0
        ) AS averageNoShowRate
    FROM Reservations r
    LEFT JOIN Rooms rm ON r.roomId = rm.id
    LEFT JOIN Invoices i ON r.id = i.reservationId
    WHERE r.checkInDate BETWEEN @FromDate AND @ToDate
      AND (@HotelId IS NULL OR rm.hotelId = @HotelId);
END;
GO
/****** Object:  StoredProcedure [dbo].[GenerateOccupancyReport]    Script Date: 6/6/2025 2:52:08 PM ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE   PROCEDURE [dbo].[GenerateOccupancyReport]
    @FromDate DATE,
    @ToDate DATE,
    @HotelId INT = NULL
AS
BEGIN
    SET NOCOUNT ON;

    -- Generate the date range
    WITH DateRange AS (
        SELECT CAST(@FromDate AS DATE) AS reportDate
        UNION ALL
        SELECT DATEADD(DAY, 1, reportDate)
        FROM DateRange
        WHERE reportDate < @ToDate
    )
    SELECT
        d.reportDate,
        COUNT(DISTINCT r.id) AS reservations,
        COUNT(DISTINCT r.roomId) AS occupiedRooms,
        total.totalRooms,
        total.totalRooms - COUNT(DISTINCT r.roomId) AS availableRooms,
        CAST(
            COUNT(DISTINCT r.roomId) * 100.0 /
            NULLIF(total.totalRooms, 0)
            AS DECIMAL(5, 2)
        ) AS occupancyRate
    FROM DateRange d
    LEFT JOIN Reservations r
        ON d.reportDate BETWEEN r.checkInDate AND r.checkOutDate
        AND r.status IN ('confirmed', 'checked-in', 'checked-out')
        LEFT JOIN Rooms rm ON r.roomId = rm.id
    CROSS APPLY (
        SELECT COUNT(*) AS totalRooms
        FROM Rooms
        WHERE (@HotelId IS NULL OR hotelId = @HotelId)
    ) AS total
    WHERE (@HotelId IS NULL OR rm.hotelId = @HotelId)
    GROUP BY d.reportDate, total.totalRooms
    ORDER BY d.reportDate
    OPTION (MAXRECURSION 1000);
END;
GO
/****** Object:  StoredProcedure [dbo].[GenerateRevenueByRoomTypeReport]    Script Date: 6/6/2025 2:52:08 PM ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE   PROCEDURE [dbo].[GenerateRevenueByRoomTypeReport]
    @FromDate DATE,
    @ToDate DATE,
    @HotelId INT = NULL
AS
BEGIN
    SET NOCOUNT ON;

    SELECT
        rt.id AS roomTypeId,
        rt.name AS roomTypeName,
        COUNT(DISTINCT r.id) AS reservations,

        ISNULL(SUM(CASE 
            WHEN li.serviceTypeId IS NULL THEN li.amount
            ELSE 0
        END), 0) AS revenue,

        ISNULL((
            SELECT COUNT(*) 
            FROM Rooms rm2
            WHERE rm2.type = rt.id AND (@HotelId IS NULL OR rm2.hotelId = @HotelId)
        ), 0) AS totalRooms,

        ISNULL(
            CAST(
                SUM(DATEDIFF(DAY, r.checkInDate, r.checkOutDate)) * 100.0 /
                NULLIF((
                    SELECT COUNT(*) 
                    FROM Rooms rm2
                    WHERE rm2.type = rt.id AND (@HotelId IS NULL OR rm2.hotelId = @HotelId)
                ) * (DATEDIFF(DAY, @FromDate, @ToDate) + 1), 0)
                AS DECIMAL(5, 2)
            ),
        0) AS occupancyRate,

        ISNULL(
            CAST(
                SUM(CASE 
                    WHEN li.serviceTypeId IS NULL THEN li.amount
                    ELSE 0
                END) * 1.0 /
                NULLIF(COUNT(DISTINCT r.id), 0)
                AS DECIMAL(10, 2)
            ),
        0) AS averageRatePerNight

    FROM RoomTypes rt
    LEFT JOIN Rooms rm ON rm.type = rt.id
    LEFT JOIN Reservations r 
        ON r.roomId = rm.id 
        AND r.status IN ('confirmed', 'checked-in', 'checked-out')
        AND r.checkInDate BETWEEN @FromDate AND @ToDate
    LEFT JOIN Invoices i ON r.id = i.reservationId
    LEFT JOIN InvoiceLineItems li ON li.invoiceId = i.id
    WHERE (@HotelId IS NULL OR rm.hotelId = @HotelId)
    GROUP BY rt.id, rt.name
    ORDER BY rt.id;
END;
GO
/****** Object:  StoredProcedure [dbo].[GetAdminUsers]    Script Date: 6/6/2025 2:52:08 PM ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE   PROCEDURE [dbo].[GetAdminUsers]
    @page INT = 1,
    @pageSize INT = 10,
    @search NVARCHAR(255) = NULL,
    @role NVARCHAR(50) = NULL,
    @hotelId INT = NULL,
    @orderBy NVARCHAR(50) = 'createdAt',
    @orderDir NVARCHAR(4) = 'DESC'
AS
BEGIN
    SET NOCOUNT ON;

    DECLARE @offset INT = (@page - 1) * @pageSize;

    -- Base query
    WITH StaffData AS (
        SELECT
            U.id,
            U.email,
            U.firstName,
            U.lastName,
            U.role,
            U.createdAt,
            U.isActive,
            HU.hotelId,
            H.name AS hotelName,
            COUNT(*) OVER() AS TotalCount
        FROM Users U
        LEFT JOIN HotelUsers HU ON U.id = HU.userId
        LEFT JOIN Hotels H ON HU.hotelId = H.id
        WHERE
            U.role IN ('clerk','manager','admin')
            AND (@role IS NULL OR U.role = @role)
            AND (@search IS NULL OR
                 LOWER(U.firstName) LIKE '%' + LOWER(@search) + '%' OR
                 LOWER(U.lastName) LIKE '%' + LOWER(@search) + '%' OR
                 LOWER(U.email) LIKE '%' + LOWER(@search) + '%' OR
                 LOWER(H.name) LIKE '%' + LOWER(@search) + '%')
            AND (@hotelId IS NULL OR HU.hotelId = @hotelId)
    )
    SELECT *
    FROM StaffData
    ORDER BY
        CASE WHEN @orderBy = 'createdAt' AND @orderDir = 'ASC' THEN createdAt END ASC,
        CASE WHEN @orderBy = 'createdAt' AND @orderDir = 'DESC' THEN createdAt END DESC,
        CASE WHEN @orderBy = 'firstName' AND @orderDir = 'ASC' THEN firstName END ASC,
        CASE WHEN @orderBy = 'firstName' AND @orderDir = 'DESC' THEN firstName END DESC
    OFFSET @offset ROWS FETCH NEXT @pageSize ROWS ONLY;
END
GO
/****** Object:  StoredProcedure [dbo].[GetAllCustomersAdmin]    Script Date: 6/6/2025 2:52:08 PM ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
-- STEP 1: STORED PROCEDURE
CREATE   PROCEDURE [dbo].[GetAllCustomersAdmin]
    @page INT = 1,
    @pageSize INT = 10,
    @search NVARCHAR(255) = NULL,
    @customerType NVARCHAR(20) = NULL,
    @orderBy NVARCHAR(50) = 'createdAt',
    @orderDir NVARCHAR(4) = 'DESC'
AS
BEGIN
    SET NOCOUNT ON;

    DECLARE @offset INT = (@page - 1) * @pageSize;

    -- Base query
    WITH CustomerData AS (
        SELECT
            U.id AS userId,
            U.email,
            U.firstName,
            U.lastName,
            U.role,
            U.createdAt,
            U.isActive,
            C.id AS customerId,
            C.phone,
            C.homeTown,
            C.customerType,
            C.agencyId,
            A.name AS agencyName,
            A.phone AS agencyPhone,
            COUNT(*) OVER () AS TotalCount
        FROM Users U
        INNER JOIN Customers C ON U.id = C.id
        LEFT JOIN Agencies A ON C.agencyId = A.id
        WHERE
            (@search IS NULL OR 
             U.firstName LIKE '%' + @search + '%' OR
             U.lastName LIKE '%' + @search + '%' OR
             U.email LIKE '%' + @search + '%' OR
             A.name LIKE '%' + @search + '%')
            AND (@customerType IS NULL OR C.customerType = @customerType)
    )
    SELECT *
    FROM CustomerData
    ORDER BY
        CASE WHEN @orderBy = 'createdAt' AND @orderDir = 'ASC' THEN createdAt END ASC,
        CASE WHEN @orderBy = 'createdAt' AND @orderDir = 'DESC' THEN createdAt END DESC
    OFFSET @offset ROWS FETCH NEXT @pageSize ROWS ONLY;
END
GO
/****** Object:  StoredProcedure [dbo].[GetAllHotels]    Script Date: 6/6/2025 2:52:08 PM ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE   PROCEDURE [dbo].[GetAllHotels]
AS
BEGIN
    SET NOCOUNT ON;

    SELECT 
        id,
        name,
        location,
        description,
        mapUrl,
        logoUrl,
        createdAt
    FROM Hotels
    ORDER BY createdAt DESC;
END;
GO
/****** Object:  StoredProcedure [dbo].[GetAllReservationsForAdmin]    Script Date: 6/6/2025 2:52:08 PM ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE   PROCEDURE [dbo].[GetAllReservationsForAdmin]
    @page INT = 1,
    @pageSize INT = 10,
    @search NVARCHAR(255) = NULL,
    @hotelId INT = NULL,
    @status NVARCHAR(50) = NULL,
    @fromDate DATE = NULL,
    @toDate DATE = NULL,
    @orderBy NVARCHAR(50) = 'checkInDate',
    @orderDir NVARCHAR(4) = 'DESC'
AS
BEGIN
    SET NOCOUNT ON;

    DECLARE @offset INT = (@page - 1) * @pageSize;

    SELECT 
        R.id,
        R.customerId,
        R.roomId,
        R.checkInDate AS checkIn,
        R.checkOutDate AS checkOut,
        R.numberOfGuests AS guests,
        R.status,
        U.firstName AS firstName,
        U.lastName AS lastName,
        U.email AS email,
        -- Return 'paid' if invoice exists, otherwise 'unpaid'
        CASE 
            WHEN i.id IS NOT NULL THEN 'paid'
            ELSE 'unpaid'
        END AS paymentStatus,
        I.paymentMethod,
        ISNULL(I.totalAmount, DATEDIFF(DAY, R.checkInDate, R.checkOutDate) * RT.price) AS totalAmount,
        R.specialRequests,
        R.createdAt,
        Room.name AS roomName,
        RT.name AS roomType,
        (
            SELECT COUNT(*) 
            FROM Reservations R2
            INNER JOIN Rooms Room2 ON R2.roomId = Room2.id
            INNER JOIN RoomTypes RT2 ON Room2.type = RT2.id
            INNER JOIN Customers C2 ON R2.customerId = C2.id
            INNER JOIN Users U2 ON C2.id = U2.id
            WHERE 
                (@search IS NULL OR
                 CAST(R2.id AS NVARCHAR) LIKE '%' + @search + '%' OR
                 U2.firstName + ' ' + U2.lastName LIKE '%' + @search + '%' OR
                 U2.email LIKE '%' + @search + '%')
                AND (@hotelId IS NULL OR Room2.hotelId = @hotelId)
                AND (@status IS NULL OR R2.status = @status)
                AND (@fromDate IS NULL OR R2.checkInDate >= @fromDate)
                AND (@toDate IS NULL OR R2.checkOutDate <= @toDate)
        ) AS totalCount
    FROM Reservations R
    INNER JOIN Rooms Room ON R.roomId = Room.id
    INNER JOIN RoomTypes RT ON Room.type = RT.id
    INNER JOIN Customers C ON R.customerId = C.id
    INNER JOIN Users U ON C.id = U.id
    LEFT JOIN Invoices I ON I.reservationId = R.id
    WHERE 
        (@search IS NULL OR
         CAST(R.id AS NVARCHAR) LIKE '%' + @search + '%' OR
         U.firstName + ' ' + U.lastName LIKE '%' + @search + '%' OR
         U.email LIKE '%' + @search + '%')
        AND (@hotelId IS NULL OR Room.hotelId = @hotelId)
        AND (@status IS NULL OR R.status = @status)
        AND (@fromDate IS NULL OR R.checkInDate >= @fromDate)
        AND (@toDate IS NULL OR R.checkOutDate <= @toDate)
    ORDER BY 
        CASE WHEN @orderBy = 'checkInDate' AND @orderDir = 'ASC' THEN R.checkInDate END ASC,
        CASE WHEN @orderBy = 'checkInDate' AND @orderDir = 'DESC' THEN R.checkInDate END DESC
    OFFSET @offset ROWS
    FETCH NEXT @pageSize ROWS ONLY;
END;
GO
/****** Object:  StoredProcedure [dbo].[GetAllRoomTypes]    Script Date: 6/6/2025 2:52:08 PM ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE   PROCEDURE [dbo].[GetAllRoomTypes]
AS
BEGIN
    SET NOCOUNT ON;

    SELECT
        id,
        name,
        description,
        capacity,
        price,
        weeklyRate,
        monthlyRate,
        isResidential,
        bedType,
        viewType
    FROM RoomTypes
    ORDER BY id;
END;
GO
/****** Object:  StoredProcedure [dbo].[GetAmenitiesByRoomTypeId]    Script Date: 6/6/2025 2:52:08 PM ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE   PROCEDURE [dbo].[GetAmenitiesByRoomTypeId]
    @RoomTypeId INT
AS
BEGIN
    SET NOCOUNT ON;

    SELECT A.id, A.amenity as name
    FROM RoomTypeAmenities RTA
    INNER JOIN Amenities A ON RTA.amenitiesId = A.id
    WHERE RTA.roomTypeId = @RoomTypeId
    ORDER BY A.amenity;
END;
GO
/****** Object:  StoredProcedure [dbo].[GetAssignedHotelIdByUserId]    Script Date: 6/6/2025 2:52:08 PM ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE   PROCEDURE [dbo].[GetAssignedHotelIdByUserId]
    @UserId INT
AS
BEGIN
    SET NOCOUNT ON;

    SELECT
        hotelId
    FROM HotelUsers
    WHERE userId = @UserId;
END;
GO
/****** Object:  StoredProcedure [dbo].[GetAvailableRoomsByType]    Script Date: 6/6/2025 2:52:08 PM ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE   PROCEDURE [dbo].[GetAvailableRoomsByType]
    @roomTypeId INT,
    @checkIn DATE = NULL,
    @checkOut DATE = NULL
AS
BEGIN
    SET NOCOUNT ON;

    DECLARE @effectiveCheckIn DATE = ISNULL(@checkIn, CAST(GETDATE() AS DATE));
    DECLARE @effectiveCheckOut DATE = ISNULL(@checkOut, DATEADD(DAY, 1, @effectiveCheckIn));

    SELECT 
        R.id,
        R.name,
        R.description,
        R.status,
        R.type,
        R.bedType,
        R.viewType
    FROM Rooms R
    WHERE 
        R.status = 'available'
        AND R.type = @roomTypeId
        AND NOT EXISTS (
            SELECT 1
            FROM Reservations Res
            WHERE Res.roomId = R.id
              AND Res.status IN ('pending', 'confirmed', 'checked-in')
              AND (@effectiveCheckIn < Res.checkOutDate AND @effectiveCheckOut > Res.checkInDate)
        )
    ORDER BY R.id;
END;
GO
/****** Object:  StoredProcedure [dbo].[GetAvailableRoomsWithFilters]    Script Date: 6/6/2025 2:52:08 PM ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE   PROCEDURE [dbo].[GetAvailableRoomsWithFilters]
    @checkIn DATE = NULL,
    @checkOut DATE = NULL,
    @type INT = NULL,
    @capacity INT = NULL,
    @minPrice DECIMAL(10, 2) = NULL,
    @maxPrice DECIMAL(10, 2) = NULL,
    @hotelId INT = NULL
AS
BEGIN
    SET NOCOUNT ON;

    SELECT 
        R.id,
        R.name,
        R.description,
        R.status,
        R.type,
        R.hotelId,
        R.bedType,
        R.viewType,
        RT.name AS roomTypeName,
        RT.description AS roomTypeDescription,
        RT.capacity,
        RT.price,
        RT.weeklyRate,
        RT.monthlyRate,
        RT.isResidential,

        -- Show isReserved only if no filters are applied
        CASE 
            WHEN 
                @checkIn IS NULL AND @checkOut IS NULL AND
                @type IS NULL AND @capacity IS NULL AND
                @minPrice IS NULL AND @maxPrice IS NULL AND
                @hotelId IS NULL
            THEN 
                CASE 
                    WHEN EXISTS (
                        SELECT 1 FROM Reservations Res
                        WHERE Res.roomId = R.id
                        AND Res.status IN ('pending', 'confirmed', 'checked-in')
                    )
                    THEN 1 ELSE 0
                END
            ELSE NULL
        END AS isReserved

    FROM Rooms R
    INNER JOIN RoomTypes RT ON R.type = RT.id

    WHERE
        (
            -- No filters: include all room statuses
            @checkIn IS NULL AND @checkOut IS NULL AND
            @type IS NULL AND @capacity IS NULL AND
            @minPrice IS NULL AND @maxPrice IS NULL AND
            @hotelId IS NULL
        )
        OR
        (
            -- Filters are applied: restrict to only 'available' rooms
            R.status = 'available'
        )

        -- If check-in and check-out are provided, exclude rooms with overlapping reservations
        AND (
            @checkIn IS NULL OR @checkOut IS NULL OR
            NOT EXISTS (
                SELECT 1
                FROM Reservations Res
                WHERE Res.roomId = R.id
                AND Res.status IN ('pending', 'confirmed', 'checked-in')
                AND (@checkIn < Res.checkOutDate AND @checkOut > Res.checkInDate)
            )
        )

        -- Optional filters
        AND (@type IS NULL OR R.type = @type)
        AND (@capacity IS NULL OR RT.capacity >= @capacity)
        AND (@minPrice IS NULL OR RT.price >= @minPrice)
        AND (@maxPrice IS NULL OR RT.price <= @maxPrice)
        AND (@hotelId IS NULL OR R.hotelId = @hotelId)

    ORDER BY RT.price ASC;
END;
GO
/****** Object:  StoredProcedure [dbo].[GetDashboardStats]    Script Date: 6/6/2025 2:52:08 PM ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE   PROCEDURE [dbo].[GetDashboardStats]
    @Date DATE,
    @HotelId INT = NULL
AS
BEGIN
    SET NOCOUNT ON;

    DECLARE @Yesterday DATE = DATEADD(DAY, -1, @Date);

    -- Total and available room counts (using table variables instead of SELECT INTO)
    DECLARE @TotalRooms INT = (
        SELECT COUNT(*) FROM Rooms WHERE @HotelId IS NULL OR hotelId = @HotelId
    );

    DECLARE @AvailableRooms INT = (
        SELECT COUNT(*) FROM Rooms WHERE status = 'available' AND (@HotelId IS NULL OR hotelId = @HotelId)
    );

    -- Main stats
    SELECT
        CAST((
            SELECT COUNT(*) 
            FROM Reservations r
            JOIN Rooms rm ON r.roomId = rm.id
            WHERE r.status = 'checked-in' AND r.checkInDate = @Date AND (@HotelId IS NULL OR rm.hotelId = @HotelId)
        ) * 100.0 / NULLIF(@TotalRooms, 0) AS DECIMAL(5, 2)) AS occupancyRateToday,

        CAST((
            SELECT COUNT(*) 
            FROM Reservations r
            JOIN Rooms rm ON r.roomId = rm.id
            WHERE r.status = 'checked-in' AND r.checkInDate = @Yesterday AND (@HotelId IS NULL OR rm.hotelId = @HotelId)
        ) * 100.0 / NULLIF(@TotalRooms, 0) AS DECIMAL(5, 2)) AS occupancyRateYesterday,

        ISNULL((
            SELECT SUM(totalAmount)
            FROM Invoices i
            JOIN Reservations r ON i.reservationId = r.id
            JOIN Rooms rm ON r.roomId = rm.id
            WHERE CAST(i.invoiceDate AS DATE) = @Date AND (@HotelId IS NULL OR rm.hotelId = @HotelId)
        ), 0.00) AS revenueToday,

        ISNULL((
            SELECT SUM(totalAmount)
            FROM Invoices i
            JOIN Reservations r ON i.reservationId = r.id
            JOIN Rooms rm ON r.roomId = rm.id
            WHERE CAST(i.invoiceDate AS DATE) = @Yesterday AND (@HotelId IS NULL OR rm.hotelId = @HotelId)
        ), 0.00) AS revenueYesterday,

        @AvailableRooms AS availableRooms,
        @TotalRooms AS totalRooms,

        -- Check-ins for today (confirmed but not yet checked-in)
        (
            SELECT COUNT(*)
            FROM Reservations r
            JOIN Rooms rm ON r.roomId = rm.id
            WHERE r.checkInDate = @Date AND r.status = 'confirmed' AND (@HotelId IS NULL OR rm.hotelId = @HotelId)
        ) AS todayCheckIns,

        -- Check-outs for today (currently checked-in guests leaving today)
        (
            SELECT COUNT(*)
            FROM Reservations r
            JOIN Rooms rm ON r.roomId = rm.id
            WHERE r.checkOutDate = @Date AND r.status = 'checked-in' AND (@HotelId IS NULL OR rm.hotelId = @HotelId)
        ) AS todayCheckOuts;
END;
GO
/****** Object:  StoredProcedure [dbo].[GetImagesByRoomTypeId]    Script Date: 6/6/2025 2:52:08 PM ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE   PROCEDURE [dbo].[GetImagesByRoomTypeId]
    @RoomTypeId INT
AS
BEGIN
    SET NOCOUNT ON;

    SELECT I.id, I.imageUrl as url
    FROM RoomTypeImages RTI
    INNER JOIN Images I ON RTI.imageId = I.id
    WHERE RTI.roomTypeId = @RoomTypeId
    ORDER BY I.id;
END;
GO
/****** Object:  StoredProcedure [dbo].[GetReservationById]    Script Date: 6/6/2025 2:52:08 PM ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE   PROCEDURE [dbo].[GetReservationById]
    @reservationId INT
AS
BEGIN
    SET NOCOUNT ON;

    DECLARE @invoiceId INT;
    SELECT @invoiceId = id FROM Invoices WHERE reservationId = @reservationId;

    -- Reservation details
    SELECT 
        r.id,
        r.customerId,
        r.roomId,
        r.checkInDate AS checkIn,
        r.checkOutDate AS checkOut,
        r.numberOfGuests AS guests,
        r.status,
        ISNULL(i.status, 'unpaid') AS paymentStatus,
        ISNULL(i.paymentMethod, 'cash') AS paymentMethod,
        ISNULL(i.totalAmount, DATEDIFF(DAY, r.checkInDate, r.checkOutDate) * rt.price) AS totalAmount,
        r.specialRequests,
        r.createdAt,
        rm.name AS roomName,
        rt.name AS roomType,
        u.firstName,
        u.lastName,
        u.email,
        c.phone,
        rp.cardHolderName,
        rp.maskedCardNumber,
        rp.cardType,
        rp.expiryMonth,
        rp.expiryYear
    FROM Reservations r
    INNER JOIN Rooms rm ON r.roomId = rm.id
    INNER JOIN RoomTypes rt ON rm.type = rt.id
    INNER JOIN Customers c ON r.customerId = c.id
    INNER JOIN Users u ON c.id = u.id
    LEFT JOIN Invoices i ON i.reservationId = r.id
    LEFT JOIN ReservationPayments rp ON rp.reservationId = r.id
    WHERE r.id = @reservationId;

    -- Additional charges (only if invoice exists)
    IF @invoiceId IS NOT NULL
    BEGIN
        SELECT 
            ili.id,
            ili.description,
            ili.amount,
            ili.serviceTypeId,
            st.name AS serviceType
        FROM InvoiceLineItems ili
        INNER JOIN ServiceTypes st ON ili.serviceTypeId = st.id
        WHERE ili.invoiceId = @invoiceId
          AND ili.serviceTypeId IS NOT NULL;
    END
    ELSE
    BEGIN
        -- Return empty result set
        SELECT 
            CAST(NULL AS INT) AS id,
            CAST(NULL AS NVARCHAR(255)) AS description,
            CAST(NULL AS DECIMAL(10,2)) AS amount,
            CAST(NULL AS INT) AS serviceTypeId,
            CAST(NULL AS NVARCHAR(255)) AS serviceType
        WHERE 1 = 0;
    END
END;
GO
/****** Object:  StoredProcedure [dbo].[GetRoomDetailsById]    Script Date: 6/6/2025 2:52:08 PM ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE   PROCEDURE [dbo].[GetRoomDetailsById]
    @roomId INT
AS
BEGIN
    SET NOCOUNT ON;

    SELECT 
        R.id,
        R.name,
        R.description,
        R.status,
        R.type,
        R.bedType,
        R.viewType,
        RT.name AS roomTypeName,
        RT.description AS roomTypeDescription,
        RT.capacity,
        RT.price,
        RT.weeklyRate,
        RT.monthlyRate,
        RT.isResidential
    FROM Rooms R
    INNER JOIN RoomTypes RT ON R.type = RT.id
    WHERE R.id = @roomId;
END;
GO
/****** Object:  StoredProcedure [dbo].[GetRoomImages]    Script Date: 6/6/2025 2:52:08 PM ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE PROCEDURE [dbo].[GetRoomImages]
    @roomId INT
AS
BEGIN
    SET NOCOUNT ON;

    SELECT 
        I.id,
        I.imageUrl as url
    FROM RoomImages RI
    INNER JOIN Images I ON RI.imageId = I.id
    WHERE RI.roomId = @roomId;
END;
GO
/****** Object:  StoredProcedure [dbo].[GetRoomTypeById]    Script Date: 6/6/2025 2:52:08 PM ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE   PROCEDURE [dbo].[GetRoomTypeById]
    @RoomTypeId INT
AS
BEGIN
    SET NOCOUNT ON;

    SELECT
        id,
        name,
        description,
        capacity,
        price,
        weeklyRate,
        monthlyRate,
        isResidential,
        bedType,
        viewType
    FROM RoomTypes
    WHERE id = @RoomTypeId;
END;
GO
/****** Object:  StoredProcedure [dbo].[GetUserById]    Script Date: 6/6/2025 2:52:08 PM ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE   PROCEDURE [dbo].[GetUserById]
    @userId INT
AS
BEGIN
    SET NOCOUNT ON;

    SELECT 
        u.id,
        u.email,
        u.role,
        u.firstName,
        u.lastName,
        u.createdAt,
        c.phone,
        c.homeTown
    FROM Users u
    INNER JOIN Customers c ON u.id = c.id
    WHERE c.id = @userId;
END;
GO
/****** Object:  StoredProcedure [dbo].[GetUserReservationsPaginated]    Script Date: 6/6/2025 2:52:08 PM ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE   PROCEDURE [dbo].[GetUserReservationsPaginated]
    @userId INT,
    @page INT = 1,
    @pageSize INT = 10
AS
BEGIN
    SET NOCOUNT ON;

    DECLARE @offset INT = (@page - 1) * @pageSize;

    SELECT 
        r.id,
        r.customerId,
        r.roomId,
        r.checkInDate AS checkIn,
        r.checkOutDate AS checkOut,
        r.numberOfGuests AS guests,
        r.status,

        -- Return 'paid' if invoice exists, otherwise 'unpaid'
        CASE 
            WHEN i.id IS NOT NULL THEN 'paid'
            ELSE 'unpaid'
        END AS paymentStatus,

        ISNULL(i.paymentMethod, 'cash') AS paymentMethod,
        ISNULL(i.totalAmount, 0.00) AS totalAmount,

        r.specialRequests,
        r.createdAt,

        -- Additional fields
        rm.name AS roomName,
        rt.name AS roomType

    FROM Reservations r
    INNER JOIN Rooms rm ON r.roomId = rm.id
    INNER JOIN RoomTypes rt ON rm.type = rt.id
    LEFT JOIN Invoices i ON i.reservationId = r.id

    WHERE r.customerId = @userId
    ORDER BY r.createdAt DESC
    OFFSET @offset ROWS FETCH NEXT @pageSize ROWS ONLY;
END;
GO
/****** Object:  StoredProcedure [dbo].[IsRoomAvailable]    Script Date: 6/6/2025 2:52:08 PM ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE   PROCEDURE [dbo].[IsRoomAvailable]
    @roomId INT,
    @checkIn DATE = NULL,
    @checkOut DATE = NULL,
    @userId INT = NULL
AS
BEGIN
    SET NOCOUNT ON;

    -- Use current date and +1 day if not provided
    DECLARE @effectiveCheckIn DATE = ISNULL(@checkIn, CAST(GETDATE() AS DATE));
    DECLARE @effectiveCheckOut DATE = ISNULL(@checkOut, DATEADD(DAY, 1, @effectiveCheckIn));

    -- Room must not be reserved in the given time frame,
    -- unless the reservation belongs to the current user
    IF EXISTS (
        SELECT 1
        FROM Reservations
        WHERE roomId = @roomId
        AND status IN ('pending', 'confirmed', 'checked-in')
        AND (@effectiveCheckIn < checkOutDate AND @effectiveCheckOut > checkInDate)
        AND (@userId IS NULL OR customerId <> @userId)
    )
    BEGIN
        SELECT CAST(0 AS BIT) AS isAvailable;
    END
    ELSE
    BEGIN
        SELECT CAST(1 AS BIT) AS isAvailable;
    END
END;
GO
/****** Object:  StoredProcedure [dbo].[LoginUser]    Script Date: 6/6/2025 2:52:08 PM ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE   PROCEDURE [dbo].[LoginUser]
    @Email NVARCHAR(255)
AS
BEGIN
    SET NOCOUNT ON;

    SELECT 
        -- User
        U.id AS id,
        U.email,
        U.firstName,
        U.lastName,
        U.role,
        U.createdAt,
        U.isActive,
        U.isEmailVerified,
        U.mustResetPassword,
        U.passwordHash,

        -- Customer (nullable)
        C.id AS customerId,
        C.phone,
        C.homeTown,
        C.customerType,
        C.agencyId,

        -- Agency (nullable)
        A.id AS agencyId,
        A.name AS agencyName,
        A.phone AS agencyPhone,
        A.createdAt AS agencyCreatedAt,

        -- HotelUser (nullable)
        HU.id AS hotelUserId,
        HU.hotelId,
        H.name AS hotelName

    FROM Users U
    LEFT JOIN Customers C ON U.id = C.id
    LEFT JOIN Agencies A ON C.agencyId = A.id
    LEFT JOIN HotelUsers HU ON U.id = HU.userId
    LEFT JOIN Hotels H ON HU.hotelId = H.id
    WHERE U.email = @Email;
END;
GO
/****** Object:  StoredProcedure [dbo].[MarkReservationsAsNoShowAndInvoice]    Script Date: 6/6/2025 2:52:08 PM ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE   PROCEDURE [dbo].[MarkReservationsAsNoShowAndInvoice]
AS
BEGIN
    SET NOCOUNT ON;

    DECLARE @Now DATETIME = GETDATE();

    BEGIN TRY
        BEGIN TRANSACTION;

        -- Step 1: Identify all applicable reservations and compute amount
        WITH ToProcess AS (
            SELECT
                r.id AS reservationId,
                r.customerId,
                r.roomId,
                DATEDIFF(DAY, r.checkInDate, r.checkOutDate) AS nights,
                rt.price,
                DATEDIFF(DAY, r.checkInDate, r.checkOutDate) * rt.price AS amount
            FROM Reservations r
            INNER JOIN Rooms ro ON r.roomId = ro.id
            INNER JOIN RoomTypes rt ON ro.type = rt.id
            WHERE
                r.status = 'confirmed'
                AND r.checkInDate = CAST(@Now AS DATE)
        )

        -- Step 2: Mark reservations as no-show
        UPDATE r
        SET r.status = 'no-show'
        FROM Reservations r
        INNER JOIN ToProcess tp ON r.id = tp.reservationId;

        -- Step 3: Insert invoices and capture generated invoice IDs
        DECLARE @InvoiceTable TABLE (
            invoiceId INT,
            reservationId INT,
            amount DECIMAL(10,2)
        );

        INSERT INTO Invoices (reservationId, invoiceDate, totalAmount, status)
        OUTPUT inserted.id, inserted.reservationId, inserted.totalAmount
        INTO @InvoiceTable (invoiceId, reservationId, amount)
        SELECT
            tp.reservationId,
            @Now,
            tp.amount,
            'unpaid'
        FROM ToProcess tp;

        -- Step 4: Insert invoice line items
        INSERT INTO InvoiceLineItems (invoiceId, description, amount)
        SELECT
            it.invoiceId,
            'Room charges for ' +
            CAST(tp.nights AS NVARCHAR) + ' nights (No-show)',
            it.amount
        FROM @InvoiceTable it
        JOIN ToProcess tp ON it.reservationId = tp.reservationId;

        COMMIT TRANSACTION;
    END TRY
    BEGIN CATCH
        ROLLBACK TRANSACTION;
        THROW;
    END CATCH
END
GO
/****** Object:  StoredProcedure [dbo].[RegisterUser]    Script Date: 6/6/2025 2:52:08 PM ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE   PROCEDURE [dbo].[RegisterUser]
    @Email NVARCHAR(255),
    @PasswordHash NVARCHAR(255),
    @FirstName NVARCHAR(100),
    @LastName NVARCHAR(100),
    @Role NVARCHAR(50),
    @Phone NVARCHAR(50),
    @HomeTown NVARCHAR(50) = NULL,
    @VerificationToken UNIQUEIDENTIFIER
AS
BEGIN
    SET NOCOUNT ON;

    IF EXISTS (SELECT 1 FROM Users WHERE email = @Email)
    BEGIN
        RAISERROR('Email already registered.', 16, 1);
        RETURN;
    END

    BEGIN TRANSACTION;

    BEGIN TRY
        INSERT INTO Users (email, passwordHash, firstName, lastName, role, emailVerificationToken, isEmailVerified)
        VALUES (@Email, @PasswordHash, @FirstName, @LastName, @Role, @VerificationToken, 0);

        DECLARE @UserId INT = SCOPE_IDENTITY();

        IF @Role = 'customer'
        BEGIN
            INSERT INTO Customers (id, phone, homeTown)
            VALUES (@UserId, @Phone, @HomeTown);
        END

        COMMIT;
        SELECT @UserId AS userId;
    END TRY
    BEGIN CATCH
        ROLLBACK;
        THROW;
    END CATCH
END;
GO
/****** Object:  StoredProcedure [dbo].[ReserveRoom]    Script Date: 6/6/2025 2:52:08 PM ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE   PROCEDURE [dbo].[ReserveRoom]
    @customerId INT,
    @roomId INT,
    @checkInDate DATE,
    @checkOutDate DATE,
    @numberOfGuests INT,
    @specialRequests NVARCHAR(500) = NULL
AS
BEGIN
    SET NOCOUNT ON;

    -- Check for overlapping reservation
    IF EXISTS (
        SELECT 1
        FROM Reservations
        WHERE roomId = @roomId
        AND status IN ('pending', 'confirmed', 'checked-in')
        AND (@checkInDate < checkOutDate AND @checkOutDate > checkInDate)
    )
    BEGIN
        RAISERROR('Room is not available for the selected date range.', 16, 1);
        RETURN;
    END

    -- Get roomTypeId and price
    DECLARE @roomTypeId INT, @price DECIMAL(10,2);
    SELECT 
        @roomTypeId = r.type,
        @price = rt.price
    FROM Rooms r
    INNER JOIN RoomTypes rt ON r.type = rt.id
    WHERE r.id = @roomId;

    -- Calculate nights
    DECLARE @nights INT = DATEDIFF(DAY, @checkInDate, @checkOutDate);
    IF @nights <= 0
    BEGIN
        RAISERROR('Check-out date must be after check-in date.', 16, 1);
        RETURN;
    END

    DECLARE @roomCharge DECIMAL(10,2) = @nights * @price;

    -- Insert Reservation
    INSERT INTO Reservations (
        customerId,
        roomId,
        numberOfGuests,
        checkInDate,
        checkOutDate,
        status,
        createdAt,
        specialRequests
    )
    VALUES (
        @customerId,
        @roomId,
        @numberOfGuests,
        @checkInDate,
        @checkOutDate,
        'pending',
        GETDATE(),
        @specialRequests
    );

    DECLARE @reservationId INT = SCOPE_IDENTITY();

    -- -- Create Invoice
    -- INSERT INTO Invoices (
    --     reservationId,
    --     invoiceDate,
    --     dueDate,
    --     totalAmount,
    --     status,
    --     paymentMethod
    -- )
    -- VALUES (
    --     @reservationId,
    --     GETDATE(),
    --     @checkInDate,              -- Due at check-in
    --     @roomCharge,
    --     'unpaid',
    --     NULL
    -- );

    -- DECLARE @invoiceId INT = SCOPE_IDENTITY();

    -- -- Add Invoice Line Item for room charge
    -- INSERT INTO InvoiceLineItems (
    --     invoiceId,
    --     description,
    --     amount,
    --     serviceTypeId  -- NULL for room charge
    -- )
    -- VALUES (
    --     @invoiceId,
    --     CONCAT('Room charge for ', @nights, ' night(s)'),
    --     @roomCharge,
    --     NULL
    -- );

    SELECT @reservationId AS reservationId;
END;
GO
/****** Object:  StoredProcedure [dbo].[UpdateReservation]    Script Date: 6/6/2025 2:52:08 PM ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE   PROCEDURE [dbo].[UpdateReservation]
    @reservationId INT,
    @checkInDate DATE,
    @checkOutDate DATE,
    @numberOfGuests INT,
    @specialRequests NVARCHAR(500),
    @totalAmount DECIMAL(10, 2)
AS
BEGIN
    SET NOCOUNT ON;

    IF NOT EXISTS (SELECT 1 FROM Reservations WHERE id = @reservationId)
    BEGIN
        RAISERROR('Reservation not found.', 16, 1);
        RETURN;
    END

    UPDATE Reservations
    SET 
        checkInDate = @checkInDate,
        checkOutDate = @checkOutDate,
        numberOfGuests = @numberOfGuests,
        specialRequests = @specialRequests,
        -- You might keep the previous status and createdAt
        status = 'pending'
    WHERE id = @reservationId;

    UPDATE Invoices
    SET totalAmount = @totalAmount
    WHERE reservationId = @reservationId;
END;
GO
/****** Object:  StoredProcedure [dbo].[UpdateReservationAdmin]    Script Date: 6/6/2025 2:52:08 PM ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE   PROCEDURE [dbo].[UpdateReservationAdmin]
    @reservationId INT,
    @checkInDate DATE,
    @checkOutDate DATE,
    @numberOfGuests INT,
    @specialRequests NVARCHAR(500),
    @cardHolderName NVARCHAR(100) = NULL,
    @maskedCardNumber NVARCHAR(25) = NULL,
    @cardType NVARCHAR(50) = NULL,
    @expiryMonth INT = NULL,
    @expiryYear INT = NULL,
    @bankName NVARCHAR(100) = NULL
AS
BEGIN
    SET NOCOUNT ON;

    BEGIN TRY
        BEGIN TRANSACTION;

        -- Update reservation details
        UPDATE Reservations
        SET
            checkInDate = @checkInDate,
            checkOutDate = @checkOutDate,
            numberOfGuests = @numberOfGuests,
            specialRequests = @specialRequests
        WHERE id = @reservationId;

        -- If credit card details are provided, insert into ReservationPayments and update status
        IF @cardHolderName IS NOT NULL AND @maskedCardNumber IS NOT NULL AND @expiryMonth IS NOT NULL AND @expiryYear IS NOT NULL
        BEGIN
            INSERT INTO ReservationPayments (
                reservationId,
                cardHolderName,
                maskedCardNumber,
                cardType,
                expiryMonth,
                expiryYear,
                createdAt,
                bankName
            ) VALUES (
                @reservationId,
                @cardHolderName,
                @maskedCardNumber,
                @cardType,
                @expiryMonth,
                @expiryYear,
                GETDATE(),
                @bankName
            );

            UPDATE Reservations
            SET status = 'confirmed'
            WHERE id = @reservationId;
        END

        COMMIT TRANSACTION;
    END TRY
    BEGIN CATCH
        ROLLBACK TRANSACTION;
        DECLARE @ErrorMessage NVARCHAR(4000) = ERROR_MESSAGE();
        RAISERROR (@ErrorMessage, 16, 1);
    END CATCH
END;
GO
/****** Object:  StoredProcedure [dbo].[UpdateReservationStatus]    Script Date: 6/6/2025 2:52:08 PM ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE   PROCEDURE [dbo].[UpdateReservationStatus]
    @ReservationId INT,
    @Action NVARCHAR(20)  -- 'check-in' or 'check-out'
AS
BEGIN
    SET NOCOUNT ON;

    IF NOT EXISTS (SELECT 1 FROM Reservations WHERE id = @ReservationId)
    BEGIN
        RAISERROR('Reservation not found.', 16, 1);
        RETURN;
    END

    DECLARE @CurrentStatus NVARCHAR(50)
    SELECT @CurrentStatus = status FROM Reservations WHERE id = @ReservationId;

    IF @Action = 'check-in'
    BEGIN
        IF @CurrentStatus != 'confirmed'
        BEGIN
            RAISERROR('Cannot check in. Reservation must be in confirmed status.', 16, 1);
            RETURN;
        END

        UPDATE Reservations
        SET status = 'checked-in'
        WHERE id = @ReservationId;
    END
    ELSE IF @Action = 'check-out'
    BEGIN
        IF @CurrentStatus != 'checked-in'
        BEGIN
            RAISERROR('Cannot check out. Reservation must be in checked-in status.', 16, 1);
            RETURN;
        END

        UPDATE Reservations
        SET status = 'checked-out'
        WHERE id = @ReservationId;
    END
    ELSE
    BEGIN
        RAISERROR('Invalid action. Must be check-in or check-out.', 16, 1);
        RETURN;
    END

    SELECT status FROM Reservations WHERE id = @ReservationId;
END
GO
/****** Object:  StoredProcedure [dbo].[UpdateVerificationToken]    Script Date: 6/6/2025 2:52:08 PM ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE   PROCEDURE [dbo].[UpdateVerificationToken]
  @Email NVARCHAR(256),
  @NewToken UNIQUEIDENTIFIER
AS
BEGIN
  SET NOCOUNT ON;

  IF NOT EXISTS (SELECT 1 FROM Users WHERE Email = @Email)
  BEGIN
    RAISERROR('Email not found', 16, 1);
    RETURN;
  END

  UPDATE Users
  SET emailVerificationToken = @NewToken
  WHERE Email = @Email;
END
GO
/****** Object:  StoredProcedure [dbo].[VerifyUserEmail]    Script Date: 6/6/2025 2:52:08 PM ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE   PROCEDURE [dbo].[VerifyUserEmail]
  @Email NVARCHAR(256),
  @Token UNIQUEIDENTIFIER
AS
BEGIN
  SET NOCOUNT ON;

  DECLARE @CurrentTime DATETIME = GETUTCDATE();

  IF NOT EXISTS (
    SELECT 1
    FROM Users
    WHERE Email = @Email
      AND EmailVerificationToken = @Token
  )
  BEGIN
    RAISERROR('Invalid or expired token', 16, 1);
    RETURN;
  END

  UPDATE Users
  SET IsEmailVerified = 1,
      EmailVerificationToken = NULL
  WHERE Email = @Email;
END
GO
USE [master]
GO
ALTER DATABASE [hotel-db] SET  READ_WRITE 
GO
