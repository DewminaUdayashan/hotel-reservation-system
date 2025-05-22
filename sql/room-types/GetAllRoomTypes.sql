CREATE OR ALTER PROCEDURE GetAllRoomTypes
AS
BEGIN
    SET NOCOUNT ON;

    SELECT
        id,
        name,
        description,
        capacity,
        price,
        weeklyRate,
        monthlyRate,
        isResidential,
        bedType,
        viewType
    FROM RoomTypes
    ORDER BY id;
END;