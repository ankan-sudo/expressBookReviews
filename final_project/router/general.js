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
public_users.get('/',async function (req, res) {
  //Write your code here
  try {
    const getBooks = () => {
      return new Promise((resolve) => {
        resolve(books)
      })
    }

    const availableBooks = await getBooks();

    return res.status(200).send(JSON.stringify(availableBooks, null, 4));
  } catch (error) {
    return res.status(500).json({message:"Error retrieving book list", error: error.message})
  }
});

// Get book details based on ISBN
public_users.get('/isbn/:isbn',async function (req, res) {
  //Write your code here
  const isbn = req.params.isbn;
  
  try {
    const getBooksbyISBN = () => {
    return new Promise((resolve,reject) => {
      if(books[isbn]){
        resolve(books[isbn])
    }
    else{
        reject(new Error("Book not found with this ISBN"))
      }
    })
  }

  const bookDetails = await getBooksbyISBN();
  return res.status(200).json(bookDetails) 
  } catch (error) {
    return res.status(404).json({message: error.message})
  }
  
 });
  
// Get book details based on author
public_users.get('/author/:author',async function (req, res) {
  //Write your code here
  const targetAuthor = req.params.author;

  try {
    const getBooksByAuthor = () => {
      return new Promise((resolve,reject) => {
          const bookKeys = Object.keys(books);

          const filteredBooks = bookKeys.map((key) => books[key]).filter((book) => {
            return book.author.toLowerCase() === targetAuthor.toLowerCase()
          })

          if(filteredBooks.length > 0)
          {
            resolve(filteredBooks)
          }
          else
          {
            reject(new Error("No book found by this author"))
          }
      })
    }

    const getBookDetails = await getBooksByAuthor();
    return res.status(200).json(getBookDetails);
  } 
  catch (error) {
    return res.status(404).json({message: error.message})
  }


});

// Get all books based on title
public_users.get('/title/:title', async function (req, res) {
  //Write your code here
  const targetTitle = req.params.title;

  try {
   const getBooksByTitle = () => {
    return new Promise((resolve, reject) => {
      const bookKeys = Object.keys(books)

      const filteredBooks = bookKeys.map((key) => books[key]).filter((book) => {
        return book.title.toLowerCase() === targetTitle.toLowerCase()
  })

      if(filteredBooks.length>0){
        resolve(filteredBooks)
      }
      else{
        reject(new Error("No book found by this title"))
      }
    })
  }
  
  const getBookDetails = await getBooksByTitle();
  return res.status(200).json(getBookDetails)
  } catch (error) {
    return res.status(404).json({message: error.message})
  }
  

});

//  Get book review
public_users.get('/review/:isbn',function (req, res) {
  //Write your code here
  let isbn = req.params.isbn;

  if(books[isbn]){
    return res.status(200).json(books[isbn].reviews)
  }
  else{
    return res.status(404).json({message:"No book review found by this isbn"})
  }
});

module.exports.general = public_users;