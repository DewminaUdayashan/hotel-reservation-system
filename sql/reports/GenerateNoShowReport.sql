CREATE OR ALTER PROCEDURE GenerateNoShowReport
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