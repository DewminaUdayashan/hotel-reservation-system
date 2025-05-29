CREATE OR ALTER PROCEDURE [dbo].[GetRoomTypeById]
    @RoomTypeId INT
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
    WHERE id = @RoomTypeId;
END;
GO
