CREATE OR ALTER PROCEDURE AssignUserToHotel
  @UserId INT,
  @HotelId INT
AS
BEGIN
  SET NOCOUNT ON;

  -- Check if user exists
  IF NOT EXISTS (SELECT 1 FROM Users WHERE id = @UserId)
  BEGIN
    RAISERROR('User not found.', 16, 1);
    RETURN;
  END

  -- Check if hotel exists
  IF NOT EXISTS (SELECT 1 FROM Hotels WHERE id = @HotelId)
  BEGIN
    RAISERROR('Hotel not found.', 16, 1);
    RETURN;
  END

  -- If already assigned, update it
  IF EXISTS (SELECT 1 FROM HotelUsers WHERE userId = @UserId)
  BEGIN
    UPDATE HotelUsers SET hotelId = @HotelId WHERE userId = @UserId;
  END
  ELSE
  BEGIN
    INSERT INTO HotelUsers (userId, hotelId, role)
    SELECT @UserId, @HotelId, role FROM Users WHERE id = @UserId;
  END

  SELECT 'Hotel assigned successfully.' AS message;
END;