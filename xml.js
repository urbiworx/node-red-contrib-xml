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
    var XMLTool=new (require('./xmllib').XML)();

    function XmlNode(n) {
        RED.nodes.createNode(this,n);
		var that=this;
        this.name = n.name || "";
		this.autoinline = (typeof(n.autoinline)=="undefined")?false:n.autoinline;
		this.ignorenamespace = (typeof(n.ignorenamespace)=="undefined")?false:n.ignorenamespace;
        this.on("input",function(msg) {
            this.send({payload:XMLTool.parseXML(msg.payload,{autoinline:that.autoinline,ignorenamespace:that.ignorenamespace}),req:msg.req,res:msg.res});
        });
    }
    RED.nodes.registerType("xml-converter",XmlNode);

}
