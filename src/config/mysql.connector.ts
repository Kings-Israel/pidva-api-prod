import { createPool, Pool} from 'mysql';
import { DATA_SOURCES } from './config';
const dataSource = DATA_SOURCES.mySqlDataSource;

let pool: Pool;

/**
 * generates pool connection to be used throughout the app
 */
export const init = async () => {
  try {
    pool = createPool({
      connectionLimit: dataSource.DB_CONNECTION_LIMIT,
      host: dataSource.DB_HOST,
      user: dataSource.DB_USER,
      password: dataSource.DB_PASSWORD,
      database: dataSource.DB_DATABASE,
    });
     
    // await createApiTable(pool);
    console.debug('MySql Adapter Pool generated successfully');
  } catch (error) {
    console.error('[mysql.connector][init][Error]: ', error);
    throw new Error('failed to initialized pool');
  }
};

/**
 * executes SQL queries in MySQL db
 *
 * @param {string} query - provide a valid SQL query
 * @param {string[] | Object} params - provide the parameterized values used
 * in the query
 */
export const execute = <T>(query: string, params: string[] | Object): Promise<T> => {
  try {
    if (!pool) throw new Error('Pool was not created. Ensure pool is created when running the app.');

    return new Promise<T>((resolve, reject) => {
      pool.query(query, params, (error, results) => {
        if (error) reject(error);
        else resolve(results);
      });
    });

  } catch (error) {
    console.error('[mysql.connector][execute][Error]: ', error);
    throw new Error('failed to execute MySQL query');
  }
}

const createApiTable =<T>(connection) : Promise<T>=>{
  return new Promise<T>((resolve, reject) => {
    try {
      let createApiTableSql = `create table if not exists pel_api_request(
        id int primary key auto_increment,
        request_type varchar(255)not null,
        request_sub_type varchar(255)not null,
        client_reference varchar(255)not null,
        system_reference varchar(255)not null,
        channel varchar(255)not null,
        callback_url varchar(255)not null,
        number_of_records varchar(255)not null,
        validation_status varchar(255)not null,
        upload_path varchar(255)not null,
        callback_status varchar(255)not null,
        request_date varchar(255)not null,
        completed tinyint(1) not null default 0
    )`;

    connection.query(createApiTableSql, function(err, results, fields) {
      if (err) {
        console.log(err.message);
        return reject(err)
      }
      return resolve(results)
    });
    }
    catch (err) {
      return reject(err)
    }

  })
}