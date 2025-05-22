CREATE OR ALTER PROCEDURE ReserveRoom
    @customerId INT,
    @roomId INT,
    @checkInDate DATE,
    @checkOutDate DATE,
    @numberOfGuests INT,
    @specialRequests NVARCHAR(500) = NULL
AS
BEGIN
    SET NOCOUNT ON;

    -- Check for overlapping reservation
    IF EXISTS (
        SELECT 1
        FROM Reservations
        WHERE roomId = @roomId
        AND status IN ('pending', 'confirmed', 'checked-in')
        AND (@checkInDate < checkOutDate AND @checkOutDate > checkInDate)
    )
    BEGIN
        RAISERROR('Room is not available for the selected date range.', 16, 1);
        RETURN;
    END

    INSERT INTO Reservations (
        customerId,
        roomId,
        numberOfGuests,
        checkInDate,
        checkOutDate,
        status,
        createdAt,
        specialRequests
    )
    VALUES (
        @customerId,
        @roomId,
        @numberOfGuests,
        @checkInDate,
        @checkOutDate,
        'pending',
        GETDATE(),
        @specialRequests
    );

    SELECT SCOPE_IDENTITY() AS reservationId;
END;