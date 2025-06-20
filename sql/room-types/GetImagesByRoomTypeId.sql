CREATE OR ALTER PROCEDURE GetImagesByRoomTypeId
    @RoomTypeId INT
AS
BEGIN
    SET NOCOUNT ON;

    SELECT I.id, I.imageUrl as url
    FROM RoomTypeImages RTI
    INNER JOIN Images I ON RTI.imageId = I.id
    WHERE RTI.roomTypeId = @RoomTypeId
    ORDER BY I.id;
END;
