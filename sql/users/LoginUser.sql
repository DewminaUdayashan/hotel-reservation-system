CREATE OR ALTER PROCEDURE LoginUser
    @Email NVARCHAR(255)
AS
BEGIN
    SET NOCOUNT ON;

    SELECT 
        -- User
        U.id AS id,
        U.email,
        U.firstName,
        U.lastName,
        U.role,
        U.createdAt,
        U.isActive,
        U.isEmailVerified,
        U.mustResetPassword,
        U.passwordHash,

        -- Customer (nullable)
        C.id AS customerId,
        C.phone,
        C.homeTown,
        C.customerType,
        C.agencyId,

        -- Agency (nullable)
        A.id AS agencyId,
        A.name AS agencyName,
        A.phone AS agencyPhone,
        A.createdAt AS agencyCreatedAt,

        -- HotelUser (nullable)
        HU.id AS hotelUserId,
        HU.hotelId,
        H.name AS hotelName

    FROM Users U
    LEFT JOIN Customers C ON U.id = C.id
    LEFT JOIN Agencies A ON C.agencyId = A.id
    LEFT JOIN HotelUsers HU ON U.id = HU.userId
    LEFT JOIN Hotels H ON HU.hotelId = H.id
    WHERE U.email = @Email;
END;