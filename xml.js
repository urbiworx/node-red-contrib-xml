/**
 * Copyright 2015 Urbiworx
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

module.exports = function(RED) {
    "use strict";
	var os=require('os') ;
    var m2xml=require('meep-meep-xml');
	
	var cp = require('child_process');
	var multithreadtimer=-1;
	var count=0;
	
	var cores=os.cpus().length-1;
	var workers=new Array();
	var msgsend=0;
	var multithreadinit=false;
	var nodes={};
	var nodeno=0;
	function initMultithread(){
		if (multithreadinit){
			return;
		}
		multithreadinit=true;
		for (var i=0;i<cores;i++){
			var worker=cp.fork('./node_modules/node-red-contrib-xml/xmlworker.js');
			worker.on('message', function(m) {
				for (var i=0;i<m.buffer.length;i++){
					nodes[m.number].send({payload:m.buffer[i]});
				}
			});
			workers.push(worker);
		}
	}

	var buffer=new Array();
    function XmlNode(n) {
        RED.nodes.createNode(this,n);
		var that=this;
        this.name = n.name || "";
		this.autoinline = (typeof(n.autoinline)=="undefined")?false:n.autoinline;
		this.ignorenamespace = (typeof(n.ignorenamespace)=="undefined")?false:n.ignorenamespace;
		this.multithread = (typeof(n.multithread)=="undefined")?false:n.multithread;
		if (that.multithread){
			this.number=nodeno++;
			initMultithread();
			nodes[this.number]=this;
		};
        this.on("input",function(msg) {
			var worker=msgsend%workers.length;
			buffer.push(msg.payload);
			count++;
			if (that.multithread){
				if (count>50&&multithreadtimer!=-1){
					count=0;
					clearTimeout(multithreadtimer);
					multithreadtimer=-1;
					msgsend++;
					workers[worker].send({buffer:buffer,options:{autoinline:that.autoinline,ignorenamespace:that.ignorenamespace},number:that.number});
					buffer=new Array()
				}
				if (multithreadtimer==-1){
					multithreadtimer=setTimeout(function(){
						multithreadtimer=-1;
						msgsend++;
						workers[worker].send({buffer:buffer,options:{autoinline:that.autoinline,ignorenamespace:that.ignorenamespace},number:that.number});
						buffer=new Array();
					},50);
				}
			} else {
				setTimeout(function(){
					that.send({payload:m2xml.parseXML(msg.payload,{autoinline:that.autoinline,ignorenamespace:that.ignorenamespace}),req:msg.req,res:msg.res});
				},0);
			}
        });
    }
    RED.nodes.registerType("xml-converter",XmlNode);

}
