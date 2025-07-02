CREATE OR ALTER PROCEDURE RegisterUser
    @Email NVARCHAR(255),
    @PasswordHash NVARCHAR(255),
    @FirstName NVARCHAR(100),
    @LastName NVARCHAR(100),
    @Role NVARCHAR(50),
    @Phone NVARCHAR(50),
    @HomeTown NVARCHAR(50) = NULL,
    @VerificationToken UNIQUEIDENTIFIER,
    @AgencyName NVARCHAR(255) = NULL,
    @AgencyPhone NVARCHAR(50) = NULL
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
        -- Step 1: Insert User
        INSERT INTO Users (email, passwordHash, firstName, lastName, role, emailVerificationToken, isEmailVerified)
        VALUES (@Email, @PasswordHash, @FirstName, @LastName, @Role, @VerificationToken, 0);

        DECLARE @UserId INT = SCOPE_IDENTITY();
        DECLARE @AgencyId INT = NULL;
        DECLARE @CustomerType NVARCHAR(20) = 'individual';

        -- Step 2: If agency info provided, insert into Agencies
        IF @Role = 'customer' AND @AgencyName IS NOT NULL AND @AgencyPhone IS NOT NULL
        BEGIN
            INSERT INTO Agencies (name, phone)
            VALUES (@AgencyName, @AgencyPhone);

            SET @AgencyId = SCOPE_IDENTITY();
            SET @CustomerType = 'agency';
        END

        -- Step 3: Insert into Customers
        IF @Role = 'customer'
        BEGIN
            INSERT INTO Customers (id, phone, homeTown, customerType, agencyId)
            VALUES (@UserId, @Phone, @HomeTown, @CustomerType, @AgencyId);
        END

        COMMIT;
        SELECT @UserId AS userId;
    END TRY
    BEGIN CATCH
        ROLLBACK;
        THROW;
    END CATCH
END;