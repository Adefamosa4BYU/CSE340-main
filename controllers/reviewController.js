const reviewModel = require("../models/review-model");
const invModel = require("../models/inventory-model")
const utilities = require("../utilities")

/* ****************************************
*  Build reviews section for a vehicle (view)
* *************************************** */
async function buildReviews(req, res, next) {
  try {
    const nav = await utilities.getNav();
    const { inv_id } = req.params;

    // Fetch reviews for this vehicle
    const reviews = await reviewModel.getReviewsByInventory(inv_id);

    res.render("inventory/vehicle-detail", {
      title: "Vehicle Details",
      nav,
      errors: null,
      reviews,
      vehicleId: inv_id,
    });
  } catch (error) {
    console.error(error);
    res.status(500).render("errors/error", {
      title: "Server Error",
      nav: await utilities.getNav(),
      message: "Unable to load reviews.",
    });
  }
}

async function addReview(req, res, next) {
  try {
    const { inv_id, rating, review_text } = req.body

    const user_id = res.locals.accountData.account_id

    if (!rating || rating < 1 || rating > 5) {
      req.flash("notice", "Rating must be between 1 and 5.")
      return res.redirect(`/inv/detail/${inv_id}`)
    }

    if (!review_text || review_text.trim() === "") {
      req.flash("notice", "Review text cannot be empty.")
      return res.redirect(`/inv/detail/${inv_id}`)
    }

    await reviewModel.addReview(inv_id, user_id, rating, review_text)

    req.flash("notice", "Review added successfully.")
    res.redirect(`/inv/detail/${inv_id}`)

  } catch (error) {
    next(error)
  }
}

// Show the edit review form
async function showEditReviewForm(req, res, next) {
  try {
    const nav = await utilities.getNav();
    const review_id = parseInt(req.params.review_id, 10);
    const account_id = res.locals.accountData.account_id;

    if (isNaN(review_id)) {
      req.flash("notice", "Invalid review ID.");
      return res.redirect("back");
    }

    const review = await reviewModel.getReviewById(review_id);

    if (!review) {
      req.flash("notice", "Review not found.");
      return res.redirect("back");
    }

    if (review.account_id !== account_id) {
      req.flash("notice", "You are not authorized to edit this review.");
      return res.redirect("back");
    }

    res.render("reviews/edit-review", {
      title: "Edit Review",
      nav,
      review,
      errors: null,
    });
  } catch (error) {
    console.error(error);
    res.status(500).render("errors/error", {
      title: "Server Error",
      nav: await utilities.getNav(),
      message: "Unable to load review edit form."
    });
  }
}

// Process the edit review submission
async function editReview(req, res, next) {
  try {
    const account_id = res.locals.accountData.account_id;
    const review_id = parseInt(req.body.review_id, 10);
    const inv_id = parseInt(req.body.inv_id, 10);
    const { rating, review_text } = req.body;

    const review = await reviewModel.getReviewById(review_id);

    if (!review || review.account_id !== account_id) {
      req.flash("notice", "Unauthorized.");
      // return res.redirect(`/inventory/${inv_id}`);
      return res.redirect(`/`);
    }

    await reviewModel.updateReview(review_id, rating, review_text, account_id);

    req.flash("notice", "Review updated successfully.");
    // res.redirect(`/inventory/${inv_id}`);
    res.redirect(`/`);

  } catch (error) {
    next(error);
  }
}


/* ****************************************
*  Delete a review
* *************************************** */
async function deleteReview(req, res, next) {
  try {
    const account_id = res.locals.accountData.account_id;
    const review_id = parseInt(req.body.review_id, 10);

    const review = await reviewModel.getReviewById(review_id);

    if (!review || review.account_id !== account_id) {
      req.flash("notice", "Unauthorized.");
      return res.redirect("back");
    }

    await reviewModel.deleteReview(review_id, account_id);

    req.flash("notice", "Review deleted.");
    // res.redirect(`/inventory/${review.inv_id}`);
    res.redirect(`/`);

  } catch (error) {
    next(error);
  }
}


module.exports = {
  buildReviews,
  addReview,
  showEditReviewForm,
  editReview,
  deleteReview
};

