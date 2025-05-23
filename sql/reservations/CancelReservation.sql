CREATE OR ALTER PROCEDURE CancelReservation
    @reservationId INT
AS
BEGIN
    SET NOCOUNT ON;

    DECLARE @checkInDate DATETIME;

    SELECT @checkInDate = checkInDate
    FROM Reservations
    WHERE id = @reservationId;

    IF @checkInDate IS NULL
    BEGIN
        RAISERROR('Reservation not found.', 16, 1);
        RETURN;
    END

    -- Block cancellation within 24 hours of check-in
    IF DATEDIFF(HOUR, GETDATE(), @checkInDate) < 24
    BEGIN
        RAISERROR('Cannot cancel reservation within 24 hours of check-in.', 16, 1);
        RETURN;
    END

    -- Mark the reservation as cancelled
    UPDATE Reservations
    SET status = 'cancelled'
    WHERE id = @reservationId;
END;