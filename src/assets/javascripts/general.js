"use strict"
window.browser = window.browser || window.chrome

function isException(url) {
	for (const item of exceptions.url) if (item == `${url.protocol}//${url.host}`) return true
	for (const item of exceptions.regex) if (new RegExp(item).test(url.href)) return true
	return false
}

let exceptions

function init() {
	browser.storage.local.get("exceptions", r => {
		exceptions = r.exceptions
	})
}

init()
browser.storage.onChanged.addListener(init)

async function initDefaults() {
	return new Promise(resolve =>
		browser.storage.local.set(
			{
				exceptions: {
					url: [],
					regex: [],
				},
				theme: "DEFAULT",
				popupFrontends: ["youtube", "twitter", "instagram", "tiktok", "imgur", "reddit", "quora", "translate", "maps"],
				autoRedirect: false,
				protocol: "normal",
				protocolFallback: true,
				latencyThreshold: 1000,
			},
			() => resolve()
		)
	)
}

const allPopupFrontends = [
	"youtube",
	"youtubeMusic",
	"twitter",
	"instagram",
	"tiktok",
	"imgur",
	"reddit",
	"search",
	"translate",
	"maps",
	"wikipedia",
	"medium",
	"quora",
	"imdb",
	"reuters",
	"peertube",
	"lbry",
	"sendTargets",
]

export default {
	isException,
	initDefaults,
	allPopupFrontends,
}
