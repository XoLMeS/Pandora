const jsonfile = require('jsonfile')
const fs = require('fs');

const folder = './XEmoji/png/';
const file = "./XEmoji/data.json";	

let data = {};
let json;

var module = require('module');


$(document).ready(function() {
	
	fs.readdir(folder, (err, files) => {
		
		loadData();
		
		files.forEach(file => {
			if(file.includes(".png")){
				let name = file.replace(".png","");
				if(data[name]===undefined){
					data[name] = name;
					json.emoji.push({"name" : name, "png" : name});
				}
				 else if(data[name]==="default"){
					data[name] = name;
					var length = Object.keys(json.emoji).length;
					for(var i = 0; i < length; i++){
						if(json.emoji[i].name == name){
							json.emoji[i].png = name;
							break;
						}
					}
				 }
			}
		});
		
		save();
		//console.log(emojify('Hello :ben: and :kappa: '));
	})
	
});



function loadData(){
	
	json = jsonfile.readFileSync(file);
	
	var length = Object.keys(json.emoji).length;
	for(var i = 0; i < length; i++){
		data[json.emoji[i].name] = json.emoji[i].png;
	}
	console.log(data);
		
}

function save(){
	console.log(json);
	jsonfile.writeFile(file, json, function(err){
		console.log(err);
	});
}



function emojify(str){
	
	for(var i = 0; i < str.length; i++){
		if(str.charAt(i)==':'){
			for(var k = i+1; k < str.length; k++){
				
				if(str.charAt(k)==32){
					break;
				}
				
				if(str.charAt(k)==':'){
					var replace = str.substring(i+1,k);
					i = k+37;
				
					if(data[replace.toString()]!==undefined){
						str = str.replace(':'+replace+':','<img src="../../XEmoji/png/'+replace+'.png"></img>');
					}
					
					break;
				}
			}
		}
	}
	return str;
}
