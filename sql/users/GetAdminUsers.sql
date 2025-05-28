CREATE OR ALTER PROCEDURE GetAdminUsers
    @page INT = 1,
    @pageSize INT = 10,
    @search NVARCHAR(255) = NULL,
    @role NVARCHAR(50) = NULL,
    @hotelId INT = NULL,
    @orderBy NVARCHAR(50) = 'createdAt',
    @orderDir NVARCHAR(4) = 'DESC'
AS
BEGIN
    SET NOCOUNT ON;

    DECLARE @offset INT = (@page - 1) * @pageSize;

    -- Base query
    WITH StaffData AS (
        SELECT
            U.id,
            U.email,
            U.firstName,
            U.lastName,
            U.role,
            U.createdAt,
            U.isActive,
            HU.hotelId,
            H.name AS hotelName,
            COUNT(*) OVER() AS TotalCount
        FROM Users U
        LEFT JOIN HotelUsers HU ON U.id = HU.userId
        LEFT JOIN Hotels H ON HU.hotelId = H.id
        WHERE
            U.role IN ('clerk','manager','admin')
            AND (@role IS NULL OR U.role = @role)
            AND (@search IS NULL OR
                 LOWER(U.firstName) LIKE '%' + LOWER(@search) + '%' OR
                 LOWER(U.lastName) LIKE '%' + LOWER(@search) + '%' OR
                 LOWER(U.email) LIKE '%' + LOWER(@search) + '%' OR
                 LOWER(H.name) LIKE '%' + LOWER(@search) + '%')
            AND (@hotelId IS NULL OR HU.hotelId = @hotelId)
    )
    SELECT *
    FROM StaffData
    ORDER BY
        CASE WHEN @orderBy = 'createdAt' AND @orderDir = 'ASC' THEN createdAt END ASC,
        CASE WHEN @orderBy = 'createdAt' AND @orderDir = 'DESC' THEN createdAt END DESC,
        CASE WHEN @orderBy = 'firstName' AND @orderDir = 'ASC' THEN firstName END ASC,
        CASE WHEN @orderBy = 'firstName' AND @orderDir = 'DESC' THEN firstName END DESC
    OFFSET @offset ROWS FETCH NEXT @pageSize ROWS ONLY;
END
