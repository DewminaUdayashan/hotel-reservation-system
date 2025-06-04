
CREATE OR ALTER PROCEDURE MarkReservationsAsNoShowAndInvoice
AS
BEGIN
    SET NOCOUNT ON;

    DECLARE @Now DATETIME = GETDATE();

    -- Temporary table to store relevant reservations
    CREATE TABLE #ToProcess (
        reservationId INT,
        customerId INT,
        roomId INT,
        nights INT,
        rate DECIMAL(10, 2)
    );

    INSERT INTO #ToProcess (reservationId, customerId, roomId, nights, rate)
    SELECT
        r.id,
        r.customerId,
        r.roomId,
        DATEDIFF(DAY, r.checkInDate, r.checkOutDate),
        rt.price
    FROM Reservations r
    INNER JOIN Rooms ro ON r.roomId = ro.id
    INNER JOIN RoomTypes rt ON ro.type = rt.id
    WHERE
        r.status = 'confirmed'
        AND r.checkInDate = CAST(@Now AS DATE)
        AND DATEPART(HOUR, @Now) >= 19;  -- 7PM

    -- Loop through each and perform status update and invoice generation
    DECLARE @resId INT, @custId INT, @roomId INT, @nights INT, @rate DECIMAL(10,2), @amount DECIMAL(10,2), @invoiceId INT;

    DECLARE reservation_cursor CURSOR FOR
        SELECT reservationId, customerId, roomId, nights, rate FROM #ToProcess;

    OPEN reservation_cursor;
    FETCH NEXT FROM reservation_cursor INTO @resId, @custId, @roomId, @nights, @rate;

    WHILE @@FETCH_STATUS = 0
    BEGIN
        SET @amount = @nights * @rate;

        -- Update reservation status to 'no-show'
        UPDATE Reservations SET status = 'no-show' WHERE id = @resId;

        -- Create invoice
        INSERT INTO Invoices (reservationId, invoiceDate, totalAmount, status)
        VALUES (@resId, @Now, @amount, 'unpaid');

        SET @invoiceId = SCOPE_IDENTITY();

        -- Insert line item
        INSERT INTO InvoiceLineItems (invoiceId, description, amount)
        VALUES (@invoiceId, 'Room charges for ' + CAST(@nights AS NVARCHAR) + ' nights (No-show)', @amount);

        FETCH NEXT FROM reservation_cursor INTO @resId, @custId, @roomId, @nights, @rate;
    END

    CLOSE reservation_cursor;
    DEALLOCATE reservation_cursor;

    DROP TABLE #ToProcess;
END
