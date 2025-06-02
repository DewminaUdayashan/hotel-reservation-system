CREATE OR ALTER PROCEDURE UpdateReservationAdmin
    @reservationId INT,
    @checkInDate DATE,
    @checkOutDate DATE,
    @numberOfGuests INT,
    @specialRequests NVARCHAR(500),
    @cardHolderName NVARCHAR(100) = NULL,
    @maskedCardNumber NVARCHAR(25) = NULL,
    @cardType NVARCHAR(50) = NULL,
    @expiryMonth INT = NULL,
    @expiryYear INT = NULL,
    @bankName NVARCHAR(100) = NULL
AS
BEGIN
    SET NOCOUNT ON;

    BEGIN TRY
        BEGIN TRANSACTION;

        -- Update reservation details
        UPDATE Reservations
        SET
            checkInDate = @checkInDate,
            checkOutDate = @checkOutDate,
            numberOfGuests = @numberOfGuests,
            specialRequests = @specialRequests
        WHERE id = @reservationId;

        -- If credit card details are provided, insert into ReservationPayments and update status
        IF @cardHolderName IS NOT NULL AND @maskedCardNumber IS NOT NULL AND @expiryMonth IS NOT NULL AND @expiryYear IS NOT NULL
        BEGIN
            INSERT INTO ReservationPayments (
                reservationId,
                cardHolderName,
                maskedCardNumber,
                cardType,
                expiryMonth,
                expiryYear,
                createdAt,
                bankName
            ) VALUES (
                @reservationId,
                @cardHolderName,
                @maskedCardNumber,
                @cardType,
                @expiryMonth,
                @expiryYear,
                GETDATE(),
                @bankName
            );

            UPDATE Reservations
            SET status = 'confirmed'
            WHERE id = @reservationId;
        END

        COMMIT TRANSACTION;
    END TRY
    BEGIN CATCH
        ROLLBACK TRANSACTION;
        DECLARE @ErrorMessage NVARCHAR(4000) = ERROR_MESSAGE();
        RAISERROR (@ErrorMessage, 16, 1);
    END CATCH
END;