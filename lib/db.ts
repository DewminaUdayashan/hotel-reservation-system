const sql = require("mssql");

const config = {
  user: process.env.DB_USER, // e.g., 'sa' or another SQL login
  password: process.env.DB_PASSWORD, // Your SQL login password
  server: process.env.DB_SERVER, // IP or hostname of your Windows Server
  database: process.env.DB_NAME, // The name of the DB you created
  options: {
    encrypt: false, // Set to false unless you're using SSL
    trustServerCertificate: true, // Required if self-signed certs are used
  },
};

export async function getConnection() {
  try {
    const pool = await sql.connect(config);
    return pool;
  } catch (err) {
    console.error("Database connection error: ", err);
    throw err;
  }
}

/**
 * Executes a query with optional parameters.
 * @param query SQL string (can include named parameters like @id)
 * @param params Optional array of { name, value } objects
 */
export async function executeQuery(
  query: string,
  params?: { name: string; value: any; type?: any }[]
) {
  try {
    const pool = await getConnection();
    const request = pool.request();

    if (params && Array.isArray(params)) {
      params.forEach((param) => {
        if (param.type) {
          request.input(param.name, param.type, param.value);
        } else {
          request.input(param.name, param.value); // fallback
        }
      });
    }

    const result = await request.query(query);
    return result.recordset;
  } catch (err) {
    console.error("Error executing query: ", err);
    throw err;
  }
}

export async function executeQueryForRecordSets(
  query: string,
  params?: { name: string; value: any }[]
) {
  try {
    const pool = await getConnection();
    const request = pool.request();

    // Add parameters if provided
    if (params && Array.isArray(params)) {
      params.forEach((param) => {
        request.input(param.name, param.value);
      });
    }

    const result = await request.query(query); // or .execute() if you're calling SPs
    return result.recordsets; // Supports multiple result sets
  } catch (err) {
    console.error("Error executing query: ", err);
    throw err;
  }
}
