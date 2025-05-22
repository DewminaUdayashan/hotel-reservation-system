CREATE OR ALTER PROCEDURE GetAvailableRoomsByType
    @roomTypeId INT,
    @checkIn DATE = NULL,
    @checkOut DATE = NULL
AS
BEGIN
    SET NOCOUNT ON;

    DECLARE @effectiveCheckIn DATE = ISNULL(@checkIn, CAST(GETDATE() AS DATE));
    DECLARE @effectiveCheckOut DATE = ISNULL(@checkOut, DATEADD(DAY, 1, @effectiveCheckIn));

    SELECT 
        R.id,
        R.name,
        R.description,
        R.status,
        R.type,
        R.bedType,
        R.viewType
    FROM Rooms R
    WHERE 
        R.status = 'available'
        AND R.type = @roomTypeId
        AND NOT EXISTS (
            SELECT 1
            FROM Reservations Res
            WHERE Res.roomId = R.id
              AND Res.status IN ('pending', 'confirmed', 'checked-in')
              AND (@effectiveCheckIn < Res.checkOutDate AND @effectiveCheckOut > Res.checkInDate)
        )
    ORDER BY R.id;
END;