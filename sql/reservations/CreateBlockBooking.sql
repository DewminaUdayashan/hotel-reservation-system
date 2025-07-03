CREATE TYPE RoomIdTableType AS TABLE (
    roomId INT
);

CREATE OR ALTER PROCEDURE ReserveBlockBooking
    @agencyId INT,
    @roomIdTable RoomIdTableType READONLY,
    @checkInDate DATE,
    @checkOutDate DATE,
    @numberOfGuests INT,
    @specialRequests NVARCHAR(500) = NULL,
    @discountPercentage INT = 0,
    @email NVARCHAR(255) = NULL,
    @customerId INT = NULL,
    @cardNumber NVARCHAR(25),
    @cardExpiryMonth INT,
    @cardExpiryYear INT,
    @cardCVC NVARCHAR(10) = NULL,
    @cardHolderName NVARCHAR(100)
AS
BEGIN
    SET NOCOUNT ON;

    BEGIN TRY
        BEGIN TRANSACTION;

        -- 1. Insert into BlockBookings table
        INSERT INTO BlockBookings (
            agencyId,
            checkInDate,
            checkOutDate,
            numberOfGuests,
            specialRequests,
            discountPercentage,
            createdAt
        )
        VALUES (
            @agencyId,
            @checkInDate,
            @checkOutDate,
            @numberOfGuests,
            @specialRequests,
            @discountPercentage,
            GETDATE()
        );

        DECLARE @blockBookingId INT = SCOPE_IDENTITY();

        DECLARE @roomId INT;
        DECLARE room_cursor CURSOR FOR
            SELECT roomId FROM @roomIdTable;

        OPEN room_cursor;
        FETCH NEXT FROM room_cursor INTO @roomId;

        WHILE @@FETCH_STATUS = 0
        BEGIN
            -- 2. Check for overlapping reservations for this room
            IF EXISTS (
                SELECT 1
                FROM Reservations
                WHERE roomId = @roomId
                  AND status IN ('pending', 'confirmed', 'checked-in')
                  AND (@checkInDate < checkOutDate AND @checkOutDate > checkInDate)
            )
            BEGIN
                RAISERROR('Room ID %d is already booked during the selected period.', 16, 1, @roomId);
                ROLLBACK TRANSACTION;
                RETURN;
            END

            -- 3. Insert reservation
            INSERT INTO Reservations (
                customerId,
                roomId,
                numberOfGuests,
                checkInDate,
                checkOutDate,
                status,
                createdAt,
                specialRequests,
                blockBookingId
            )
            VALUES (
                @customerId,
                @roomId,
                @numberOfGuests,
                @checkInDate,
                @checkOutDate,
                'confirmed',
                GETDATE(),
                @specialRequests,
                @blockBookingId
            );

            DECLARE @reservationId INT = SCOPE_IDENTITY();

            -- 4. Insert payment (duplicated for each)
            INSERT INTO ReservationPayments (
                reservationId,
                cardHolderName,
                maskedCardNumber,
                cardType,
                expiryMonth,
                expiryYear,
                createdAt
            )
            VALUES (
                @reservationId,
                @cardHolderName,
                -- You can mask the number here if needed
                @cardNumber,
                'Credit Card',
                @cardExpiryMonth,
                @cardExpiryYear,
                GETDATE()
            );

            FETCH NEXT FROM room_cursor INTO @roomId;
        END

        CLOSE room_cursor;
        DEALLOCATE room_cursor;

        -- 5. Return blockBookingId
        COMMIT TRANSACTION;

        SELECT @blockBookingId AS blockBookingId;
    END TRY
    BEGIN CATCH
        IF @@TRANCOUNT > 0
            ROLLBACK TRANSACTION;

        DECLARE @errorMsg NVARCHAR(4000) = ERROR_MESSAGE();
        RAISERROR(@errorMsg, 16, 1);
    END CATCH
END;