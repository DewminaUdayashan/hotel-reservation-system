CREATE OR ALTER PROCEDURE LoginUser
    @Email NVARCHAR(255),
    @PasswordHash NVARCHAR(255)
AS
BEGIN
    SET NOCOUNT ON;

    SELECT 
        U.id,
        U.email,
        U.firstName,
        U.lastName,
        U.role,
        U.createdAt,
        C.phone,
        C.homeTown
    FROM 
        Users U
        LEFT JOIN Customers C ON U.id = C.id
    WHERE 
        U.email = @Email AND U.passwordHash = @PasswordHash;
END;