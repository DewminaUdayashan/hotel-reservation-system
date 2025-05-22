CREATE OR ALTER PROCEDURE GetRoomDetailsById
    @roomId INT
AS
BEGIN
    SET NOCOUNT ON;

    SELECT 
        R.id,
        R.name,
        R.description,
        R.status,
        R.type,
        R.bedType,
        R.viewType,
        RT.name AS roomTypeName,
        RT.description AS roomTypeDescription,
        RT.capacity,
        RT.price,
        RT.weeklyRate,
        RT.monthlyRate,
        RT.isResidential
    FROM Rooms R
    INNER JOIN RoomTypes RT ON R.type = RT.id
    WHERE R.id = @roomId;
END;
