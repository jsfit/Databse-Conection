module.exports = {
  Oracle: [
    `SELECT *
    FROM
        (
            SELECT
                'BASE TABLE' AS "TABLE_TYPE",
                col.table_name,
                col.column_name,
                col.nullable AS "IS_NULLABLE",
                col.data_type,
                col.data_length AS "CHARACTER_MAXIMUM_LENGTH",
                props.CONSTRAINT_TYPE,
                col.DATA_DEFAULT AS "COLUMN_DEFAULT",
                case props.constraint_type 
                when 'P' then 1
                else 0
              end as is_identity,
                tcom.COMMENTS
            from sys.all_tab_columns col
                inner join sys.all_tables t on col.owner = t.owner
                    and col.table_name = t.table_name
                LEFT JOIN (
     SELECT c_pk.CONSTRAINT_TYPE
          , a.table_name
         , a.column_name
         , c.owner
                FROM all_cons_columns a
                    JOIN all_constraints  c ON (a.owner                 = c.owner AND a.constraint_name   = c.constraint_name     )
                    JOIN all_constraints  c_pk ON (c.r_owner               = c_pk.owner AND c.r_constraint_name = c_pk.constraint_name  )
                    JOIN all_cons_columns cc_pk on (cc_pk.constraint_name   = c_pk.constraint_name AND cc_pk.owner         = c_pk.owner            )
    
     ) props ON props.owner = t.owner
                    and props.table_name = t.table_name
                    and props.column_name = col.column_name
                LEFT JOIN (SELECT cc.owner, cc.TABLE_NAME,
                    cc.COLUMN_NAME,
                    cc.COMMENTS
                FROM ALL_COL_COMMENTS cc) tcom ON tcom.owner = t.owner
                    and tcom.table_name = t.table_name
                    and tcom.column_name = col.column_name
            where col.owner = UPPER('%schema%')
        UNION ALL
            SELECT
                'VIEW' AS "TABLE_TYPE",
                col.table_name,
                col.column_name,
                col.nullable AS "IS_NULLABLE",
                col.data_type,
                col.data_length AS "CHARACTER_MAXIMUM_LENGTH",
                props.CONSTRAINT_TYPE,
                col.DATA_DEFAULT AS "COLUMN_DEFAULT",
                case props.constraint_type 
                when 'P' then 1
                else 0
              end as is_identity,
                tcom.COMMENTS
            from sys.all_tab_columns col
                inner join sys.all_views t on col.owner = t.owner
                    and col.table_name = t.view_name
                LEFT JOIN (
     SELECT c_pk.CONSTRAINT_TYPE
          , a.table_name
         , a.column_name
         , c.owner
                FROM all_cons_columns a
                    JOIN all_constraints  c ON (a.owner                 = c.owner AND a.constraint_name   = c.constraint_name     )
                    JOIN all_constraints  c_pk ON (c.r_owner               = c_pk.owner AND c.r_constraint_name = c_pk.constraint_name  )
                    JOIN all_cons_columns cc_pk on (cc_pk.constraint_name   = c_pk.constraint_name AND cc_pk.owner         = c_pk.owner            )
    
     ) props ON props.owner = t.owner
                    and props.table_name = t.view_name
                    and props.column_name = col.column_name
                LEFT JOIN (SELECT cc.owner, cc.TABLE_NAME,
                    cc.COLUMN_NAME,
                    cc.COMMENTS
                FROM ALL_COL_COMMENTS cc) tcom ON tcom.owner = t.owner
                    and tcom.table_name = t.view_name
                    and tcom.column_name = col.column_name
            where col.owner = UPPER('%schema%')
    ) col
    ORDER BY table_name`,
    `SELECT
        dep.TYPE AS "TABLE_TYPE"
    , aa.OBJECT_NAME  AS "TABLE_NAME"
    , aa.ARGUMENT_NAME AS "COLUMN_NAME"
    , aa.DATA_TYPE
    , aa.CHAR_LENGTH AS "CHARACTER_MAXIMUM_LENGTH"
    , aa.IN_OUT AS "PARAMETER_TYPE"
    FROM SYS.ALL_ARGUMENTS aa
        LEFT JOIN (SELECT *
        FROM SYS.ALL_DEPENDENCIES) dep
        ON aa.OBJECT_NAME = dep.name
    WHERE aa.owner = UPPER('%schema%') AND dep.REFERENCED_OWNER = UPPER('%schema%')
    `,
  ],

  Mysql: `SELECT t.TABLE_TYPE,
    t.TABLE_NAME,
    c.COLUMN_NAME,
    c.IS_NULLABLE,
    c.DATA_TYPE,
    c.CHARACTER_MAXIMUM_LENGTH,
    pk.CONSTRAINT_TYPE as "CONSTRAINT_TYPE",
    COLUMN_DEFAULT,
    (
        SELECT
IF(c.Extra = 'auto_increment', 1, 0)
    ) AS 'IS_IDENTITY',
    c.column_comment AS 'COMMENT'
FROM information_schema.TABLES t
    INNER JOIN information_schema.COLUMNS c ON t.TABLE_NAME = c.TABLE_NAME
    AND t.TABLE_SCHEMA = c.TABLE_SCHEMA
    LEFT JOIN
(
        SELECT tc.table_schema,
    tc.table_name,
    cu.column_name,
    tc.constraint_type
FROM information_schema.TABLE_CONSTRAINTS tc
    JOIN information_schema.KEY_COLUMN_USAGE cu ON tc.table_schema = cu.table_schema
        and tc.table_name = cu.table_name
        and tc.constraint_name = cu.constraint_name
        and tc.constraint_type = 'PRIMARY KEY'
    )
pk ON pk.table_schema = c.table_schema
    AND pk.table_name = c.table_name
    AND pk.column_name = c.column_name
WHERE t.TABLE_SCHEMA = '%schema%'
ORDER BY t.TABLE_NAME;

SELECT a.ROUTINE_TYPE AS TABLE_TYPE,
    a.SPECIFIC_NAME AS TABLE_NAME,
    b.PARAMETER_NAME AS COLUMN_NAME,
    b.DATA_TYPE,
    b.CHARACTER_MAXIMUM_LENGTH,
    b.PARAMETER_MODE AS PARAMETER_TYPE
FROM INFORMATION_SCHEMA.ROUTINES a
    INNER JOIN INFORMATION_SCHEMA.PARAMETERS b ON a.SPECIFIC_NAME = b.SPECIFIC_NAME
WHERE a.SPECIFIC_NAME NOT LIKE 'sp_%'
    AND a.SPECIFIC_NAME NOT LIKE 'fn_%'
    AND a.ROUTINE_SCHEMA = '%schema%'
ORDER BY a.ROUTINE_TYPE,
    a.ROUTINE_NAME`,

  Mssql: `SELECT t.TABLE_TYPE,
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
    prop.name AS 'COMMENT'
FROM [%schema%].INFORMATION_SCHEMA.TABLES t
    INNER JOIN [%schema%].INFORMATION_SCHEMA.COLUMNS c ON t.TABLE_NAME = c.TABLE_NAME
        AND t.TABLE_SCHEMA = c.TABLE_SCHEMA
    LEFT JOIN (
        SELECT tc.table_schema,
        tc.table_name,
        cu.column_name,
        tc.constraint_type
    FROM [%schema%].information_schema.TABLE_CONSTRAINTS tc
        JOIN [%schema%].information_schema.KEY_COLUMN_USAGE cu ON tc.table_schema = cu.table_schema
            and tc.table_name = cu.table_name
            and tc.constraint_name = cu.constraint_name
            and tc.constraint_type = 'PRIMARY KEY'
    ) pk ON pk.table_schema = c.table_schema
        AND pk.table_name = c.table_name
        AND pk.column_name = c.column_name
    INNER JOIN [%schema%].sys.columns AS sc ON sc.object_id = object_id(t.table_schema + '.' + t.table_name)
        AND sc.name = c.column_name
    LEFT JOIN [%schema%].sys.extended_properties prop ON prop.major_id = sc.object_id
        AND prop.minor_id = sc.column_id
        AND prop.name = 'MS_Description'
ORDER BY t.TABLE_NAME;
`,
  Mongodb: ``,
};
