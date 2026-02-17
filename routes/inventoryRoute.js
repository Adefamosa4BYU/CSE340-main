const express = require("express")
const router = new express.Router() 
const invController = require("../controllers/invController")
const utilities = require("../utilities")
const invValidate = require("../utilities/inventory-validation")

// Route to build inventory by classification view
router.get("/type/:classificationId", utilities.handleErrors(invController.buildByClassificationId));

// Vehicle detail view
router.get(
  "/detail/:inv_id", 
  utilities.handleErrors(invController.buildVehicleDetail))

// Inventory Management View
router.get(
  "/",
  utilities.checkEmployeeOrAdmin,
  utilities.handleErrors(invController.buildManagement)
)

router.get(
  "/add-classification",
  utilities.checkLogin,
  utilities.checkEmployeeOrAdmin,
  utilities.handleErrors(invController.buildAddClassification)
)

// Add classification
router.post(
  "/add-classification",
  invValidate.isEmptyvalidateClassification(),
  invValidate.checkClassificationData,
  utilities.handleErrors(invController.addClassification)
)



router.get(
  "/add-inventory",
  utilities.checkEmployeeOrAdmin,
  utilities.handleErrors(invController.buildAddInventory)
)

router.post(
  "/add-inventory",
  invValidate.inventoryRules(),
  invValidate.checkInventoryData,
  utilities.handleErrors(invController.addInventory)
)

// Get Inventory Route
router.get(
  "/getInventory/:classification_id",
  utilities.handleErrors(invController.getInventoryJSON)
)


// Route to build edit inventory view
router.get(
  "/edit/:inv_id",
  utilities.handleErrors(invController.editInventoryView)
)


/* ***************************
 *  Route to update inventory data
 * ************************** */
router.post(
  "/update",
   invValidate.inventoryRules(),
  invValidate.checkUpdateData,
  utilities.handleErrors(invController.updateInventory)
)

module.exports = router;
