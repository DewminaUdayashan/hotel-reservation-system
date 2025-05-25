CREATE OR ALTER PROCEDURE GetAllHotels
AS
BEGIN
    SET NOCOUNT ON;

    SELECT 
        id,
        name,
        location,
        description,
        mapUrl,
        logoUrl,
        createdAt
    FROM Hotels
    ORDER BY createdAt DESC;
END;