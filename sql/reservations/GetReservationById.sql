CREATE OR ALTER PROCEDURE GetReservationById
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
        ISNULL(i.totalAmount, 0.00) AS totalAmount,
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