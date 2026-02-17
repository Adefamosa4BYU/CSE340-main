const utilities = require(".")
const { body, validationResult } = require("express-validator")
const reviewModel = require("../models/review-model")
const invModel = require("../models/inventory-model")
const validate = {}

/* ******************************
 * Review Validation Rules
 * ***************************** */
validate.reviewRules = () => {
  return [
    body("rating")
      .trim()
      .notEmpty()
      .withMessage("Rating is required.")
      .isInt({ min: 1, max: 5 })
      .withMessage("Rating must be between 1 and 5."),

    body("review_text")
      .trim()
      .notEmpty()
      .withMessage("Review text is required.")
      .isLength({ min: 3 })
      .withMessage("Review must be at least 3 characters long."),

    body("inv_id")
      .trim()
      .notEmpty()
      .withMessage("Invalid inventory item.")
  ]
}


/* ******************************
 * Check Review Data
 * ***************************** */
validate.checkReviewData = async (req, res, next) => {
  const { inv_id, rating, review_text } = req.body
  let errors = []
  errors = validationResult(req)

  const data = await invModel.getVehicleById(inv_id)

   if (!data || data.length === 0) {
      const err = new Error("Vehicle not found")
      err.status = 404
      return next(err)
    }

    const vehicle = data[0]

  if (!errors.isEmpty()) {
    let nav = await utilities.getNav()

    
    const reviews = await reviewModel.getReviewsByInventory(inv_id)

    res.render("inventory/vehicle-detail", {
      title: "Vehicle Details",
      nav,
      errors,
      reviews,
      vehicleId: inv_id,
      rating,
      review_text,
      vehicle,
    })
    return
  }
  next()
}

module.exports = validate