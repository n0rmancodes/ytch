console.log("test for getBasicInfo on https://www.youtube.com/c/TRGOArchive/");
const ytcs = require("../../index.js");
go();
async function go() {
	ytcs.getHome("https://www.youtube.com/c/TRGOArchive/", function (err, info) {
		var j = JSON.parse(info)
		console.log("channel id: " + j.meta.channelId);
		ytcs.getUploads(j.meta.channelId, null, function(err, info) {
			var j = JSON.parse(info);
		})
	})
}