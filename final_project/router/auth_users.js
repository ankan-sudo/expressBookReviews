const express = require('express');
const jwt = require('jsonwebtoken');
let books = require("./booksdb.js");
const regd_users = express.Router();

let users = [];

const isValid = (username)=>{ //returns boolean
//write code to check is the username is valid
let userswithsamename = users.filter((user) => {
  return user.username === username
})

if(userswithsamename.length>0){
  return true;
}
else{
  return false;
}
}

const authenticatedUser = (username,password)=>{ //returns boolean
//write code to check if username and password match the one we have in records.
  let validUsers = users.filter((user) => {
    return (user.username === username && user.password === password)
  })

  if(validUsers.length > 0){
    return true;
  }
  else{
    return false;
  }
}

//only registered users can login
regd_users.post("/login", (req,res) => {
  //Write your code here
  const username = req.body.username;
  const password = req.body.password;

  if(!username || !password){
    return res.status(404).json({message:"Error logging in"})
  }
  
  if(authenticatedUser(username,password)){
    let accessToken = jwt.sign({
      data: username
    },'access', {expiresIn: 60 * 60 })
  

  req.session.authorization={
    accessToken,username
  }

  return res.status(200).json({message:"User logged in successfully !!"})
}
else{
  return res.status(208).json({message: "Invalid Login . Check username and password."})
}


});

// Add a book review
regd_users.put("/auth/review/:isbn", (req, res) => {
  //Write your code here
  const isbn = req.params.isbn;

  const reviewText = req.query.review;

  const username = req.session?.authorization?.username;

  if(!username){
    return res.status(403).json({message:"User not logged in or authorized "})
  }

  if(!reviewText){
    return res.status(400).json({message:"Review text cannot be empty."})
  }

  if(books[isbn]){
    let bookReviews = books[isbn].reviews;
    bookReviews[username] = reviewText;

    return res.status(200).json({
      message:`Review for ISBN ${isbn} successfuly added/updated by user '${username}'.`,
      reviews: bookReviews
    })
  }
  else{
    return res.status(403).json({message: "Book not found with this ISBN"})
  }
});

regd_users.delete("/auth/review/:isbn", (req, res) => {
  let isbn = req.params.isbn;
  const username = req.session?.authorization?.username;

  if(!username){
    return res.status(401).json({message:"User not logged in or authorized"})
  }

  if(books[isbn]){
    let bookReviews = books[isbn].reviews;
    if(bookReviews[username]){
      delete bookReviews[username];

      return res.status(200).json
      ({
        message: `Review for ISBN ${isbn} posted by user ${username} has been successfully deleted`,
        reviews: bookReviews
      })
    }
    else{
    return res.status(404).json({message:`You ('${username}') do not have a review posted under ISBN {isbn} to delete `})
  }
  }
  else{
    return res.status(404).json({message:"Book not found with this ISBN"})
  }  
})

module.exports.authenticated = regd_users;
module.exports.isValid = isValid;
module.exports.users = users;