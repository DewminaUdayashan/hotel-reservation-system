CREATE OR ALTER PROCEDURE CreateAdminUser
  @Email NVARCHAR(255),
  @PasswordHash NVARCHAR(255),
  @FirstName NVARCHAR(255),
  @LastName NVARCHAR(255),
  @Role NVARCHAR(20)
AS
BEGIN
  SET NOCOUNT ON;

  IF EXISTS (SELECT 1 FROM Users WHERE email = @Email)
  BEGIN
    RAISERROR('User with this email already exists.', 16, 1);
    RETURN;
  END

  INSERT INTO Users (email, passwordHash, firstName, lastName, role, createdAt)
  VALUES (@Email, @PasswordHash, @FirstName, @LastName, @Role, GETDATE());

  DECLARE @NewUserId INT = SCOPE_IDENTITY();

  SELECT @NewUserId AS userId;
END;