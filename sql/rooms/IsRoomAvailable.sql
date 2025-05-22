CREATE OR ALTER PROCEDURE IsRoomAvailable
    @roomId INT,
    @checkIn DATE = NULL,
    @checkOut DATE = NULL
AS
BEGIN
    SET NOCOUNT ON;

    -- Use current date if either date is NULL
    DECLARE @effectiveCheckIn DATE = ISNULL(@checkIn, CAST(GETDATE() AS DATE));
    DECLARE @effectiveCheckOut DATE = ISNULL(@checkOut, DATEADD(DAY, 1, @effectiveCheckIn));

    -- Room must not be reserved during the effective time frame
    IF EXISTS (
        SELECT 1
        FROM Reservations
        WHERE roomId = @roomId
        AND status IN ('pending', 'confirmed', 'checked-in')
        AND (
            (@effectiveCheckIn < checkOutDate AND @effectiveCheckOut > checkInDate)
        )
    )
    BEGIN
        SELECT CAST(0 AS BIT) AS isAvailable;
    END
    ELSE
    BEGIN
        SELECT CAST(1 AS BIT) AS isAvailable;
    END
END;