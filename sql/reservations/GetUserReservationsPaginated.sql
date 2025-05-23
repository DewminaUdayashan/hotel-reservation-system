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

        -- Payment details from Invoice
        ISNULL(i.status, 'unpaid') AS paymentStatus,
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