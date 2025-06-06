CREATE OR ALTER PROCEDURE GetAssignedHotelIdByUserId
    @UserId INT
AS
BEGIN
    SET NOCOUNT ON;

    SELECT
        hotelId
    FROM HotelUsers
    WHERE userId = @UserId;
END;