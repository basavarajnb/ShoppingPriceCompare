var badgeTextData = {};

var tabDatabase = {};
var productDetails = {};

var originUrls = ["http://www.amazon.in",
    "https://www.amazon.in",
    "http://www.flipkart.com",
    "https://www.flipkart.com"
];

chrome.tabs.onUpdated.addListener(function (tabId, changeInfo, tab) {
    if (changeInfo.status == 'complete') {
        console.log("AFTER UPDATE COMPLETE ---- SendProductDetails   ---  Page Status : ", tab);
        getProductDetailsFromContentScript(tab);
    }
});

function getProductDetailsFromContentScript(tab) {
    let isShoppingSite = false;
    let originUrl = tab.url.match(/^[\w-]+:\/{2,}\[?[\w\.:-]+\]?(?::[0-9]*)?/)[0];
    originUrls.forEach((value) => {
        if (value.startsWith(originUrl)) {
            isShoppingSite = true;
        }
    });
    if (isShoppingSite) {
        let selectorObj = getSelectorObject(tab.url); // From Shopping Service
        chrome.tabs.sendMessage(tab.id, { action: "SendProductDetails", selectorObj: selectorObj }, function (response) {
            if (response && response.productDetails && tab.status === "complete") {
                afterGettingProductDetailsFromCScript(response.productDetails, tab);
            }
            else {
                console.log("SendBodyTagString returned UNDEFINED");
                disableExtension(tab.id)
            }
        });
    } else {
        disableExtension(tab.id);
    }
}

function afterGettingProductDetailsFromCScript(data, tab) {
    if (data.productId && data.productName && data.productFormatterPrice) {
        productDetails.siteName = data.siteName;
        productDetails.id = data.productId;
        productDetails.name = data.productName;
        productDetails.formattedPrice = data.productFormatterPrice;
        productDetails.price = Number(data.productFormatterPrice.replace(/[^0-9\.]+/g, ""));;
        productDetails.rating = data.productRating;
        productDetails.reviewCount = data.productReviewCount;
        productDetails.reviewUrl = data.productReviewUrl;
        productDetails.imageUrl = data.productImageUrl;
        productDetails.url = data.url;
        productDetails.isMobile = true;

        console.log("Product Details => ", productDetails);

        setTabDetails(tab.id);

        getProductDetailsById(productDetails, afterGettingMobileById, afterNoRecordsFound);
    }
    else {
        disableExtension(tab.id);
    }
}

function afterNoRecordsFound(result) {
    if (productDetails.isMobile) {
        console.log("GET ERROR");
    }
    else {
        console.log("This is not Mobile");
    }
}

function afterGettingMobileById(result, isUpdated) {
    if (result) {
        if (isUpdated) {
            console.log("Mobile Info is updated");
        }
        else {
            console.log("Mobile Info is latest");
        }
    }
}

function disableExtension(tabId) {
    chrome.browserAction.setBadgeText({ text: "", tabId: tabId });
    chrome.browserAction.setIcon({
        path: "disabledIcon16.png",
        tabId: tabId
    });
    badgeTextData[tabId] = { badgeText: "" };
}

function setTabDetails(tabId) {
    chrome.browserAction.setIcon({
        path: "icon16.png",
        tabId: tabId
    });
    chrome.browserAction.setBadgeText({ text: "1", tabId: tabId });
    badgeTextData[tabId] = { badgeText: "1" };
}