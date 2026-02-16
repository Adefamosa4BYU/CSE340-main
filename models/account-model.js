const pool = require("../database/")


/* *****************************
*   Register new account
* *************************** */
async function registerAccount(account_firstname, account_lastname, account_email, account_password){
  try {
    const sql = "INSERT INTO account (account_firstname, account_lastname, account_email, account_password, account_type) VALUES ($1, $2, $3, $4, 'Client') RETURNING *"
    return await pool.query(sql, [account_firstname, account_lastname, account_email, account_password])
  } catch (error) {
    return error.message
  }
}


/* **********************
 *   Check for existing email
 * ********************* */
async function checkExistingEmail(account_email){
  try {
    const sql = "SELECT * FROM account WHERE account_email = $1"
    const email = await pool.query(sql, [account_email])
    return email.rowCount
  } catch (error) {
    return error.message
  }
}


/* *****************************
* Return account data using email address
* ***************************** */
async function getAccountByEmail(account_email) {
  try {
    const result = await pool.query(
      'SELECT account_id, account_firstname, account_lastname, account_email, account_type, account_password FROM account WHERE account_email = $1',
      [account_email])
    return result.rows[0]
  } catch (error) {
    return new Error("No matching email found")
  }
}


async function getAccountById(account_id) {
  try {
    const sql = `
      SELECT * FROM account
      WHERE account_id = $1
    `
    const result = await pool.query(sql, [account_id]);
    if (result.rows.length > 0) {
      return result.rows[0];
    }
    return null;
    // return pool.query(sql, [account_id])
  } catch (error) {
    return new Error("No matching account id")
  }
}


async function updateAccount(firstname, lastname, email, id) {
  try {
      const sql = `
    UPDATE account
    SET account_firstname = $1,
        account_lastname = $2,
        account_email = $3
    WHERE account_id = $4
    RETURNING *
  `
  // return pool.query(sql, [firstname, lastname, email, id])
  const result = await pool.query(sql, [firstname, lastname, email, account_id]);
  if (result.rows.length > 0) {  
  return result.rows[0];
  }
  return null
  } catch (error) {
    return new Error("Something went wrong")
  }
}

async function updatePassword(password, id) {
  try {
    const sql = `
      UPDATE account
      SET account_password = $1
      WHERE account_id = $2
      RETURNING *
    `
    return pool.query(sql, [password, id])
  } catch (error) {
    return new Error("Something went wrong")
  }
}

module.exports = { registerAccount, checkExistingEmail, getAccountByEmail, getAccountById, updateAccount, updatePassword }