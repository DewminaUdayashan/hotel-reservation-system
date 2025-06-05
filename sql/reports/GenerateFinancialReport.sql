CREATE OR ALTER PROCEDURE GenerateFinancialReport
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