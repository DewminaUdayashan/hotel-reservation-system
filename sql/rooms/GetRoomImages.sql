CREATE OR ALTER PROCEDURE GetRoomImages
    @roomId INT
AS
BEGIN
    SET NOCOUNT ON;

    SELECT 
        I.id,
        I.imageUrl as url
    FROM RoomImages RI
    INNER JOIN Images I ON RI.imageId = I.id
    WHERE RI.roomId = @roomId;
END;