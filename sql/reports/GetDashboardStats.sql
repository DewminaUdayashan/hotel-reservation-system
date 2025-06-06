CREATE OR ALTER PROCEDURE GetDashboardStats
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