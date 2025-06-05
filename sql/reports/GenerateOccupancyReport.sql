CREATE OR ALTER PROCEDURE GenerateOccupancyReport
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