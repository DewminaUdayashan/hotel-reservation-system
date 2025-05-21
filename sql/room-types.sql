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


CREATE OR ALTER PROCEDURE GetAmenitiesByRoomTypeId
    @RoomTypeId INT
AS
BEGIN
    SET NOCOUNT ON;

    SELECT A.id, A.amenity
    FROM RoomTypeAmenities RTA
    INNER JOIN Amenities A ON RTA.amenitiesId = A.id
    WHERE RTA.roomTypeId = @RoomTypeId
    ORDER BY A.amenity;
END;

CREATE OR ALTER PROCEDURE GetImagesByRoomTypeId
    @RoomTypeId INT
AS
BEGIN
    SET NOCOUNT ON;

    SELECT I.id, I.imageUrl
    FROM RoomTypeImages RTI
    INNER JOIN Images I ON RTI.imageId = I.id
    WHERE RTI.roomTypeId = @RoomTypeId
    ORDER BY I.id;
END;

