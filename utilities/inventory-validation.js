const utilities = require(".")
const { body, validationResult } = require("express-validator")
const validate = {}

validate.isEmptyvalidateClassification = () => {
  return [
    body("classification_name")
      .trim()
      .isAlpha()
      .escape()
      .notEmpty()
      .withMessage("Classification name must contain only letters.")
  ]
}

validate.checkClassificationData = async (req, res, next) => {
  let errors = []
    errors = validationResult(req)
  if (!errors.isEmpty()) {
    let nav = await utilities.getNav()
    res.render("inventory/add-classification", {
        errors,
      title: "Add Classification",
      nav,
    })
    return
  }
  next()
}



/* ******************************
 * Inventory Data Validation Rules
 * ***************************** */
validate.inventoryRules = () => {
  return [
    body("classification_id")
      .notEmpty()
      .withMessage("Please select a classification."),

    body("inv_make")
      .trim()
      .notEmpty()
      .withMessage("Make is required."),

    body("inv_model")
      .trim()
      .notEmpty()
      .withMessage("Model is required."),

    body("inv_year")
      .isInt({ min: 1900, max: 2099 })
      .withMessage("Year must be a valid number."),

    body("inv_description")
      .trim()
      .notEmpty()
      .withMessage("Description is required."),

    body("inv_image")
      .trim()
      .notEmpty()
      .withMessage("Image path is required."),

    body("inv_thumbnail")
      .trim()
      .notEmpty()
      .withMessage("Thumbnail path is required."),

    body("inv_price")
      .isFloat({ min: 0 })
      .withMessage("Price must be a valid number."),

    body("inv_miles")
      .isInt({ min: 0 })
      .withMessage("Miles must be a valid number."),

    body("inv_color")
      .trim()
      .notEmpty()
      .withMessage("Color is required.")
  ]
}


/* ******************************
 * Check inventory data and return errors
 * ***************************** */
validate.checkInventoryData = async (req, res, next) => {
  const {
    classification_id,
    inv_make,
    inv_model,
    inv_year,
    inv_description,
    inv_image,
    inv_thumbnail,
    inv_price,
    inv_miles,
    inv_color,
  } = req.body

  const errors = validationResult(req)

  if (!errors.isEmpty()) {
    const nav = await utilities.getNav()
    const classificationList =
      await utilities.buildClassificationList(classification_id)

    res.render("inventory/add-inventory", {
      title: "Add Inventory",
      nav,
      classificationList,
      errors,
      classification_id,
      inv_make,
      inv_model,
      inv_year,
      inv_description,
      inv_image,
      inv_thumbnail,
      inv_price,
      inv_miles,
      inv_color,
    })
    return
  }
  next()
}

module.exports = validate
