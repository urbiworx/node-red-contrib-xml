var m2xml=require('meep-meep-xml');
process.on('message', function(m) {
 var buffer=new Array();
 for(var i=0;i<m.buffer.length;i++){
		buffer.push(m2xml.parseXML(m.buffer[i],m.options));
 }
 process.send({buffer:buffer,number:m.number});
});
