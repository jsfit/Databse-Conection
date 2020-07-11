SELECT t.TABLE_TYPE,
    t.TABLE_NAME,
    c.COLUMN_NAME,
    c.IS_NULLABLE,
    c.DATA_TYPE,
    c.CHARACTER_MAXIMUM_LENGTH,
    pk.CONSTRAINT_TYPE,
    COLUMN_DEFAULT,
    COLUMNPROPERTY(
        OBJECT_ID(c.TABLE_SCHEMA + '.' + c.TABLE_NAME),
        c.COLUMN_NAME,
        'IsIdentity'
    ) as 'IS_IDENTITY',
    prop.value AS 'COMMENT'
FROM [NorthwindDev].INFORMATION_SCHEMA.TABLES t
    INNER JOIN [NorthwindDev].INFORMATION_SCHEMA.COLUMNS c ON t.TABLE_NAME = c.TABLE_NAME
        AND t.TABLE_SCHEMA = c.TABLE_SCHEMA
    LEFT JOIN (
        SELECT tc.table_schema,
        tc.table_name,
        cu.column_name,
        tc.constraint_type
    FROM [NorthwindDev].information_schema.TABLE_CONSTRAINTS tc
        JOIN [NorthwindDev].information_schema.KEY_COLUMN_USAGE cu ON tc.table_schema = cu.table_schema
            and tc.table_name = cu.table_name
            and tc.constraint_name = cu.constraint_name
            and tc.constraint_type = 'PRIMARY KEY'
    ) pk ON pk.table_schema = c.table_schema
        AND pk.table_name = c.table_name
        AND pk.column_name = c.column_name
    INNER JOIN [NorthwindDev].sys.columns AS sc ON sc.object_id = object_id(t.table_schema + '.' + t.table_name)
        AND sc.name = c.column_name
    LEFT JOIN [NorthwindDev].sys.extended_properties prop ON prop.major_id = sc.object_id
        AND prop.minor_id = sc.column_id
        AND prop.name = 'MS_Description'
ORDER BY t.TABLE_NAME;

SELECT a.ROUTINE_TYPE AS TABLE_TYPE,
    a.SPECIFIC_NAME AS TABLE_NAME,
    b.PARAMETER_NAME AS COLUMN_NAME,
    b.DATA_TYPE,
    b.CHARACTER_MAXIMUM_LENGTH,
    b.PARAMETER_MODE AS PARAMETER_TYPE
FROM NorthwindDev.INFORMATION_SCHEMA.ROUTINES a
    INNER JOIN NorthwindDev.INFORMATION_SCHEMA.PARAMETERS b ON a.SPECIFIC_NAME = b.SPECIFIC_NAME
WHERE a.SPECIFIC_NAME NOT LIKE 'sp_%'
    AND a.SPECIFIC_NAME NOT LIKE 'fn_%'
ORDER BY a.ROUTINE_TYPE,
    a.ROUTINE_NAME