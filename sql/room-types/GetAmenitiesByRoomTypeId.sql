CREATE OR ALTER PROCEDURE GetAmenitiesByRoomTypeId
    @RoomTypeId INT
AS
BEGIN
    SET NOCOUNT ON;

    SELECT A.id, A.amenity as name
    FROM RoomTypeAmenities RTA
    INNER JOIN Amenities A ON RTA.amenitiesId = A.id
    WHERE RTA.roomTypeId = @RoomTypeId
    ORDER BY A.amenity;
END;


