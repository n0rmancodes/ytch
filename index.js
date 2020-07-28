const got = require("got");
const cheerio = require("cheerio");
const dOpt = {
	"User-Agent":"Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:78.0) Gecko/20100101 Firefox/78.0",
	"Accept":"text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8",
	"Accept-Language":"en-US,en;q=0.5",
	"Accept-Encoding":"gzip, deflate, br",
	"DNT":"1",
	"Connection":"keep-alive",
	"Upgrade-Insecure-Requests":"1",
	"TE":"Trailers"
}

exports.getBasicInfo = (url, cb) => {
	got.get(url, dOpt).then(function(response) {
		var $ = cheerio.load(response.body);
		for (var c in $("body meta")) {
			if ($("body meta")[c].attribs !== undefined) {
				if ($("body meta")[c].attribs.name !== undefined) {
					if ($("body meta")[c].attribs.name == "title") {
						var authorName = $("body meta")[c].attribs.content
					}
					if ($("body meta")[c].attribs.name == "description") {
						var desc = $("body link")[c].attribs.content;
					}
				} else if ($("body meta")[c].attribs.itemprop !== undefined) {
					if ($("body meta")[c].attribs.itemprop == "isFamilyFriendly") {
						if ($("body meta")[c].attribs.content == "True") {
							var ff = true;
						} else if ($("body meta")[c].attribs.content == "False") {
							var ff = false;
						} else {
							var ff = null;
						}
					}
					if ($("body meta")[c].attribs.itemprop == "channelId") {
						var channelId = $("body meta")[c].attribs.content;
					}
					if ($("body meta")[c].attribs.itemprop == "regionsAllowed") {
						var d = $("body meta")[c].attribs.content.split(",");
						var ra = [];
						for (var c in d) {
							ra.push(d[c]);
						}
					}
				}
			}
		}
		for (var c in $("body link")) {
			if ($("body link")[c].attribs && $("body link")[c].attribs.rel !== undefined) {
				if ($("body link")[c].attribs.rel == "image_src") {
					var profilePic = $("body link")[c].attribs.href.split("=s")[0];
				}
			}
		}
		var finalData = JSON.stringify({
			"name": authorName,
			"profilePic": profilePic,
			"description": desc,
			"allowedRegions": ra,
			"channelId": channelId
		})
		var err = null
		cb(err, finalData)
	})
}