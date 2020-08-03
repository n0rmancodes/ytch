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

exports.getHome = (url, cb) => {
	got.get(url, dOpt).then(function(response) {
		var $ = cheerio.load(response.body);
		var d = JSON.parse($.html().split('ytInitialData"] = ')[1].split(';')[0]);
		var md = d.metadata.channelMetadataRenderer;
		var hdr = d.header.c4TabbedHeaderRenderer;
		var homeRender = d.contents.twoColumnBrowseResultsRenderer.tabs[0].tabRenderer.content.sectionListRenderer.contents;
		var h = [];
		for (var d in homeRender) {
			var tit = homeRender[d].itemSectionRenderer.contents[0].shelfRenderer.title.runs[0].text;
			var content = homeRender[d].itemSectionRenderer.contents[0].shelfRenderer.content.horizontalListRenderer.items;
			var v = [];
			for (var e in content) {
				var vTitle = content[e].gridVideoRenderer.title.simpleText;
				var vId = content[e].gridVideoRenderer.videoId;
				var vPubTxt = content[e].gridVideoRenderer.publishedTimeText.simpleText;
				var viewCount = content[e].gridVideoRenderer.viewCountText;
				var sViewCount = content[e].gridVideoRenderer.shortViewCountText;
				var top = content[e].gridVideoRenderer.thumbnail.thumbnails.length - 1;
				var thumb = content[e].gridVideoRenderer.thumbnail.thumbnails[top].url.split("?")[0];
				var data = {
					"title": vTitle,
					"videoId": vId,
					"publishedText": vPubTxt,
					"viewCounts": {
						"shortened": sViewCount,
						"full": viewCount,
					},
					"thumbnail": thumb
				}
				v.push(data);
			}
			var dat = {
				"title": tit,
				v
			}
			h.push(dat);
		}
		
		var finalData = JSON.stringify({
			"shelves": h,
			"meta": {
				"channelId": md.externalId,
				"authorName": md.title,
				"avatars": md.avatar.thumbnails[md.avatar.thumbnails.length - 1].url.split("=s")[0],
				"subscriberCount": hdr.subscriberCountText.runs[0].text,
				"banners": "https:" + hdr.tvBanner.thumbnails[hdr.tvBanner.thumbnails.length - 1].url.split("=w")[0] + "=w2560"
			}
		})
		var err = null
		cb(err, finalData);
	})
}

exports.getUploads = (id, opt, cb) => {
	if (!id | !cb) {
		console.error("[YTCH ERR] You must have all params!");
		return false;
	}
	var url = "https://youtube.com/channel/" + id + "/videos";
	got.get(url, dOpt).then(function(response) {
		var $ = cheerio.load(response.body);
		var d = JSON.parse($.html().split('ytInitialData"] = ')[1].split(';')[0]);
		var videos = d.contents.twoColumnBrowseResultsRenderer.tabs[1].tabRenderer.content.sectionListRenderer.contents[0].itemSectionRenderer.contents[0].gridRenderer.items;
		var cont = d.contents.twoColumnBrowseResultsRenderer.tabs[1].tabRenderer.content.sectionListRenderer.contents[0].itemSectionRenderer.contents[0].gridRenderer.continuations[0].nextContinuationData;
		var v = [];
		for (var e in videos) {
			var vTitle = videos[e].gridVideoRenderer.title.simpleText;
			var vId = videos[e].gridVideoRenderer.videoId;
			var vPubTxt = videos[e].gridVideoRenderer.publishedTimeText.simpleText;
			var viewCount = videos[e].gridVideoRenderer.viewCountText;			
			var sViewCount = videos[e].gridVideoRenderer.shortViewCountText;
			var top = videos[e].gridVideoRenderer.thumbnail.thumbnails.length - 1;
			var thumb = videos[e].gridVideoRenderer.thumbnail.thumbnails[top].url.split("?")[0];
			var data = {
				"title": vTitle,
				"videoId": vId,
				"publishedText": vPubTxt,
				"viewCounts": {
					"shortened": sViewCount,
					"full": viewCount,
				},
				"thumbnail": thumb
			}
			v.push(data);
		}
		var finalData = JSON.stringify({
			"videos": v,
			"continuation": cont
		})
		var err = null
		cb(err, finalData);
	})
}