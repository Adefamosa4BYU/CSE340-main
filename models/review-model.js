const pool = require("../database/");

/* *****************************
*   Get reviews for a vehicle
* ***************************** */
async function getReviewsByInventory(inv_id) {
  try {
    const sql = `
      SELECT r.*, c.account_firstname, c.account_lastname
      FROM reviews r
      JOIN account c ON r.account_id = c.account_id
      WHERE r.inv_id = $1
      ORDER BY r.created_at DESC
    `;
    const result = await pool.query(sql, [inv_id]);
    return result.rows; // returns array of reviews
  } catch (error) {
    return new Error("Unable to get reviews");
  }
}

/* *****************************
*   Get reviews by a client
* ***************************** */
async function getReviewsByUser(account_id) {
  try {
    const sql = `
      SELECT * FROM reviews
      WHERE account_id = $1
      ORDER BY created_at DESC
    `;
    const result = await pool.query(sql, [account_id]);
    return result.rows;
  } catch (error) {
    return new Error("Unable to get user's reviews");
  }
}

/* *****************************
*   Add a new review
* ***************************** */
async function addReview(inv_id, account_id, rating, review_text) {
  try {
    const sql = `
      INSERT INTO reviews (inv_id, account_id, rating, review_text)
      VALUES ($1, $2, $3, $4)
      RETURNING *
    `;
    const result = await pool.query(sql, [inv_id, account_id, rating, review_text]);
    return result.rows[0];
  } catch (error) {
    return new Error("Unable to add review");
  }
}

/* *****************************
*   Update a review
* ***************************** */
async function updateReview(review_id, rating, review_text, account_id) {
  try {
    // Ensure the review belongs to the user
    const sql = `
      UPDATE reviews
      SET rating = $1,
          review_text = $2,
          created_at = now()
      WHERE review_id = $3
        AND account_id = $4
      RETURNING *
    `;
    const result = await pool.query(sql, [rating, review_text, review_id, account_id]);
    return result.rows[0] || null;
  } catch (error) {
    console.error(error);
    return null;
  }
}


/* *****************************
*   Delete a review
* ***************************** */
async function deleteReview(review_id, account_id) {
  try {
    const sql = `
      DELETE FROM reviews
      WHERE review_id = $1
        AND account_id = $2
      RETURNING review_id
    `;
    const result = await pool.query(sql, [review_id, account_id]);
    return result.rowCount; // 1 if deleted, 0 if not found
  } catch (error) {
    console.error(error);
    return 0;
  }
}


async function getReviewByVehicleAndAccount(inv_id, account_id) {
  try {
    const sql = `
      SELECT * FROM reviews
      WHERE inv_id = $1 AND account_id = $2
    `
    const result = await pool.query(sql, [inv_id, account_id])
    return result.rows[0]
  } catch (error) {
    console.error("getReviewByVehicleAndAccount error:", error)
  }
}

/* *****************************
*   Get a single review by ID
* ***************************** */
async function getReviewById(review_id) {
  try {
    const sql = `
      SELECT * FROM reviews
      WHERE review_id = $1
    `;
    const result = await pool.query(sql, [review_id]);
    return result.rows[0] || null; // return null if not found
  } catch (error) {
    console.error("Error fetching review by ID:", error);
    return null;
  }
}

module.exports = {
  getReviewsByInventory,
  getReviewsByUser,
  addReview,
  updateReview,
  deleteReview,
  getReviewByVehicleAndAccount,
  getReviewById
};
