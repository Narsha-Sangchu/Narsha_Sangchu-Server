// var db_config = require('database');
var db_config = require(__dirname + '/database.js');
var express = require('express');
var app = express();
var bodyParser = require('body-parser');
var multer = require('multer')
var path = require('path');
var crypto = require('crypto');
var fs = require('fs');
var WebSocketServer = require('ws').Server

var conn = db_config.init();

db_config.connect(conn);

app.set('views', __dirname + '/views');
app.set('view engine', 'ejs');

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended : false}));

app.get('/', function (req, res) {
    res.send('ROOT');
});


app.get('/list', function (req, res) {
    // console.log('res params : '+ req.params.id);//req.param("id"));
    // console.log('res : '+ req.query.id);
    var sql = 'SELECT * FROM USER';    
    conn.query(sql, function (err, rows, fields) {
        if(err) console.log('query is not excuted. select fail...\n' + err);
        // else res.render('list.ejs', {list : rows});
        else{
            res.send( {list : rows});
        }
    });
});

app.get('/login', function (req, res) {
   
    var sql = 'SELECT * FROM USER where id=\''+ req.query.id +'\' and password=\''+ req.query.password+'\'' ;      
    console.log(sql)
    conn.query(sql, function (err, rows, fields) {
        if(err) console.log('query is not excuted. select fail...\n' + err);
        // else res.render('list.ejs', {list : rows});
        else{
            console.log("length : "+ rows.length);
            res.send( ""+rows.length);
        }
    });
});





app.get('/join', function (req, res) {
    var sql = 'INSERT INTO USER(ID, PASSWORD) VALUE(\''+ req.query.id +'\',\''+ req.query.password+'\')' ;    
    console.log("sql : "+sql);
    conn.query(sql, function (err, rows, fields) {
        if(err) {
            res.send( 'failed');
        }
        else{
            res.send( 'ok');
        }
    });
});

app.get("/write", (req, res) => {
  let sql =
    "INSERT INTO gallery_board(title, writer, text, picture) VALUE('" +
    "notitle', '" +
    req.query.writer +
    "', '" +
    req.query.text +
	"', '" +
    req.query.picture +
    "')";
    console.log("sql : "+sql);
    conn.query(sql, (error, rows) => {
        if (error) res.send("fail");
        else res.send("success");
    });

    // let sql =
    // "INSERT INTO gallery_board(title, writer, text) VALUE('" +
    // req.query.title +
    // "', '" +
    // req.query.writer +
    // "', '" +
    // req.query.text +
    // "')";
    // console.log("sql : "+sql);
    // conn.query(sql, (error, rows) => {
    //     if (error) res.send("fail");
    //     else res.send("success");
    // });
});

app.get("/read", (req, res) => {
    let sql = "SELECT * FROM gallery_board order by dt desc ";
    console.log("sql : "+sql);
    conn.query(sql, (error, result) => {
      if (error) res.send("error");
      console.log(result);
      res.send(result);
    });
  });


app.listen(3000, function(){ 
    console.log('Server is running...');
});



var _storage = multer.diskStorage({

	/*
	destination: function (req, file, callback) {

		//case: file type is image
		if(file.mimetype == "image/jpg" || file.mimetype == "image/jpeg" || file.mimetype == "image/png") {
			console.log("image");
			callback(null, "uploads/");
		} else {
			console.log("not image");
		}
	},
	filename: function (req, file, callback) {
		callback(null, register_number + "_" + file.originalname);
	}
	*/

	destination: 'uploads/',
	filename: function(req, file, cb) {
		return crypto.pseudoRandomBytes(16, function(err, raw) {
			if(err) {
				return cb(err);
			}
			//return cb(null, ""+(raw.toString('hex')) + (path.extname(file.originalname)));
			return cb(null, file.originalname);
		});
	}
});

//업로드
app.post('/upload', 
	multer({
		storage: _storage
	}).single('upload'), function (req, res) {

	try {

		let file = req.file;
		//const files = req.files;
		let originalName = '';
		let fileName = '';
		let mimeType = '';
		let size = 0;

		if(file) {
			originalName = file.originalname;
			filename = file.fileName;//file.fileName
			mimeType = file.mimetype;
			size = file.size;
			console.log("execute"+fileName);
		} else{ 
			console.log("request is null");
		}

	} catch (err) {

		console.dir(err.stack);
	}

	console.log(req.file);
	console.log(req.body);
	res.redirect("/uploads/" + req.file.originalname);//fileName

	return res.status(200).end();

});

app.get('/uploads/:upload', function(req, res) {


	var file = req.params.upload;
	console.log(file);
	var img = fs.readFileSync(__dirname + "/uploads/" + file);

	res.writeHead(200, {'Content-Type': 'image/png'});
	res.end(img, 'binary');
});

 /* 다운로드 요청 처리 */
var register_number_for_img;
var img_cnt;

app.post("/getimgmain", function(req, res){

	console.log("이미지요청");
	console.log(req.body);
	//var register_number = req.body.register_number;
	var register_number = req.body.register_number;
	var i=req.body.img_cnt;
		var filename = register_number+"_"+i+".png";
		var filePath = __dirname + "/uploads/" + filename;

		fs.readFile(filePath,
			function (err, data)
            {	
				if(err){
					console.log(err);
					filename = "defaltImg.png";
					filePath = __dirname + "/uploads/" + filename;
					fs.readFile(filePath,
						function (err, data)
						{
							console.log(filePath);
							console.log(data);
							res.end(data);
						});

				}else{
				console.log(filePath);
				console.log(data);
				res.end(data);
				}				

            }
		);
	
		
  });

//   app.post("/getimg", function(req, res){

// 	console.log("이미지요청");
// 	console.log(req.body);
// 	var register_number = req.body.register_number;
// 	var i=req.body.img_cnt;
// 		var filename = register_number+"_"+i+".png";
// 		var filePath = __dirname + "/uploads/" + filename;

// 		fs.readFile(filePath,
// 			function (err, data)
//             {	
// 				if(err){
// 					console.log(err);
// 					res.end(null);

// 				}else{
// 				console.log(filePath);
// 				console.log(data);
// 				res.end(data);
// 				}				

//             }
// 		);
	
		
//   });

  app.get('/getimg', function(req, res) {

	console.log('img : '+ req.query.img);
	var file = req.query.img;
	console.log(file);
	var img = fs.readFileSync(__dirname + "/uploads/" + file);

	res.writeHead(200, {'Content-Type': 'image/png'});
	res.end(img, 'binary');
});
