const express = require("express")
const  router = new express.Router() 
const accountController = require("../controllers/accountController")
const utilities = require("../utilities")
const regValidate = require('../utilities/account-validation')

router.get("/", utilities.checkLogin, utilities.handleErrors(accountController.loginPages))
router.get("/login", utilities.handleErrors(accountController.buildLogin))

router.get("/register", utilities.handleErrors(accountController.buildRegister))

router.post(
    '/register', 
    regValidate.registationRules(),
    regValidate.checkRegData,
    utilities.handleErrors(accountController.registerAccount))


    // Process the login attempt
router.post(
  "/login",
  regValidate.loginRules(),
  regValidate.checkLoginData,
  utilities.handleErrors(accountController.accountLogin)
)

// Account Update
router.get(
  "/update/:account_id",
  utilities.checkLogin,
  utilities.checkJWTToken,
  utilities.handleErrors(accountController.buildUpdateView)
)

router.post(
  "/update",
  utilities.handleErrors(accountController.updateAccount)
)

router.post(
  "/update-password",
  utilities.handleErrors(accountController.updatePassword)
)

router.get(
  "/logout", 
  utilities.handleErrors(accountController.logout)
)

module.exports = router