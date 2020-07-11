SELECT *
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
        where col.owner = UPPER('hr')
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
        where col.owner = UPPER('hr')
) col
ORDER BY table_name;


SELECT
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
WHERE aa.owner = UPPER('hr') AND dep.REFERENCED_OWNER = UPPER('hr')



