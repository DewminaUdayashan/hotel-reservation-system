CREATE OR ALTER PROCEDURE GetAllReservationsForAdmin
    @page INT = 1,
    @pageSize INT = 10,
    @search NVARCHAR(100) = NULL,
    @hotelId INT = NULL,
    @status NVARCHAR(50) = NULL,
    @fromDate DATE = NULL,
    @toDate DATE = NULL,
    @orderBy NVARCHAR(50) = 'checkInDate',  -- e.g., 'checkInDate', 'createdAt'
    @orderDir NVARCHAR(4) = 'ASC'           -- 'ASC' or 'DESC'
AS
BEGIN
    SET NOCOUNT ON;

    DECLARE @offset INT = (@page - 1) * @pageSize;

    -- Base query
    WITH FilteredReservations AS (
        SELECT
            Res.id,
            Res.customerId,
            Res.roomId,
            Res.checkInDate,
            Res.checkOutDate,
            Res.numberOfGuests,
            Res.status,
            Res.createdAt,
            Res.specialRequests,
            C.phone,
            U.email,
            U.firstName,
            U.lastName,
            R.name AS roomName,
            RT.name AS roomType,
            H.id AS hotelId,
            H.name AS hotelName,
            COUNT(*) OVER() AS totalCount
        FROM Reservations Res
        INNER JOIN Customers C ON C.id = Res.customerId
        INNER JOIN Users U ON U.id = C.id
        INNER JOIN Rooms R ON R.id = Res.roomId
        INNER JOIN RoomTypes RT ON RT.id = R.type
        INNER JOIN Hotels H ON H.id = R.hotelId
        WHERE
            (@search IS NULL OR
                CAST(Res.id AS NVARCHAR) LIKE '%' + @search + '%' OR
                U.firstName LIKE '%' + @search + '%' OR
                U.lastName LIKE '%' + @search + '%' OR
                U.email LIKE '%' + @search + '%')
            AND (@hotelId IS NULL OR H.id = @hotelId)
            AND (@status IS NULL OR Res.status = @status)
            AND (@fromDate IS NULL OR Res.checkInDate >= @fromDate)
            AND (@toDate IS NULL OR Res.checkInDate <= @toDate)
    )
    SELECT *
    FROM FilteredReservations
    ORDER BY
        CASE WHEN @orderBy = 'createdAt' AND @orderDir = 'ASC' THEN createdAt END ASC,
        CASE WHEN @orderBy = 'createdAt' AND @orderDir = 'DESC' THEN createdAt END DESC,
        CASE WHEN @orderBy = 'checkInDate' AND @orderDir = 'ASC' THEN checkInDate END ASC,
        CASE WHEN @orderBy = 'checkInDate' AND @orderDir = 'DESC' THEN checkInDate END DESC
    OFFSET @offset ROWS
    FETCH NEXT @pageSize ROWS ONLY;
END;