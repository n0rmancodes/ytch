console.log("test for getBasicInfo on https://www.youtube.com/c/TRGOArchive/");
const ytcs = require("../../index.js");
go();
async function go() {
	ytcs.getBasicInfo("https://www.youtube.com/c/TRGOArchive/", function (err, info) {
		console.log("error: " + err);
		console.log("info: " + info);
	})
}