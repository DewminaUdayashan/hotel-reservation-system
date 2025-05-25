CREATE OR ALTER PROCEDURE GetAllReservationsForAdmin
    @page INT = 1,
    @pageSize INT = 10,
    @search NVARCHAR(255) = NULL,
    @hotelId INT = NULL,
    @status NVARCHAR(50) = NULL,
    @fromDate DATE = NULL,
    @toDate DATE = NULL,
    @orderBy NVARCHAR(50) = 'checkInDate',
    @orderDir NVARCHAR(4) = 'ASC'
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
        ISNULL(I.status, 'unpaid') AS paymentStatus,
        I.paymentMethod,
        I.totalAmount,
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