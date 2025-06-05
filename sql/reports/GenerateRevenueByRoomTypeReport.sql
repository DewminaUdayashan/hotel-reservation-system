CREATE OR ALTER PROCEDURE GenerateRevenueByRoomTypeReport
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