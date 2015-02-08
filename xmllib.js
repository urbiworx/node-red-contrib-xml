/**
 * Copyright 2014 Urbiworx.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 **/
exports.XML = function(){
	function addNamespace(aElement,aPrefix,aNamespace){
		if (typeof(aElement.$namespaces)=="undefined"){
			aElement.$namespaces={};
		}
		aElement.$namespaces[aPrefix]=aNamespace;
	}
	this.addNamespace=addNamespace;
	this.parseXML=function(aXML){
		//console.log(aXML);
		var ret={};
		var current=ret;
		var hierachy=new Array();
		aXML.replace(/<(\/?[^ >\/]*)(.*?)>([^<]*)/g, function (match, tag, attribs, text) {
			if (tag.indexOf("?")==0){
				return "";
			}
			tag=tag.replace(":","$");
			if (tag.indexOf("/")==0){
				hierachy.pop();
				current=hierachy[hierachy.length-1];
				//console.log("OffStack:"+JSON.stringify(current));
			} else {
				//console.log(tag+" - "+attribs);
				if (typeof(current[tag])!=="undefined" && Array.isArray(current[tag])){
					var tmp={};
					current[tag][current[tag].length]=tmp;
					current=tmp;
				} else if (typeof(current[tag])!=="undefined") {
					var tmp=current[tag];
					current[tag]=new Array;
					current[tag][0]=tmp;
					tmp={};
					current[tag][1]=tmp;
					current=tmp;
				} else {
					current[tag]={};
					current=current[tag];
				}
				if (typeof(text)!=="undefined"&&text.length>0){
					//console.log(tag+" "+text);
					current.$text=text;
				}
				attribs.replace(/([^ ]*?)=["'](.*?)["']/g, function(match,attrib,value) {
					if (attrib.indexOf("xmlns:")==0){
						addNamespace(current,attrib.substring(6),value);
					} else {
						attrib=attrib.replace(":","$");
						current[attrib]=value;
					}
				});
				if (attribs.length==0||attribs.lastIndexOf("/")!=attribs.length-1){
					hierachy[hierachy.length]=current;
					//console.log("Stack:"+JSON.stringify(current));
				} else {
					current=hierachy[hierachy.length-1];
				}
			}
			return "";
		});
		return ret;
	}
	this.renderXML=function(aXML){
		var ret=new Array();
		renderChilds (aXML,ret);
		/*for (var key in aXML) {
			if (aXML.hasOwnProperty(key)&&(key.indexOf("$")!=0)) {
				var tag=key.replace("$",":");
				ret[ret.length]="<"+tag;
				if (typeof(aXML.$namespaces)!="undefined"){
					renderNamespaces(ret,aXML.$namespaces);
				}
				renderAttributes(aXML[key],ret);
				ret[ret.length]=">";
				if (typeof(aXML[key].$text)!="undefined"){
					ret[ret.length]=aXML[key].$text;
				}
				var childno = renderChilds(aXML[key],ret,0);
				if (childno>0){
					ret[ret.length]="</"+tag+">";
				} else {
					ret[ret.length-1]=" />";
				}
			}
		}*/
		return ret.join("");
	}
	function renderNamespaces(output,namespaces){
		for (var key in namespaces) {
			if (namespaces.hasOwnProperty(key)) {
				output[output.length]=" xmlns:"+key+"=\""+namespaces[key]+"\"";
			}
		}
	}
	function renderAttributes(obj,output){
		for (var key in obj) {
			if (key=="$namespaces"){
				renderNamespaces(output,obj.$namespaces);
			} else if ((key.indexOf("$")!==0)&&obj.hasOwnProperty(key)&&((typeof(obj[key])=="string")||(typeof(obj[key])=="number"))) {
				var tag=key.replace("$",":");
				output[output.length]=" "+tag+"=\""+obj[key]+"\"";
			}
		}
	}
	function renderChilds(obj,output){
		var childno=0;
		for (var key in obj) {
			if (key.indexOf("$text")==0){
				childno++;
				output[output.length]=obj[key];
			} else if ((key.indexOf("$")!==0)&&obj.hasOwnProperty(key)&&(!((typeof(obj[key])=="string")||(typeof(obj[key])=="number")))){
				childno++;
				var entity=obj[key];
				function render(aKey,aEntity){
					var tag=aKey.replace("$",":");
					output[output.length]="<"+tag;
					renderAttributes(aEntity,output);
					output[output.length]=">";
					var currentChildNo=renderChilds(aEntity,output);
					childno=childno+currentChildNo;
					if (currentChildNo>0){
						output[output.length]="</"+tag+">";
					} else {
						output[output.length-1]=" />";
					}
				}
				if (Array.isArray(entity)){
					for (var i=0;i<entity.length;i++){
						render(key,entity[i]);
					}
				} else {
					render(key,entity);
				};
			}
		}
		return childno;
	}
}