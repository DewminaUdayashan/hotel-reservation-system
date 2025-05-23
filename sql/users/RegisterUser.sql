CREATE OR ALTER PROCEDURE RegisterUser
    @Email NVARCHAR(255),
    @PasswordHash NVARCHAR(255),
    @FirstName NVARCHAR(100),
    @LastName NVARCHAR(100),
    @Role NVARCHAR(50),
    @Phone NVARCHAR(50),
    @HomeTown NVARCHAR(50) = NULL
AS
BEGIN
    SET NOCOUNT ON;

    IF EXISTS (SELECT 1 FROM Users WHERE email = @Email)
    BEGIN
        RAISERROR('Email already registered.', 16, 1);
        RETURN;
    END

    BEGIN TRANSACTION;

    BEGIN TRY
        INSERT INTO Users (email, passwordHash, firstName, lastName, role)
        VALUES (@Email, @PasswordHash, @FirstName, @LastName, @Role);

        DECLARE @UserId INT = SCOPE_IDENTITY();

        IF @Role = 'customer'
        BEGIN
            INSERT INTO Customers (id, phone, homeTown)
            VALUES (@UserId, @Phone, @HomeTown);
        END

        COMMIT;
        SELECT @UserId AS userId;
    END TRY
    BEGIN CATCH
        ROLLBACK;
        THROW;
    END CATCH
END;