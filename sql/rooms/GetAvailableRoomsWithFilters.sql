CREATE OR ALTER PROCEDURE GetAvailableRoomsWithFilters
    @checkIn DATE = NULL,
    @checkOut DATE = NULL,
    @type INT = NULL,
    @capacity INT = NULL,
    @minPrice DECIMAL(10, 2) = NULL,
    @maxPrice DECIMAL(10, 2) = NULL,
    @hotelId INT = NULL
AS
BEGIN
    SET NOCOUNT ON;

    SELECT 
        R.id,
        R.name,
        R.description,
        R.status,
        R.type,
        R.hotelId,
        R.bedType,
        R.viewType,
        RT.name AS roomTypeName,
        RT.description AS roomTypeDescription,
        RT.capacity,
        RT.price,
        RT.weeklyRate,
        RT.monthlyRate,
        RT.isResidential,

        -- Show isReserved only if no filters are applied
        CASE 
            WHEN 
                @checkIn IS NULL AND @checkOut IS NULL AND
                @type IS NULL AND @capacity IS NULL AND
                @minPrice IS NULL AND @maxPrice IS NULL AND
                @hotelId IS NULL
            THEN 
                CASE 
                    WHEN EXISTS (
                        SELECT 1 FROM Reservations Res
                        WHERE Res.roomId = R.id
                        AND Res.status IN ('pending', 'confirmed', 'checked-in')
                    )
                    THEN 1 ELSE 0
                END
            ELSE NULL
        END AS isReserved

    FROM Rooms R
    INNER JOIN RoomTypes RT ON R.type = RT.id

    WHERE
        (
            -- No filters: include all room statuses
            @checkIn IS NULL AND @checkOut IS NULL AND
            @type IS NULL AND @capacity IS NULL AND
            @minPrice IS NULL AND @maxPrice IS NULL AND
            @hotelId IS NULL
        )
        OR
        (
            -- Filters are applied: restrict to only 'available' rooms
            R.status = 'available'
        )

        -- If check-in and check-out are provided, exclude rooms with overlapping reservations
        AND (
            @checkIn IS NULL OR @checkOut IS NULL OR
            NOT EXISTS (
                SELECT 1
                FROM Reservations Res
                WHERE Res.roomId = R.id
                AND Res.status IN ('pending', 'confirmed', 'checked-in')
                AND (@checkIn < Res.checkOutDate AND @checkOut > Res.checkInDate)
            )
        )

        -- Optional filters
        AND (@type IS NULL OR R.type = @type)
        AND (@capacity IS NULL OR RT.capacity >= @capacity)
        AND (@minPrice IS NULL OR RT.price >= @minPrice)
        AND (@maxPrice IS NULL OR RT.price <= @maxPrice)
        AND (@hotelId IS NULL OR R.hotelId = @hotelId)

    ORDER BY RT.price ASC;
END;