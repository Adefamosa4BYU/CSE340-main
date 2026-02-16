const invModel = require("../models/inventory-model")
const utilities = require("../utilities/")

const invCont = {}

/* ***************************
 *  Build inventory by classification view
 * ************************** */
invCont.buildByClassificationId = async function (req, res, next) {
  const classification_id = req.params.classificationId
  const data = await invModel.getInventoryByClassificationId(classification_id)

  const grid = await utilities.buildClassificationGrid(data)
  let nav = await utilities.getNav()
  const className = data[0].classification_name
  res.render("./inventory/classification", {
    title: className + " vehicles",
    nav,
    grid,
  })
}


/* ***************************
 * Build single vehicle detail view
 ************************** */
invCont.buildVehicleDetail = async function (req, res, next) {
  try {
    const inv_id = parseInt(req.params.inv_id)
    const data = await invModel.getVehicleById(inv_id)

    if (!data || data.length === 0) {
      const err = new Error("Vehicle not found")
      err.status = 404
      return next(err)
    }

    const vehicle = data[0]
    const nav = await utilities.getNav()

    res.render("inventory/vehicle-detail", {
      title: `${vehicle.inv_make} ${vehicle.inv_model}`,
      nav,
      vehicle
    })
  } catch (err) {
    next(err)
  }
}

invCont.buildManagement = async (req, res, next) => {
  const nav = await utilities.getNav()
  const classificationSelect = await utilities.buildClassificationList()
  res.render("inventory/management", {
    title: "Inventory Management",
    nav,
    classificationSelect,
    errors: null,
  })
}


invCont.buildAddClassification = async (req, res) => {
  const nav = await utilities.getNav()
  res.render("inventory/add-classification", {
    title: "Add Classification",
    nav,
    errors: null
  })
}


invCont.addClassification = async (req, res) => {
  const nav = await utilities.getNav()
  const { classification_name } = req.body
  const result = await invModel.addClassification(classification_name)

  if (result) {
    req.flash("notice", "Classification added successfully.")
    res.status(201).render("inventory/management", {
      title: "Inventory",
      nav,
      errors: null
    })
  } else {
    req.flash("notice", "Sorry, the classification could not be added.")
    res.status(501).render("/inv/add-classification", {
      title: "Add Classification",
      nav,
      errors:null
    })
  }
}


invCont.buildAddInventory = async (req, res) => {
  const nav = await utilities.getNav()
  const classificationList = await utilities.buildClassificationList()

  res.render("inventory/add-inventory", {
    title: "Add Inventory",
    nav,
    classificationList,
    errors: null,
  })
}


invCont.addInventory = async (req, res) => {
  const nav = await utilities.getNav()
  const result = await invModel.addInventory(req.body)

  const classificationSelect = await utilities.buildClassificationList()

  if (result) {
    req.flash("notice", "Inventory item added successfully.")
    res.status(201).render("inventory/management", {
      title: "Inventory",
      nav,
      errors: null,
      classificationSelect,
    })
  } else {
    req.flash("notice", "Sorry, the inventory item could not be added.")
     res.status(501).render("/inv/add-inventory", {
      title: "Add Classification",
      nav,
      errors:null
    })
  }
}


/* ***************************
 *  Return Inventory by Classification As JSON
 * ************************** */
invCont.getInventoryJSON = async (req, res, next) => {
  const classification_id = parseInt(req.params.classification_id)

  console.log("Testing Something", classification_id)

  const invData = await invModel.getInventoryByClassificationId(classification_id)

  // if (invData.length > 0) {
  if (invData[0].inv_id) {
    return res.json(invData)
  } else {
    next(new Error("No data returned"))
  }
}


/* ***************************
 *  Build edit inventory view
 * ************************** */
invCont.editInventoryView = async function (req, res, next) {

  const inv_id = parseInt(req.params.inv_id)

  let nav = await utilities.getNav()

  const itemData = (await invModel.getInventoryById(inv_id))[0]

  const classificationSelect =
    await utilities.buildClassificationList(itemData.classification_id)


  const itemName = `${itemData.inv_make} ${itemData.inv_model}`

  res.render("inventory/edit-inventory", {
    title: "Edit " + itemName,
    nav,
    classificationSelect,
    errors: null,
    inv_id: itemData.inv_id,
    inv_make: itemData.inv_make,
    inv_model: itemData.inv_model,
    inv_year: itemData.inv_year,
    inv_description: itemData.inv_description,
    inv_image: itemData.inv_image,
    inv_thumbnail: itemData.inv_thumbnail,
    inv_price: itemData.inv_price,
    inv_miles: itemData.inv_miles,
    inv_color: itemData.inv_color,
    classification_id: itemData.classification_id
  })
}


/* ***************************
 *  Update Inventory Data
 * ************************** */
invCont.updateInventory = async function (req, res, next) {

  let nav = await utilities.getNav()

  const {
    inv_id,
    inv_make,
    inv_model,
    inv_description,
    inv_image,
    inv_thumbnail,
    inv_price,
    inv_year,
    inv_miles,
    inv_color,
    classification_id
  } = req.body

  const updateResult = await invModel.updateInventory(
    inv_id,
    inv_make,
    inv_model,
    inv_description,
    inv_image,
    inv_thumbnail,
    inv_price,
    inv_year,
    inv_miles,
    inv_color,
    classification_id
  )

  if (updateResult) {

    const itemName = `${updateResult.inv_make} ${updateResult.inv_model}`

    req.flash("notice", `The ${itemName} was successfully updated.`)

    return res.redirect("/inv/")
  }

  // If update fails
  const classificationSelect =
    await utilities.buildClassificationList(classification_id)

  const itemName = `${inv_make} ${inv_model}`

  req.flash("notice", "Sorry, the update failed.")

  res.status(501).render("inventory/edit-inventory", {
    title: "Edit " + itemName,
    nav,
    classificationSelect,
    errors: null,
    inv_id,
    inv_make,
    inv_model,
    inv_year,
    inv_description,
    inv_image,
    inv_thumbnail,
    inv_price,
    inv_miles,
    inv_color,
    classification_id
  })
}

module.exports = invCont
