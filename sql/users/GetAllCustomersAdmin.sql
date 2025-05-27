-- STEP 1: STORED PROCEDURE
CREATE OR ALTER PROCEDURE GetAllCustomersAdmin
    @page INT = 1,
    @pageSize INT = 10,
    @search NVARCHAR(255) = NULL,
    @customerType NVARCHAR(20) = NULL,
    @orderBy NVARCHAR(50) = 'createdAt',
    @orderDir NVARCHAR(4) = 'DESC'
AS
BEGIN
    SET NOCOUNT ON;

    DECLARE @offset INT = (@page - 1) * @pageSize;

    -- Base query
    WITH CustomerData AS (
        SELECT
            U.id AS userId,
            U.email,
            U.firstName,
            U.lastName,
            U.role,
            U.createdAt,
            U.isActive,
            C.id AS customerId,
            C.phone,
            C.homeTown,
            C.customerType,
            C.agencyId,
            A.name AS agencyName,
            A.phone AS agencyPhone,
            COUNT(*) OVER () AS TotalCount
        FROM Users U
        INNER JOIN Customers C ON U.id = C.id
        LEFT JOIN Agencies A ON C.agencyId = A.id
        WHERE
            (@search IS NULL OR 
             U.firstName LIKE '%' + @search + '%' OR
             U.lastName LIKE '%' + @search + '%' OR
             U.email LIKE '%' + @search + '%' OR
             A.name LIKE '%' + @search + '%')
            AND (@customerType IS NULL OR C.customerType = @customerType)
    )
    SELECT *
    FROM CustomerData
    ORDER BY
        CASE WHEN @orderBy = 'createdAt' AND @orderDir = 'ASC' THEN createdAt END ASC,
        CASE WHEN @orderBy = 'createdAt' AND @orderDir = 'DESC' THEN createdAt END DESC
    OFFSET @offset ROWS FETCH NEXT @pageSize ROWS ONLY;
END