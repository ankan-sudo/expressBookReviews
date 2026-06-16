const express = require('express');
const axios = require('axios');
let books = require("./booksdb.js");
let isValid = require("./auth_users.js").isValid;
let users = require("./auth_users.js").users;
const public_users = express.Router();


public_users.post("/register", (req,res) => {
  //Write your code here
  const username = req.body.username;
  const password = req.body.password;

  if(username && password){
    if(!isValid(username)){
      users.push({"username":username,"password":password})
      return res.status(200).json({message:"User registered successfully !! Now you can login."})
    }
    else{
      return res.status(400).json({message:"Unable to register user."})
    }
  }
  return res.json(404).json({message:"Unable to register user."})
});

// Get the book list available in the shop
// Get the book list available in the shop
public_users.get('/', function (req, res) {
  const fetchAllBooks = () => {
    return new Promise((resolve, reject) => {
      if (books && Object.keys(books).length > 0) {
        resolve(books);
      } else {
        reject(new Error("Database Error: Book inventory is currently empty or unavailable."));
      }
    });
  };

  fetchAllBooks()
    .then((bookList) => {
      return res.status(200).json(bookList);
    })
    .catch((error) => {
      return res.status(500).json({
        success: false,
        message: error.message,
        timestamp: new Date().toISOString()
      });
    });
});


// Get book details based on ISBN
public_users.get('/isbn/:isbn', async function (req, res) {
  const targetIsbn = req.params.isbn;

  // Input Validation
  if (!targetIsbn || targetIsbn.trim() === "") {
    return res.status(400).json({ 
      message: "Bad Request: The 'isbn' parameter is missing or empty." 
    });
  }

  try {
    const fetchBookByIsbn = () => {
      return new Promise((resolve, reject) => {
        const book = books[targetIsbn];
        if (book) {
          resolve(book);
        } else {
          reject(new Error(`Resource Not Found: No book matches the provided ISBN code '${targetIsbn}'.`));
        }
      });
    };

    const bookDetails = await fetchBookByIsbn();
    return res.status(200).json(bookDetails);

  } catch (error) {
    return res.status(404).json({
      success: false,
      message: error.message,
      requestedIsbn: targetIsbn,
      timestamp: new Date().toISOString()
    });
  }
});
  
// Get book details based on author
const axios = require('axios');

public_users.get('/author/:author', async function (req, res) {
  const targetAuthor = req.params.author;

  // 1. Input Validation: Check if the user passed an empty or invalid author parameter
  if (!targetAuthor || targetAuthor.trim() === "") {
    return res.status(400).json({ 
      message: "Bad Request: The 'author' parameter is missing or empty." 
    });
  }

  try {
    const fetchBooksByAuthor = () => {
      return new Promise((resolve, reject) => {
        const bookKeys = Object.keys(books);
        
        const filteredBooks = bookKeys
          .map((key) => books[key])
          .filter((book) => book.author.toLowerCase() === targetAuthor.toLowerCase());

        if (filteredBooks.length > 0) {
          resolve(filteredBooks);
        } else {
          // 2. Descriptive Error: Name the exact resource that couldn't be found
          reject(new Error(`No books found in our database matching the author: '${targetAuthor}'`));
        }
      });
    };

    const matchingBooks = await fetchBooksByAuthor();
    return res.status(200).json(matchingBooks);

  } catch (error) {
    // 3. Dynamic Debugging Response: Pass the actual error message dynamically
    return res.status(404).json({ 
      success: false,
      message: error.message,
      timestamp: new Date().toISOString(),
      requestedAuthor: targetAuthor
    });
  }
});

// Get all books based on title
public_users.get('/title/:title', async function (req, res) {
  const targetTitle = req.params.title;

  // Input Validation
  if (!targetTitle || targetTitle.trim() === "") {
    return res.status(400).json({ 
      message: "Bad Request: The 'title' parameter is missing or empty." 
    });
  }

  try {
    const fetchBooksByTitle = () => {
      return new Promise((resolve, reject) => {
        const bookKeys = Object.keys(books);
        
        const filteredBooks = bookKeys
          .map((key) => books[key])
          .filter((book) => book.title.toLowerCase() === targetTitle.toLowerCase());

        if (filteredBooks.length > 0) {
          resolve(filteredBooks);
        } else {
          reject(new Error(`Resource Not Found: No books found matching the title '${targetTitle}'.`));
        }
      });
    };

    const matchingBooks = await fetchBooksByTitle();
    return res.status(200).json(matchingBooks);

  } catch (error) {
    return res.status(404).json({
      success: false,
      message: error.message,
      requestedTitle: targetTitle,
      timestamp: new Date().toISOString()
    });
  }
});

//  Get book review
public_users.get('/review/:isbn', function (req, res) {
  const targetIsbn = req.params.isbn;

  // 1. Input Validation: Checking if the user passed an empty or invalid ISBN parameter
  if (!targetIsbn || targetIsbn.trim() === "") {
    return res.status(400).json({ 
      success: false,
      message: "Bad Request: The 'isbn' parameter is missing or empty in the request path." 
    });
  }

  // 2. Resource Lookup
  if (books[targetIsbn]) {
    const bookReviews = books[targetIsbn].reviews;
    
    // Checking if the book exists but simply doesn't have any reviews yet
    if (Object.keys(bookReviews).length === 0) {
      return res.status(200).json({
        success: true,
        message: `The book with ISBN '${targetIsbn}' ('${books[targetIsbn].title}') was found, but it has no customer reviews yet.`,
        reviews: {}
      });
    }

    // Success case: Book exists and has active reviews
    return res.status(200).json(bookReviews);
  } 
  else {
    // 3. Detailed Error Handling for Debugging and User Experience
    return res.status(404).json({
      success: false,
      message: `Resource Not Found: No book record matches the provided ISBN '${targetIsbn}'. Unable to fetch reviews.`,
      requestedIsbn: targetIsbn,
      timestamp: new Date().toISOString()
    });
  }
});

module.exports.general = public_users;