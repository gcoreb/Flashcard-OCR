'use strict';
/*global $*/
/*global Tesseract*/
$(function(){


$("#recognizeButton").click(function(){
		alert('pressed');
		var canvas = document.getElementById('canvas2');
            Tesseract.recognize(canvas, {progress: showProgress, lang: 'eng'}).then(function (d) {
                console.log(d.text);
            }, function (err) {
                console.log(err);
            });
});

$("#userInfoButton").click(function(){
	submitUserInfo();
});


document.getElementById('files').addEventListener('change', handleFileSelect, false);

var accessToken;

if(window.location.href.indexOf("code")!=-1){
	createPostReqForSet();
}
var terms = [];
var def = [];

function separateText(text) {
	//this function could be where we do the seperating for temp purposes
	var wordHeap = text.seperate(" ");
	for(var i = 0; i < wordHeap.length; i+=2) {
		terms.push(wordHeap[i]);
	}
	for(var i = 1; i < wordHeap.length; i+=2){
		def.push(wordHeap[i]);
	}

	createPostReqForSet();

}

function createPostReqForSet() {
		continueQuizletAuth();
}

function handleFileSelect(evt) {
	//alert('hell yeah');
    var files = evt.target.files; 

    for (var i = 0, f; f = files[i]; i++) {

      if (!f.type.match('image.*')) {
        continue;
      }

      var reader = new FileReader();

      reader.onload = (function(theFile) {
        return function(e) {
           convertToCanvas(e.target.result);
        };
      })(f);

      reader.readAsDataURL(f);
    }
  }

function showProgress(p) {
	console.log(p);
}
  function convertToCanvas (lastPhoto) {

  		//console.log("link: " + lastPhoto);
        var canvas2 = document.getElementById("canvas2");

        canvas2.width = lastPhoto.width;

        canvas2.height = lastPhoto.height;

        var canvasbanana = canvas2.getContext("2d");

        var img = new Image();
        img.src = lastPhoto;
        img.width = "1000";
        img.height="1000";
        canvas2.width = img.width;
        canvas2.height = img.height;
        console.log(img.width + " " + img.height);
        img.onload = function() {
            canvasbanana.drawImage(img, 0,0);
        }

        return canvasbanana;
    }

	function continueQuizletAuth() {
		var currentURL = window.location.href;
		var code = currentURL.substring(currentURL.indexOf("code=")+5);

  		$.ajax({
            type:"GET",
            url: "http://localhost:3000/quizlet?code="+code,
            success: function(msg) {
$('#userInfoButton').replaceWith('<h1> Logged in as ' + msg.username + '</h1>' + '<p> Showing undefined? Go <a href="/analyze.html">here</a> to try again </p>');
console.log(msg);
            },
            error:function(error){
            	alert('error');
            	console.log(error);
            }
    	});
	}

	function form2Json(str)
	{
	    var obj,i,pt,keys,j,ev;
	    if (typeof form2Json.br !== 'function')
	    {
	        form2Json.br = function(repl)
	        {
	            if (repl.indexOf(']') !== -1)
	            {
	                return repl.replace(/\](.+?)(,|$)/g,function($1,$2,$3)
	                {
	                    return form2Json.br($2+'}'+$3);
	                });
	            }
	            return repl;
	        };
	    }
	    str = '{"'+(str.indexOf('%') !== -1 ? decodeURI(str) : str)+'"}';
	    obj = str.replace(/\=/g,'":"').replace(/&/g,'","').replace(/\[/g,'":{"');
	    obj = JSON.parse(obj.replace(/\](.+?)(,|$)/g,function($1,$2,$3){ return form2Json.br($2+'}'+$3);}));
	    pt = ('&'+str).replace(/(\[|\]|\=)/g,'"$1"').replace(/\]"+/g,']').replace(/&([^\[\=]+?)(\[|\=)/g,'"&["$1]$2');
	    pt = (pt + '"').replace(/^"&/,'').split('&');
	    for (i=0;i<pt.length;i++)
	    {
	        ev = obj;
	        keys = pt[i].match(/(?!:(\["))([^"]+?)(?=("\]))/g);
	        for (j=0;j<keys.length;j++)
	        {
	            if (!ev.hasOwnProperty(keys[j]))
	            {
	                if (keys.length > (j + 1))
	                {
	                    ev[keys[j]] = {};
	                }
	                else
	                {
	                    ev[keys[j]] = pt[i].split('=')[1].replace(/"/g,'');
	                    break;
	                }
	            }
	            ev = ev[keys[j]];
	        }
	    }
	    return obj;
	}

	function submitUserInfo() {
		
			quizletAuth("wrong", "wrong");
		
	}


	function quizletAuth(username, pass) {
		var str = makeid();
		var redirectURI = "https://quizlet.com/authorize?response_type=code&client_id=6DNHhMVpeH&scope=write_set&state="+str;		
		var currentURL = window.location.href;
		console.log(currentURL.indexOf("code"));
		window.open(redirectURI,'auth time');
	}


	function waitForUrlToChangeTo(urlRegex) {
		    var currentUrl;

		    return browser.getCurrentUrl().then(function storeCurrentUrl(url) {
		            currentUrl = url;
		        }
		    ).then(function waitForUrlToChangeTo() {
		            return browser.wait(function waitForUrlToChangeTo() {
		                return browser.getCurrentUrl().then(function compareCurrentUrl(url) {
		                    return urlRegex.test(url);
		                });
		            });
		        }
		    );
		}

	function makeid()
		{
		    var text = "";
		    var possible = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";

		    for(var i=0; i < 5; i++)
		        text += possible.charAt(Math.floor(Math.random()*possible.length));

		    return text;
		}

    function analyze(url, handleData) {
     var params = {
            // Request parameters
            "language": "en",
            "detectOrientation ": "true",
        };
      
        $.ajax({
            url: "https://api.projectoxford.ai/vision/v1/ocr?" + $.param(params),
            beforeSend: function(xhrObj){
                // Request headers
                xhrObj.setRequestHeader("Content-Type","application/json");
                xhrObj.setRequestHeader("Ocp-Apim-Subscription-Key","900313fb426048dc9369d4661f07ee66");
            },
            type: "POST",
            // Request body
            data: '{"Url":"'+url+'"}'
        })
        .done(function(data) {
          var lineText = "";
          var ter = [];
          var de = [];
            if (data.regions != null) {
            	console.log(data.regions.length);
                for (var i = 0; i < data.regions.length; i++) {
                	
                    label1: for (var j = 0; j < data.regions[i].lines.length; j++) {
                         for (var k = 0; k < data.regions[i].lines[j].words.length; k++) {
                        	if((data.regions[i].lines[j].words[k].text.substring(0,7)== "EPISODE")){
								continue label1;
                        	}
                            lineText += data.regions[i].lines[j].words[k].text + " ";   
                        }
                        if(i==1){
                        ter.push(lineText);
                        }
                        else if(i==2){
                        	de.push(lineText);
                        	console.log(lineText);
                        }
                        lineText = "";
                    }
                }
                console.log(ter);
                console.log(de);
              handleData(ter,de); 
            }
            else {
                console.log('empty');
        }
        })
        .fail(function(err) {
            console.log(JSON.stringify(err));
        });
    }
    $('#submit').click(function(){
     analyze($('#url').val(), function(term,def){
       	 var termHTML = [];
         var defHTML = [];
         $.each(term, function(i,e){
             termHTML.push('<li>'+e+'</li>');
         })
         $('#displayResults').html('<li><h1> Terms </h1></li>' + termHTML.join(""));
            $.each(def, function(i,e){
             defHTML.push('<li>'+e+'</li>');
         })
         $('#displayResults').append('<li><h1> Def </h1></li>' + defHTML.join(""));
       });
    })
    function postasetTest(title){
    	analyze($('#url').val(), function(term,def){
  var data = {
      'title': title, 
      'terms': term, 
      'def': def
  };
            console.log('data');
            console.log(JSON.stringify(data));
        	$.ajax({
            type:"POST",
            url: "http://localhost:3000/newSet",
            data: JSON.stringify(data),
         contentType: 'application/json',
            success: function(msg) {
		console.log(msg);
		var x = window.confirm("Would you like to go to your set?");
		if(x){
			window.open("http://quizlet.com" + msg.url);
		}
		else{
			alert(msg);
		}
            },
            error:function(error){
            	alert('error');
            	console.log(error);
            }
    	});
      
    
    }
    )}
    $('#poster').click(function(){
    	postasetTest($('#title').val());
    })
    
});