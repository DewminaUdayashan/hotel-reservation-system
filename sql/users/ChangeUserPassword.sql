
CREATE PROCEDURE ChangeUserPassword
    @email NVARCHAR(255),
    @newPasswordHash NVARCHAR(255)
AS
BEGIN
    SET NOCOUNT ON;
    DECLARE @userId INT;
    
    SELECT @userId = id
    FROM dbo.Users
    WHERE
        email = @email
        AND isActive = 1; 

    IF @userId IS NOT NULL
    BEGIN
        UPDATE dbo.Users
        SET
            passwordHash = @newPasswordHash,
            mustResetPassword = 0
        WHERE
            id = @userId;
        SELECT 'Success' AS Status, 'Password has been changed successfully.' AS Message;
    END
    ELSE
    BEGIN
        SELECT 'Error' AS Status, 'Invalid email or incorrect old password.' AS Message;
    END
END
GO
