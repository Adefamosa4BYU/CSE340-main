const express = require("express");
const router = express.Router();
const reviewController = require("../controllers/reviewController");
const reviewValidate = require("../utilities/review-validation")
const utilities = require("../utilities")

// Show reviews for a vehicle
router.get(
    "/inventory/:inv_id",
    utilities.handleErrors(reviewController.buildReviews)
);

// Add a review
router.post(
    "/add",
    utilities.checkLogin,
    reviewValidate.reviewRules(),
  reviewValidate.checkReviewData,
    utilities.handleErrors(reviewController.addReview)
);

// routes/reviews.js
router.get(
  "/edit/:review_id",
  utilities.checkLogin,          
  utilities.handleErrors(reviewController.showEditReviewForm)
);


// Edit a review
router.post(
    "/edit",
    utilities.checkLogin,
    // reviewValidate.reviewRules(),
//   reviewValidate.checkReviewData,
    utilities.handleErrors(reviewController.editReview)
);

// Delete a review
router.post(
    "/delete",
    utilities.checkLogin,
    utilities.handleErrors(reviewController.deleteReview)
);

module.exports = router;
