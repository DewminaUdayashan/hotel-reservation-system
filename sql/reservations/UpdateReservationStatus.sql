CREATE OR ALTER PROCEDURE UpdateReservationStatus
    @ReservationId INT,
    @Action NVARCHAR(20)  -- 'check-in' or 'check-out'
AS
BEGIN
    SET NOCOUNT ON;

    IF NOT EXISTS (SELECT 1 FROM Reservations WHERE id = @ReservationId)
    BEGIN
        RAISERROR('Reservation not found.', 16, 1);
        RETURN;
    END

    DECLARE @CurrentStatus NVARCHAR(50)
    SELECT @CurrentStatus = status FROM Reservations WHERE id = @ReservationId;

    IF @Action = 'check-in'
    BEGIN
        IF @CurrentStatus != 'confirmed'
        BEGIN
            RAISERROR('Cannot check in. Reservation must be in confirmed status.', 16, 1);
            RETURN;
        END

        UPDATE Reservations
        SET status = 'checked-in'
        WHERE id = @ReservationId;
    END
    ELSE IF @Action = 'check-out'
    BEGIN
        IF @CurrentStatus != 'checked-in'
        BEGIN
            RAISERROR('Cannot check out. Reservation must be in checked-in status.', 16, 1);
            RETURN;
        END

        UPDATE Reservations
        SET status = 'checked-out'
        WHERE id = @ReservationId;
    END
    ELSE
    BEGIN
        RAISERROR('Invalid action. Must be check-in or check-out.', 16, 1);
        RETURN;
    END

    SELECT status FROM Reservations WHERE id = @ReservationId;
END