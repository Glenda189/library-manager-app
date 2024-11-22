const express = require("express");
const router = express.Router();
const { Book } = require("../models");

//rredirect to /books
router.get("/", (req, res) => res.redirect("/books"));

//Display all books
router.get("/books", async (req, res) => {
  try {
    const books = await Book.findAll();
    console.log("Books fetched:", books);
    res.render("index", { books });
  } catch (error) {
    console.error("Error fetching books:", error);
    res.status(500).send("Error fetching books.");
  }
});

//Display form to add a new book
router.get("/books/new", (req, res) => {
  console.log("GET /books/new route called");
  res.render("new-book", { book: {}, errors: null });
});

router.post("/books/new", async (req, res) => {
  try {
    console.log("Form Data:", req.body); // Log form data for debugging

    // Try creating the book
    await Book.create(req.body);
    res.redirect("/books");
  } catch (error) {
    if (error.name === "SequelizeValidationError") {
      console.log("Validation Errors:", error.errors); // Log validation errors

      // Send errors and form data back to the view
      res.render("new-book", {
        book: req.body, // Pass form data back to the view
        errors: error.errors.map((e) => e.message), // Pass error messages
      });
    } else {
      console.error("Unexpected Error:", error);
      throw error;
    }
  }
});

// Display form to update a book
router.get("/books/:id", async (req, res, next) => {
  try {
    const book = await Book.findByPk(req.params.id);
    if (book) {
      res.render("update-book", { book, errors: null });
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
router.post("/books/:id", async (req, res, next) => {
  try {
    const book = await Book.findByPk(req.params.id);
    if (book) {
      await book.update(req.body);
      res.redirect("/books");
    } else {
      const error = new Error("Book not found");
      error.status = 404;
      next(error);
    }
  } catch (error) {
    if (error.name === "SequelizeValidationError") {
      res.render("update-book", {
        book: { ...req.body, id: req.params.id },
        errors: error.errors.map((e) => e.message),
      });
    } else {
      next(error);
    }
  }
});

//Delete a book
router.post("/books/:id/delete", async (req, res) => {
  const book = await Book.findByPk(req.params.id);
  if (book) {
    await book.destroy();
    res.redirect("/books");
  } else {
    res.status(404).render("page-not-found");
  }
});

// Update GET /books to search
router.get("/books", async (req, res) => {
  const search = req.query.search || "";
  try {
    const books = await Book.findAll({
      where: {
        [Sequelize.Op.or]: [
          { title: { [Sequelize.Op.like]: `%${search}%` } },
          { author: { [Sequelize.Op.like]: `%${search}%` } },
          { genre: { [Sequelize.Op.like]: `%${search}%` } },
          { year: { [Sequelize.Op.like]: `%${search}%` } },
        ],
      },
    });
    console.log("Books fetched:", books);
    res.render("index", { books, search });
  } catch (error) {
    console.error("Error fetching books:", error);
    res.status(500).send("Error fetching books.");
  }
});

module.exports = router;
