CREATE OR ALTER PROCEDURE VerifyUserEmail
  @Email NVARCHAR(256),
  @Token UNIQUEIDENTIFIER
AS
BEGIN
  SET NOCOUNT ON;

  DECLARE @CurrentTime DATETIME = GETUTCDATE();

  IF NOT EXISTS (
    SELECT 1
    FROM Users
    WHERE Email = @Email
      AND EmailVerificationToken = @Token
  )
  BEGIN
    RAISERROR('Invalid or expired token', 16, 1);
    RETURN;
  END

  UPDATE Users
  SET IsEmailVerified = 1,
      EmailVerificationToken = NULL
  WHERE Email = @Email;
END
