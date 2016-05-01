var express    = require('express');        
var bodyParser = require('body-parser');
var request = require('request');
var app  = express();                 
var acstkn;

app.all('*', function(req, res, next) {
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
    next();
});

app.use(bodyParser.json());

app.get('/quizlet', function(req, res){	
	var realCode = req.query.code;
	request({
	    url: 'https://api.quizlet.com/oauth/token?grant_type=authorization_code&code='+realCode+'&redirect_uri=http://localhost:3000/analyze.html', 
	    method: 'POST', 
	    headers: { 
	        'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8',
	        'Authorization': 'Basic NkROSGhNVnBlSDptNnNFZ05nUEY5UTdleEJWSGFlVGNL'
	    }
	}, function(error, response, body){
	    if(error) {
	        console.log(error);
	        res.status(500).end("500");
	    } else {
	        console.log(response.statusCode, body);
	         var msg = {};
            msg.access = JSON.parse(body).access_token;
            acstkn = msg.access;
            msg.username = JSON.parse(body).user_id;
	        res.send(msg);
	    }
	});
});

app.post('/newSet', function(req, res){
	var title = req.body.title;
	console.log('the body is ' + JSON.stringify(req.body));
	console.log('terms = ' + req.body.terms);
	console.log('definitions = ' + req.body.def);
	var terms = req.body.terms;
	var definitions = req.body.def;
	var termString = '';
	var defString = '';
	for(var i = 0;i < terms.length; i++){
		termString+='&terms[]='+terms[i];
		defString += '&definitions[]='+definitions[i]; 
	}
	var defs;
	var langterms = "en";
	var langdefs = "en";
	console.log('the title of the set is : ' + title);
	console.log('these are the terms I got: ' + termString);
	console.log('these are the defs  I got: ' + defString);
    request({
        url: 'https://api.quizlet.com/2.0/sets?title='+title+termString+defString+'&lang_terms='+langterms+'&lang_definitions='+langdefs, 
	    method: 'POST', 
	    headers: { 
	        'Content-Type': 'application/JSON; charset=UTF-8',
            'Authorization': 'Bearer ' + acstkn
	    }
	
    },function(err, resp, body){
        if(err){
            console.log(err)
        }
        else{
            res.send(JSON.parse(body));
        }
    })
})
app.use(express.static('public'));
app.listen(3000);
