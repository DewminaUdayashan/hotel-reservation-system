CREATE OR ALTER PROCEDURE UpdateVerificationToken
  @Email NVARCHAR(256),
  @NewToken UNIQUEIDENTIFIER
AS
BEGIN
  SET NOCOUNT ON;

  IF NOT EXISTS (SELECT 1 FROM Users WHERE Email = @Email)
  BEGIN
    RAISERROR('Email not found', 16, 1);
    RETURN;
  END

  UPDATE Users
  SET emailVerificationToken = @NewToken
  WHERE Email = @Email;
END
