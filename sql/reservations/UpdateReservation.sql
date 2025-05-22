CREATE OR ALTER PROCEDURE UpdateReservation
    @reservationId INT,
    @checkInDate DATE,
    @checkOutDate DATE,
    @numberOfGuests INT,
    @specialRequests NVARCHAR(500),
    @totalAmount DECIMAL(10, 2)
AS
BEGIN
    SET NOCOUNT ON;

    IF NOT EXISTS (SELECT 1 FROM Reservations WHERE id = @reservationId)
    BEGIN
        RAISERROR('Reservation not found.', 16, 1);
        RETURN;
    END

    UPDATE Reservations
    SET 
        checkInDate = @checkInDate,
        checkOutDate = @checkOutDate,
        numberOfGuests = @numberOfGuests,
        specialRequests = @specialRequests,
        -- You might keep the previous status and createdAt
        status = 'pending'
    WHERE id = @reservationId;

    UPDATE Invoices
    SET totalAmount = @totalAmount
    WHERE reservationId = @reservationId;
END;