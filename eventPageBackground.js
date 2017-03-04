var badgeTextData = {};

var tabDatabase = {};
var productDetails = {};

var originUrls = ["http://www.amazon.in",
    "https://www.amazon.in",
    "http://www.flipkart.com",
    "https://www.flipkart.com"
];

// chrome.tabs.onActivated.addListener(function (activeInfo) {
//     chrome.tabs.get(activeInfo.tabId, function (tab) {
//         console.log("chrome.tabs.onActivated    ---- SendBodyTagString   ---  Page Status : ", tab.status);
//         getBodyTagSourceString(tab);
//     });
// });
chrome.runtime.onMessage.addListener(function(response, sender, sendResponse) {
    console.log("ON LOAD  Message", sender.tab);
    if (response && response.sourceString) {
            afterGettingSource(response.sourceString, sender.tab);
        }
        else {
            console.log("SendBodyTagString returned UNDEFINED");
            disableExtension(sender.tab.id)
        }
});

// chrome.tabs.onUpdated.addListener(function (tabId, changeInfo, tab) {
//     if (changeInfo.status == 'complete') {
//         console.log("AFTER UPDATE COMPLETE");
//         console.log("chrome.tabs.onUpdated    ---- SendBodyTagString   ---  Page Status : ", tab.status);
//         getBodyTagSourceString(tab);
//     }
// });

// function getBodyTagSourceString(tab) {
//     chrome.tabs.sendMessage(tab.id, { action: "SendBodyTagString" }, function (response) {
//         if (response && response.sourceString && tab.status === "complete") {
//             afterGettingSource(response.sourceString, tab);
//         }
//         else {
//             console.log("SendBodyTagString returned UNDEFINED");
//             disableExtension(tab.id)
//         }
//     });
// }

function afterGettingSource(data, tab) {
    let isShoppingSite = false;
    let originUrl = tab.url.match(/^[\w-]+:\/{2,}\[?[\w\.:-]+\]?(?::[0-9]*)?/)[0];
    originUrls.forEach((value) => {
        if (value.startsWith(originUrl)) {
            isShoppingSite = true;
        }
    });
    if (isShoppingSite) {
        productDetails.domain = originUrl;
        productDetails.url = tab.url;

        let price = 0;
        data = data.replace(/<script[^>]+?\/>|<script(.|\s)*?\/script>/gi, '').trim();
        data = $.parseHTML(data);
        if (originUrl.indexOf("amazon") !== -1) {
            productDetails.siteName = "Amazon";
            amazonSource(data, tab.id);
        }
        else if (originUrl.indexOf("flipkart") !== -1) {
            productDetails.siteName = "Flipkart";
            flipkartSource(data, tab.id);
            console.log("FLIPKART SITE");
        }
    } else {
        disableExtension(tab.id);
    }
}

function onValuesUpdate(productDetails, tabId) {
    var root = 'http://saileshwedseshwari.in/php/sendmail.php';
    $.ajax({
        url: root, success: function (data) {
            console.log("Product : " + productDetails.productName + "     Price: " + productDetails.price + "              Save : " + data);
        }
    });
}
function disableExtension(tabId) {
    chrome.browserAction.setBadgeText({ text: "", tabId: tabId });
    chrome.browserAction.setIcon({
        path: "disabledIcon16.png",
        tabId: tabId
    });
    badgeTextData[tabId] = { badgeText: "" };
}

function getParameterByName(name, url) {
    name = name.replace(/[\[\]]/g, "\\$&");
    var regex = new RegExp("[?&]" + name + "(=([^&#]*)|&|#|$)"),
        results = regex.exec(url);
    if (!results) return null;
    if (!results[2]) return '';
    return decodeURIComponent(results[2].replace(/\+/g, " "));
}