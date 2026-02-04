const utilities = require("../utilities/")
const baseController = {}

baseController.buildHome = async function(req, res){
  let nav =[]
  try {
    nav = await utilities.getNav()
    res.render("index", {title: "Home", nav})

  } catch (err) {
    console.error("Nav load failed:", err.message);
  }
}

module.exports = baseController
