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

    DECLARE @roomCharge DECIMAL(10,2) = @nights * @price;

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
        'pending',
        GETDATE(),
        @specialRequests
    );

    DECLARE @reservationId INT = SCOPE_IDENTITY();

    -- Create Invoice
    INSERT INTO Invoices (
        reservationId,
        invoiceDate,
        dueDate,
        totalAmount,
        status,
        paymentMethod
    )
    VALUES (
        @reservationId,
        GETDATE(),
        @checkInDate,              -- Due at check-in
        @roomCharge,
        'unpaid',
        NULL
    );

    DECLARE @invoiceId INT = SCOPE_IDENTITY();

    -- Add Invoice Line Item for room charge
    INSERT INTO InvoiceLineItems (
        invoiceId,
        description,
        amount,
        serviceTypeId  -- NULL for room charge
    )
    VALUES (
        @invoiceId,
        CONCAT('Room charge for ', @nights, ' night(s)'),
        @roomCharge,
        NULL
    );

    SELECT @reservationId AS reservationId;
END;