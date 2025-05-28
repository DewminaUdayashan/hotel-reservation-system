CREATE OR ALTER PROCEDURE CreateCustomer
    @email NVARCHAR(255),
    @passwordHash NVARCHAR(255),
    @firstName NVARCHAR(100),
    @lastName NVARCHAR(100),
    @phone NVARCHAR(50),
    @homeTown NVARCHAR(50) = NULL,
    @customerType NVARCHAR(20) = 'individual',
    @agencyId INT = NULL,
    @agencyName NVARCHAR(255) = NULL,
    @agencyPhone NVARCHAR(50) = NULL
AS
BEGIN
    SET NOCOUNT ON;

    DECLARE @newUserId INT;
    DECLARE @finalAgencyId INT;

    -- If customerType is 'agency' and agencyId is NULL, create a new agency
    IF @customerType = 'agency' AND @agencyId IS NULL
    BEGIN
        INSERT INTO Agencies (name, phone)
        VALUES (@agencyName, @agencyPhone);

        SET @finalAgencyId = SCOPE_IDENTITY();
    END
    ELSE
    BEGIN
        SET @finalAgencyId = @agencyId;
    END

    -- Create user
    INSERT INTO Users (email, passwordHash, firstName, lastName, role)
    VALUES (@email, @passwordHash, @firstName, @lastName, 'customer');

    SET @newUserId = SCOPE_IDENTITY();

    -- Create customer
    INSERT INTO Customers (id, phone, homeTown, customerType, agencyId)
    VALUES (@newUserId, @phone, @homeTown, @customerType, @finalAgencyId);

    SELECT @newUserId AS customerId;
END