CREATE OR ALTER PROCEDURE GetUserById
    @userId INT
AS
BEGIN
    SET NOCOUNT ON;

    SELECT 
        u.id,
        u.email,
        u.role,
        u.firstName,
        u.lastName,
        u.createdAt,
        c.phone,
        c.homeTown
    FROM Users u
    INNER JOIN Customers c ON u.id = c.id
    WHERE c.id = @userId;
END;