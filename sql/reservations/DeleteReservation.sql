CREATE OR ALTER PROCEDURE DeleteReservation
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

    IF DATEDIFF(HOUR, GETDATE(), @checkInDate) < 24
    BEGIN
        RAISERROR('Cannot delete reservation within 24 hours of check-in.', 16, 1);
        RETURN;
    END

    -- Delete related records first (e.g. invoices, payments, etc.)
    DELETE FROM Payments WHERE invoiceId IN (
        SELECT id FROM Invoices WHERE reservationId = @reservationId
    );

    DELETE FROM InvoiceLineItems WHERE invoiceId IN (
        SELECT id FROM Invoices WHERE reservationId = @reservationId
    );

    DELETE FROM ReservationPayments WHERE reservationId = @reservationId;
    DELETE FROM Invoices WHERE reservationId = @reservationId;
    DELETE FROM AssignedRooms WHERE reservationId = @reservationId;

    -- Finally delete the reservation
    DELETE FROM Reservations WHERE id = @reservationId;
END;