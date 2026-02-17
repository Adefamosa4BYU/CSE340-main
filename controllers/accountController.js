const bcrypt = require("bcryptjs")
const accountModel = require("../models/account-model")
const utilities = require("../utilities")
const jwt = require("jsonwebtoken")
require("dotenv").config()

/* ****************************************
 *  Deliver login view
 * *************************************** */
async function buildLogin(req, res, next) {
  let nav = await utilities.getNav()
  res.render("account/login", {
    title: "Login",
    nav,
    errors: null
  })
}


/* ****************************************
*  Deliver registration view
* *************************************** */
async function buildRegister(req, res, next) {
  let nav = await utilities.getNav()
  res.render("account/register", {
    title: "Register",
    nav,
    errors: null
  })
}


async function loginPages(req, res, next) {
  const nav = await utilities.getNav()
  res.render("account/index", {
    title: "Home Page",
    nav,
    errors: null,
  })
}


/* ****************************************
*  Process Registration
* *************************************** */
async function registerAccount(req, res) {
  let nav = await utilities.getNav()
  const { account_firstname, account_lastname, account_email, account_password } = req.body

  // Hash the password before storing
  let hashedPassword
  try {
    // regular password and cost (salt is generated automatically)
    hashedPassword = await bcrypt.hashSync(account_password, 10)
  } catch (error) {
    req.flash("notice", 'Sorry, there was an error processing the registration.')
    res.status(500).render("account/register", {
      title: "Registration",
      nav,
      errors: null,
    })
  }

  const regResult = await accountModel.registerAccount(
    account_firstname,
    account_lastname,
    account_email,
    hashedPassword
    // account_password
  )

  if (regResult) {
    req.flash(
      "notice",
      `Congratulations, you\'re registered ${account_firstname}. Please log in.`
    )
    res.status(201).render("account/login", {
      title: "Login",
      nav,
      errors: null
    })
  } else {
    req.flash("notice", "Sorry, the registration failed.")
    res.status(501).render("account/register", {
      title: "Registration",
      nav,
      errors: null
    })
  }
}


/* ****************************************
 *  Process login request
 * ************************************ */
async function accountLogin(req, res) {
  let nav = await utilities.getNav()
  const { account_email, account_password } = req.body
  
  const accountData = await accountModel.getAccountByEmail(account_email)
  if (!accountData) {
    req.flash("notice", "Please check your credentials and try again.")
    res.status(400).render("account/login", {
      title: "Login",
      nav,
      errors: null,
      account_email,
    })
    return
  }
  try {
    if (await bcrypt.compare(account_password, accountData.account_password)) {
      delete accountData.account_password
      const accessToken = jwt.sign(accountData, process.env.ACCESS_TOKEN_SECRET, { expiresIn: 3600 * 1000 })
      if(process.env.NODE_ENV === 'development') {
        res.cookie("jwt", accessToken, { httpOnly: true, maxAge: 3600 * 1000 })
      } else {
        res.cookie("jwt", accessToken, { httpOnly: true, secure: true, maxAge: 3600 * 1000 })
      }
    //    res.status(400).render("account/", {
    //     title: "Welcome Page",
    //   nav,
    //   errors: null,
    // })
    return res.redirect("/account")
      
    }
    else {
      req.flash("message notice", "Please check your credentials and try again.")
      res.status(400).render("account/login", {
        title: "Login",
        nav,
        errors: null,
        account_email,
      })
    }
  } catch (error) {
    throw new Error('Access Forbidden')
  }
}

async function buildUpdateView(req, res) {
  let nav = await utilities.getNav()
  const account_id = req.params.account_id
  const accountData = await accountModel.getAccountById(account_id)

  res.render("account/update", {
    title: "Update Account",
    ...accountData,
    nav,
    errors: null,
  })
}

async function updateAccount(req, res) {
  let nav = await utilities.getNav()
  const { account_id, account_firstname, account_lastname, account_email } = req.body

  const updateResult = await accountModel.updateAccount(
    account_firstname,
    account_lastname,
    account_email,
    account_id
  )

  if (updateResult || updateResult.rowCount > 0) {
    req.flash("notice", "Account updated successfully.")

     const accountData = await accountModel.getAccountById(account_id);

     res.status(400).render("account/index", {
      title: "Account Management",
      nav,
      accountData,
      errors: null,
    })
    return
  } else {
    req.flash("notice", "Update failed.")
    return res.redirect(`/account/update/${account_id}`)
  }
}


async function updatePassword(req, res) {
  let nav = await utilities.getNav()
  const { account_id, account_password } = req.body

  // Server-side password validation
  if (!account_password || account_password.length < 8) {
    req.flash("notice", "Password must be at least 8 characters long");
    const accountData = await accountModel.getAccountById(account_id);
    return res.render("account/update", {
      title: "Update Account",
      nav,
      accountData,
      errors: null
    });
  }

  // Add optional: password complexity check
  const pwRegex = /^(?=.*[A-Z])(?=.*[a-z])(?=.*\d).{8,}$/;
  if (account_password && !pwRegex.test(account_password)) {
    req.flash("notice", "Password must include uppercase, lowercase, and a number");
    const accountData = await accountModel.getAccountById(account_id);
    return res.render("account/update", {
      title: "Update Account",
      nav,
      accountData,
      errors: null
    });
  }

  const hashedPassword = await bcrypt.hash(account_password, 10)

  const updateResult = await accountModel.updatePassword(
    hashedPassword,
    account_id
  )

  if (updateResult || updateResult.rowCount > 0) {
    req.flash("notice", "Password updated successfully.");
    const accountData = await accountModel.getAccountById(account_id);
    return res.render("account/index", {
      title: "Account Management",
      nav,
      accountData,
      errors: null
    });
  } else {
    req.flash("notice", "Password update failed. Try again.");
    const accountData = await accountModel.getAccountById(account_id);
    return res.render("account/update", {
      title: "Update Account",
      nav,
      accountData,
      errors: null
    });
  }
}


async function logout(req, res) {
  res.clearCookie("jwt")
  req.flash("notice", "You have been logged out.")
  return res.redirect("/")
}


module.exports = { buildLogin, buildRegister, registerAccount, accountLogin, loginPages, buildUpdateView, updateAccount, updatePassword, logout }
