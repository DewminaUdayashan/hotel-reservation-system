CREATE TYPE RoomImageInput AS TABLE (
    imageUrl NVARCHAR(MAX)
);

CREATE PROCEDURE CreateRoom
    @name NVARCHAR(255),
    @description NVARCHAR(MAX) = NULL,
    @status NVARCHAR(20),
    @type INT,
    @bedType NVARCHAR(100) = NULL,
    @viewType NVARCHAR(100) = NULL,
    @hotelId INT,
    @images RoomImageInput READONLY
AS
BEGIN
    SET NOCOUNT ON;

    DECLARE @roomId INT;

    -- Table variable to hold inserted image IDs
    DECLARE @insertedImages TABLE (imageId INT);

    BEGIN TRY
        BEGIN TRANSACTION;

        -- Insert into Rooms
        INSERT INTO Rooms (name, description, status, type, bedType, viewType, hotelId)
        VALUES (@name, @description, @status, @type, @bedType, @viewType, @hotelId);

        SET @roomId = SCOPE_IDENTITY();

        -- Insert images into Images table, collect their IDs
        IF EXISTS (SELECT 1 FROM @images)
        BEGIN
            INSERT INTO Images (imageUrl)
            OUTPUT INSERTED.id INTO @insertedImages(imageId)
            SELECT imageUrl FROM @images;

            -- Insert into RoomImages using collected image IDs
            INSERT INTO RoomImages (imageId, roomId)
            SELECT imageId, @roomId FROM @insertedImages;
        END

        COMMIT;
    END TRY
    BEGIN CATCH
        IF @@TRANCOUNT > 0
            ROLLBACK;

        THROW;
    END CATCH
END;