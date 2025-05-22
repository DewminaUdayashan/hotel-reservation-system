CREATE OR ALTER PROCEDURE IsRoomAvailable
    @roomId INT,
    @checkIn DATE = NULL,
    @checkOut DATE = NULL,
    @userId INT = NULL
AS
BEGIN
    SET NOCOUNT ON;

    -- Use current date and +1 day if not provided
    DECLARE @effectiveCheckIn DATE = ISNULL(@checkIn, CAST(GETDATE() AS DATE));
    DECLARE @effectiveCheckOut DATE = ISNULL(@checkOut, DATEADD(DAY, 1, @effectiveCheckIn));

    -- Room must not be reserved in the given time frame,
    -- unless the reservation belongs to the current user
    IF EXISTS (
        SELECT 1
        FROM Reservations
        WHERE roomId = @roomId
        AND status IN ('pending', 'confirmed', 'checked-in')
        AND (@effectiveCheckIn < checkOutDate AND @effectiveCheckOut > checkInDate)
        AND (@userId IS NULL OR customerId <> @userId)
    )
    BEGIN
        SELECT CAST(0 AS BIT) AS isAvailable;
    END
    ELSE
    BEGIN
        SELECT CAST(1 AS BIT) AS isAvailable;
    END
END;