require('dotenv').config()
//load libraries
const bodyParser = require('body-parser'),
      express = require('express');
      multer = require('multer'),
      mysql = require('mysql'),
      paginate = require('express-paginate'),
      path = require('path'),
      request = require('request'), 
      sortBy = require('sort-by');
    
//create an instance of express 
const app = express();

const sqlFindAllBooks = "SELECT cover_thumbnail, title, author_lastname, author_firstname FROM books LIMIT ? OFFSET ?" ;
const sqlSearchByCriteria =  "SELECT cover_thumbnail, title, author_lastname, author_firstname FROM books WHERE (title LIKE ?) || (author_lastname LIKE ?) || (author_firstname LIKE ?) LIMIT ? OFFSET ?";
const sqlFindOneBookById = "SELECT * FROM books WHERE id = ?";

var pool = mysql.createPool({
    host: process.env.DB_HOST,
    port: process.env.DB_PORT,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    connectionLimit: process.env.DB_CONLIMIT,
    debug: true
})

var makeQuery = (sql, pool) => {
    return (args) => {
        var querySqlPromise = new Promise((resolve, reject) => {
            pool.getConnection((err, connection)=>{
                if(err){
                    reject(err);
                    return;
                }
                connection.query(sql, args || [], (err, results) => {
                    connection.release();
                    if(err){
                        reject(err);
                        return;
                    }
                    resolve(results);
                })
            });
        });
        return querySqlPromise;
    }
}

var findAllBooks = makeQuery(sqlFindAllBooks, pool);
var searchByCriteria = makeQuery(sqlSearchByCriteria, pool);
var findOneBookById = makeQuery(sqlFindOneBookById, pool);

//Define Routes
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
app.use(paginate.middleware(10, 50));

app.get('/books', async (req, res, next) => {
  router.get('/all_books', (req, res, next) => {
    db.books.findAndCountALL({limit: req.query.limit, offset: req.skip})
    /then(results => {
        const itemCount = results.count;
        const pageCount = Math.cell(results.count / req.query.limit);
        res.render('books/all_books', {
            books: results.rows,
            pageCount,
            itemCount,
            pages: paginate.getArrayPages(req)(3, pageCount, req.query.page)
        });
    }).catch(err => next(err))
  })
});

//Search all Books allowing user to set limit & offset
app.get("/api/books", (req, res) => {
    let limit = parseInt(req.query.limit) || 10;
    let offset = parseInt(req.query.offset) || 0;
    console.log(">>>>> req.query.limit:", req.query.limit);
    console.log(">>>>> req.query.offset:", req.query.offset);

    
    findAllBooks([limit, offset])
    .then((results) => {
        res.json(results);
        console.log(results);
    })
    .catch((err) => {
        console.log(err);
        res.status(500).end();
    });

})

//Search book by criteria allowing user to set limit & offset
app.get("/api/books/search", (req, res) => {
   
    let searchType = req.query.searchType;
    let keyword = req.query.keyword;
    console.log(">>>>> req.query.keyword:", req.query.keyword);
    console.log(">>>>> req.query.searchType", req.query.searchType);   
    
        
    if(typeof searchType === 'string') {   
     
    let searchCriteriaFromType = ['%', '%', 10, 0];
    if(searchType == 'Title') {
        console.log('searching by title');
        searchCriteriaFromType = [ '%' + keyword + '%', '', '', parseInt(req.query.limit), parseInt(req.query.offset)]
        
    }

    if(searchType == 'Author') {
        console.log('searching by author name');
        var authorName = keyword.split(' ');
        if(!authorName[1]) authorName[1] = authorName[0];
        
        searchCriteriaFromType = ['','%' + keyword + '%', '',parseInt(req.query.limit), parseInt(req.query.offset)]
        
    }

    if(searchType == 'Both') {
        console.log('searching by title and author name');
        searchCriteriaFromType = ['%' + keyword + '%', '%' + keyword + '%', '', parseInt(req.query.limit), parseInt(req.query.offset)]
        
    }

    searchByCriteria(searchCriteriaFromType)
        .then((results) => {
        console.log(results);
        res.json(results);
    }).catch((error) => {
        console.log(err);
        res.status(500).json(error);
    });
    }
})
    
    

//Search single book by book id
app.get("/api/books/:bookId", (req, res) => {
    console.log('searching by book id');
    let bookId = req.params.bookId;
    console.log(bookId);
    findOneBookById([parseInt(bookId)])
    .then((results) => {
        console.log(results);
        res.json(results);
    }).catch((error) => {
        console.log(err);
        res.status(500).json(error);
    });       
})

//sort results by descending order
results = [];
results.sort(sortBy('-title', '-author_firstname', '-author_lastname'));

//Load static content
app.use(express.static(__dirname + "/images"));

//Start express application
const PORT = process.env.PORT;
app.listen(PORT, () => {
    console.log(`Listening to server at ${PORT}`)
})
