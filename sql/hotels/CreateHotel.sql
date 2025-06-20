CREATE TYPE HotelImageInput AS TABLE (
    imageUrl NVARCHAR(MAX),
    caption NVARCHAR(255)
);

CREATE PROCEDURE CreateHotel
    @name NVARCHAR(255),
    @location NVARCHAR(255) = NULL,
    @description NVARCHAR(MAX) = NULL,
    @mapUrl NVARCHAR(MAX) = NULL,
    @logoUrl NVARCHAR(MAX) = NULL,
    @images HotelImageInput READONLY
AS
BEGIN
    SET NOCOUNT ON;

    DECLARE @hotelId INT;

    BEGIN TRY
        BEGIN TRANSACTION;

        -- Insert into Hotels table
        INSERT INTO Hotels (name, location, description, mapUrl, logoUrl)
        VALUES (@name, @location, @description, @mapUrl, @logoUrl);

        -- Get the newly created hotel ID
        SET @hotelId = SCOPE_IDENTITY();

        -- Insert images if any provided
        IF EXISTS (SELECT 1 FROM @images)
        BEGIN
            INSERT INTO HotelImages (hotelId, imageUrl, caption)
            SELECT @hotelId, imageUrl, caption FROM @images;
        END

        COMMIT;
    END TRY
    BEGIN CATCH
        IF @@TRANCOUNT > 0
            ROLLBACK;

        THROW;
    END CATCH
END;