CREATE OR ALTER PROCEDURE CreateInvoiceAndCheckout
    @ReservationId INT,
    @LineItems NVARCHAR(MAX),  -- JSON array: [{ "description": "...", "amount": 100.0, "serviceTypeId": null }, ...]
    @PaymentMethod NVARCHAR(50),
    @AmountPaid DECIMAL(10,2),
    @TransactionId NVARCHAR(255) = NULL,
    @DueDate DATETIME = NULL
AS
BEGIN
    SET NOCOUNT ON;

    BEGIN TRY
        BEGIN TRANSACTION;

        -- Validate reservation
        IF NOT EXISTS (SELECT 1 FROM Reservations WHERE id = @ReservationId)
        BEGIN
            RAISERROR('Reservation not found.', 16, 1);
            ROLLBACK TRANSACTION;
            RETURN;
        END

        -- Validate payment method
        IF @PaymentMethod NOT IN ('cash', 'credit_card')
        BEGIN
            RAISERROR('Invalid payment method.', 16, 1);
            ROLLBACK TRANSACTION;
            RETURN;
        END

        -- Calculate total amount from JSON
        DECLARE @TotalAmount DECIMAL(10, 2);
SELECT @TotalAmount = SUM(amount)
FROM OPENJSON(@LineItems)
WITH (
    amount DECIMAL(10,2) '$.amount'
);

        IF @AmountPaid < @TotalAmount
        BEGIN
            RAISERROR('Amount paid is less than total amount.', 16, 1);
            ROLLBACK TRANSACTION;
            RETURN;
        END

        DECLARE @ChangeReturned DECIMAL(10,2) = @AmountPaid - @TotalAmount;

        -- Insert into Invoices
        DECLARE @InvoiceId INT;
        INSERT INTO Invoices (reservationId, invoiceDate, dueDate, totalAmount, status, paymentMethod)
        VALUES (@ReservationId, GETDATE(), @DueDate, @TotalAmount, 'paid', @PaymentMethod);

        SET @InvoiceId = SCOPE_IDENTITY();

        -- Insert Line Items
INSERT INTO InvoiceLineItems (invoiceId, description, amount, serviceTypeId)
SELECT
    @InvoiceId,
    description,
    amount,
    serviceTypeId
FROM OPENJSON(@LineItems)
WITH (
    description NVARCHAR(255) '$.description',
    amount DECIMAL(10,2) '$.amount',
    serviceTypeId INT '$.serviceTypeId'
);

        -- Insert into Payments
        INSERT INTO Payments (invoiceId, amountPaid, changeReturned, paymentMethod, transactionId)
        VALUES (@InvoiceId, @AmountPaid, @ChangeReturned, @PaymentMethod, @TransactionId);

        -- Call existing check-out SP
        EXEC UpdateReservationStatus @ReservationId, 'check-out';

        COMMIT TRANSACTION;

        -- Return invoice and payment info
        SELECT * FROM Invoices WHERE id = @InvoiceId;
        SELECT * FROM Payments WHERE invoiceId = @InvoiceId;
    END TRY
    BEGIN CATCH
        ROLLBACK TRANSACTION;

        DECLARE @ErrMsg NVARCHAR(4000), @ErrSeverity INT, @ErrState INT;
        SELECT
            @ErrMsg = ERROR_MESSAGE(),
            @ErrSeverity = ERROR_SEVERITY(),
            @ErrState = ERROR_STATE();
        RAISERROR(@ErrMsg, @ErrSeverity, @ErrState);
    END CATCH
END