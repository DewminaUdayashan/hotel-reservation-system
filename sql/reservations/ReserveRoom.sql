CREATE OR ALTER PROCEDURE ReserveRoom
    @customerId INT,
    @roomId INT,
    @checkInDate DATE,
    @checkOutDate DATE,
    @numberOfGuests INT,
    @specialRequests NVARCHAR(500) = NULL,

    -- Optional payment details
    @cardHolderName NVARCHAR(100) = NULL,
    @maskedCardNumber NVARCHAR(25) = NULL,
    @cardType NVARCHAR(50) = NULL,
    @expiryMonth INT = NULL,
    @expiryYear INT = NULL,
    @bankName NVARCHAR(255) = NULL
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

    -- Get roomTypeId and price
    DECLARE @roomTypeId INT, @price DECIMAL(10,2);
    SELECT 
        @roomTypeId = r.type,
        @price = rt.price
    FROM Rooms r
    INNER JOIN RoomTypes rt ON r.type = rt.id
    WHERE r.id = @roomId;

    -- Calculate nights
    DECLARE @nights INT = DATEDIFF(DAY, @checkInDate, @checkOutDate);
    IF @nights <= 0
    BEGIN
        RAISERROR('Check-out date must be after check-in date.', 16, 1);
        RETURN;
    END

    -- Determine status based on payment info
    DECLARE @status NVARCHAR(50) =
        CASE
            WHEN @cardHolderName IS NOT NULL AND @maskedCardNumber IS NOT NULL THEN 'confirmed'
            ELSE 'pending'
        END;

    -- Insert Reservation
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
        @status,
        GETDATE(),
        @specialRequests
    );

    DECLARE @reservationId INT = SCOPE_IDENTITY();

    -- Conditionally insert payment details
    IF @cardHolderName IS NOT NULL AND @maskedCardNumber IS NOT NULL
    BEGIN
        INSERT INTO ReservationPayments (
            reservationId,
            cardHolderName,
            maskedCardNumber,
            cardType,
            expiryMonth,
            expiryYear,
            bankName,
            createdAt
        )
        VALUES (
            @reservationId,
            @cardHolderName,
            @maskedCardNumber,
            @cardType,
            @expiryMonth,
            @expiryYear,
            @bankName,
            GETDATE()
        );
    END

    SELECT @reservationId AS reservationId;
END;