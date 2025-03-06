-- Check the structure of the existing function
SELECT 
  routines.routine_name, 
  routines.data_type AS return_type,
  parameters.parameter_name,
  parameters.data_type AS parameter_type
FROM 
  information_schema.routines
LEFT JOIN
  information_schema.parameters ON 
    routines.specific_name = parameters.specific_name
WHERE 
  routines.routine_name = 'add_credits'
ORDER BY
  routines.routine_name,
  parameters.ordinal_position; 