"use strict"

import generalHelper from "../../assets/javascripts/general.js"
import utils from "../../assets/javascripts/utils.js"

import youtubeHelper from "../../assets/javascripts/youtube/youtube.js"
import youtubeMusicHelper from "../../assets/javascripts/youtubeMusic.js"
import twitterHelper from "../../assets/javascripts/twitter.js"
import instagramHelper from "../../assets/javascripts/instagram.js"
import Reddit from "../../assets/javascripts/reddit.js"
import searchHelper from "../../assets/javascripts/search.js"
import translateHelper from "../../assets/javascripts/translate/translate.js"
import mapsHelper from "../../assets/javascripts/maps.js"
import wikipediaHelper from "../../assets/javascripts/wikipedia.js"
import mediumHelper from "../../assets/javascripts/medium.js"
import quoraHelper from "../../assets/javascripts/quora.js"
import libremdbHelper from "../../assets/javascripts/imdb.js"
import reutersHelper from "../../assets/javascripts/reuters.js"
import imgurHelper from "../../assets/javascripts/imgur.js"
import tiktokHelper from "../../assets/javascripts/tiktok.js"
import sendTargetsHelper from "../../assets/javascripts/sendTargets.js"
import peertubeHelper from "../../assets/javascripts/peertube.js"
import lbryHelper from "../../assets/javascripts/lbry.js"

window.browser = window.browser || window.chrome

// browser.runtime.onInstalled.addListener(details => {
// 	function initDefaults() {
// 		fetch("/instances/blacklist.json")
// 			.then(response => response.text())
// 			.then(async data => {
// 				browser.storage.local.clear(() => {
// 					browser.storage.local.set({ cloudflareBlackList: JSON.parse(data).cloudflare }, () => {
// 						browser.storage.local.set({ authenticateBlackList: JSON.parse(data).authenticate }, () => {
// 							browser.storage.local.set({ offlineBlackList: JSON.parse(data).offline })
// 						})
// 					})
// 				})
// 			})
// 	}
// 	if (details.reason == "install") initDefaults()

// 	// if (details.reason == 'install' || (details.reason == "update" && details.previousVersion != browser.runtime.getManifest().version)) {
// 	//   if (details.reason == "update")
// 	//     browser.storage.local.get(null, r => {
// 	//       if (r.theme) {
// 	//         const old = encodeURIComponent(JSON.stringify(r))
// 	//         browser.tabs.create({ url: browser.runtime.getURL(`/pages/background/reset_warning.html?data=${old}`) });
// 	//       }
// 	//       initDefaults();
// 	//     })
// 	//   else initDefaults();
// 	// }
// })


let BYPASSTABs = []
browser.webRequest.onBeforeRequest.addListener(
	details => {
		const url = new URL(details.url)
		if (new RegExp(/^chrome-extension:\/{2}.*\/instances\/.*.json$/).test(url.href) && details.type == "xmlhttprequest") return
		let initiator
		try {
			if (details.originUrl) initiator = new URL(details.originUrl)
			else if (details.initiator) initiator = new URL(details.initiator)
		} catch {
			return null
		}

		let newUrl = youtubeMusicHelper.redirect(url, details.type)
		if (!newUrl) newUrl = youtubeHelper.redirect(url, details.type, details.tabId, initiator)
		if (!newUrl) newUrl = twitterHelper.redirect(url, details.type, initiator)
		if (!newUrl) newUrl = instagramHelper.redirect(url, details.type, initiator)
		if (!newUrl) newUrl = mapsHelper.redirect(url, initiator)
		if (!newUrl) newUrl = Reddit.redirect(url, details.type, initiator)
		if (!newUrl) newUrl = mediumHelper.redirect(url, details.type, initiator)
		if (!newUrl) newUrl = quoraHelper.redirect(url, details.type, initiator)
		if (!newUrl) newUrl = libremdbHelper.redirect(url, details.type, initiator)
		if (!newUrl) newUrl = reutersHelper.redirect(url, details.type, initiator)
		if (!newUrl) newUrl = imgurHelper.redirect(url, details.type, initiator)
		if (!newUrl) newUrl = tiktokHelper.redirect(url, details.type, initiator)
		if (!newUrl) newUrl = sendTargetsHelper.redirect(url, details.type, initiator)
		if (!newUrl) newUrl = peertubeHelper.redirect(url, details.type, initiator)
		if (!newUrl) newUrl = lbryHelper.redirect(url, details.type, initiator)
		if (!newUrl) newUrl = translateHelper.redirect(url)
		if (!newUrl) newUrl = searchHelper.redirect(url)
		if (!newUrl) newUrl = wikipediaHelper.redirect(url)

		if (details.frameAncestors && details.frameAncestors.length > 0 && generalHelper.isException(new URL(details.frameAncestors[0].url))) newUrl = null

		if (generalHelper.isException(url)) newUrl = "BYPASSTAB"
		if (BYPASSTABs.includes(details.tabId)) newUrl = null

		if (newUrl) {
			if (newUrl === "CANCEL") {
				console.log(`Canceled ${url}`)
				return { cancel: true }
			}
			if (newUrl === "BYPASSTAB") {
				console.log(`Bypassed ${details.tabId} ${url}`)
				if (!BYPASSTABs.includes(details.tabId)) BYPASSTABs.push(details.tabId)
				return null
			}
			console.info("Redirecting", url.href, "=>", newUrl)
			return { redirectUrl: newUrl }
		}
		return null
	},
	{ urls: ["<all_urls>"] },
	["blocking"]
)

browser.tabs.onRemoved.addListener(tabId => {
	const i = BYPASSTABs.indexOf(tabId)
	if (i > -1) {
		BYPASSTABs.splice(i, 1)
		console.log("Removed BYPASSTABs", tabId)
	}
})

browser.webRequest.onHeadersReceived.addListener(
	e => {
		let response = youtubeHelper.removeXFrameOptions(e)
		if (!response) response = twitterHelper.removeXFrameOptions(e)
		return response
	},
	{ urls: ["<all_urls>"] },
	["blocking", "responseHeaders"]
)

browser.commands.onCommand.addListener(command => {
	if (command === "switchInstance") utils.switchInstance()
	else if (command == "copyRaw") utils.copyRaw()
	else if (command == "unify") utils.unify()
})

browser.contextMenus.create({
	id: "settings",
	title: browser.i18n.getMessage("Settings"),
	contexts: ["browser_action"],
})

browser.contextMenus.create({
	id: "switchInstance",
	title: browser.i18n.getMessage("switchInstance"),
	contexts: ["browser_action"],
})

browser.contextMenus.create({
	id: "copyRaw",
	title: browser.i18n.getMessage("copyRaw"),
	contexts: ["browser_action"],
})

browser.contextMenus.create({
	id: "unify",
	title: browser.i18n.getMessage("unifySettings"),
	contexts: ["browser_action"],
})

browser.contextMenus.onClicked.addListener(info => {
	if (info.menuItemId == "switchInstance") utils.switchInstance()
	else if (info.menuItemId == "settings") browser.runtime.openOptionsPage()
	else if (info.menuItemId == "copyRaw") utils.copyRaw()
	else if (info.menuItemId == "unify") utils.unify()
})

browser.runtime.onMessage.addListener((message, sender, sendResponse) => {
	if (message.function === "unify") utils.unify(false).then(r => sendResponse({ response: r }))
	return true
})

browser.storage.local.set({ version: browser.runtime.getManifest().version })
