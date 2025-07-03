CREATE OR ALTER PROCEDURE GetUserReservationsPaginated
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

        -- Payment Status
        CASE 
            WHEN i.id IS NOT NULL THEN 'paid'
            ELSE 'unpaid'
        END AS paymentStatus,

        ISNULL(i.paymentMethod, 'cash') AS paymentMethod,
        ISNULL(i.totalAmount, 0.00) AS totalAmount,

        r.specialRequests,
        r.createdAt,

        -- Room Details
        rm.name AS roomName,
        rt.name AS roomType,

        -- Block Booking Info (optional)
        bbr.blockBookingId,
        bb.totalAmount AS blockTotalAmount

    FROM Reservations r
    INNER JOIN Rooms rm ON r.roomId = rm.id
    INNER JOIN RoomTypes rt ON rm.type = rt.id
    LEFT JOIN Invoices i ON i.reservationId = r.id
    LEFT JOIN BlockBookingReservations bbr ON bbr.reservationId = r.id
    LEFT JOIN BlockBookings bb ON bb.id = bbr.blockBookingId

    WHERE r.customerId = @userId
    ORDER BY r.createdAt DESC
    OFFSET @offset ROWS FETCH NEXT @pageSize ROWS ONLY;
END;