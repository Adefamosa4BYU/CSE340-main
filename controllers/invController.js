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

invCont.buildManagement = async (req, res) => {
  const nav = await utilities.getNav()
  res.render("inventory/management", {
    title: "Inventory Management",
    nav,
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

  if (result) {
    req.flash("notice", "Inventory item added successfully.")
    res.status(201).render("inventory/management", {
      title: "Inventory",
      nav,
      errors: null
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


module.exports = invCont
