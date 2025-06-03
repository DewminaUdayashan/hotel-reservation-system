CREATE OR ALTER PROCEDURE AutoCancelUnconfirmedReservations
AS
BEGIN
    SET NOCOUNT ON;

    UPDATE Reservations
    SET status = 'cancelled'
    WHERE status = 'pending';
END;