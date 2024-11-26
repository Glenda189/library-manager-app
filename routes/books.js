const express = require("express");
const router = express.Router();
const { Book } = require("../models");
const { Sequelize } = require("sequelize"); // Ensure Sequelize is imported

//Display all books and search and pagination 
router.get("/", async (req, res, next) => {
  const search = req.query.search || ""; // Capture search query, default to empty string
  const page = parseInt(req.query.page) || 1; //set default to 1 
  const limit = 5;
  const offset = (page - 1) * limit;
  try {
  // Fetch books with search and pagination 
    const {rows: books, count} = await Book.findAndCountAll({
      where: {
        [Sequelize.Op.or]: [
          { title: { [Sequelize.Op.like]: `%${search}%` } },
          { author: { [Sequelize.Op.like]: `%${search}%` } },
          { genre: { [Sequelize.Op.like]: `%${search}%` } },
          { year: { [Sequelize.Op.like]: `%${search}%` } },
        ],
      },
      limit, 
      offset,
    });
    const totalPages = Math.ceil(count / limit);
    // console.log("Books fetched:", books);
    res.render("index", { books, searchQuery: search, currentPage: page, totalPages,
     }); // Pass books and the search query
  } catch (error) {
    // console.error("Error fetching books with pagination:", error);
    next(error);
  }
});

//Display form to add a new book
router.get("/new", (req, res) => {
  console.log("GET /books/new route called");
  res.render("new-book", { book: {} });
});

// Add a new book
router.post("/new", async (req, res, next) => {
  try {
    await Book.create(req.body); // Attempt to create the book
    res.redirect("/books");
  } catch (error) {
    if (error.name === "SequelizeValidationError") {
      console.log("Validation Errors Array Sent to View:", error.errors.map((e) => e.message));
      res.render("new-book", {
        book: req.body, 
        errors: error.errors, 
      });
    } else {
      console.error("Unexpected Error:", error);
      next(error); // Pass unexpected errors to global error handler
    }
  }
});

// Display form to update a book
router.get("/:id", async (req, res, next) => {
  try {
    const book = await Book.findByPk(req.params.id);
    if (book) {
      res.render("update-book", { book });
    } else {
      const error = new Error("Book not found");
      error.status = 404;
      next(error);
    }
  } catch (error) {
    next(error);
  }
});

// Update a book
router.post("/:id", async (req, res, next) => {
  try {
    const book = await Book.findByPk(req.params.id);
    if (book) {
      await book.update(req.body);
      res.redirect("/");
    } else {
      const error = new Error("Book not found");
      error.status = 404;
      next(error);
    }
  } catch (error) {
    if (error.name === "SequelizeValidationError") {
      res.render("update-book", { book: req.body, errors: error.errors });
    } else {
      next(error);
    }
  }
});

//Delete a book
router.post("/:id/delete", async (req, res) => {
  try {
    const book = await Book.findByPk(req.params.id);
    if (book) {
      await book.destroy();
      res.redirect("/books");
    } else {
      const error = new Error("Book not found");
      error.status = 404;
      next(error);
    }
  } catch (error) {
    next(error);
  }
});

module.exports = router;
