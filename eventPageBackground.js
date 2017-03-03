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

chrome.tabs.onUpdated.addListener(function (tabId, changeInfo, tab) {
    if (changeInfo.status == 'complete') {
        console.log("chrome.tabs.onUpdated    ---- SendBodyTagString   ---  Page Status : ", tab.status);
        getBodyTagSourceString(tab);
    }
});

function getBodyTagSourceString(tab) {
    chrome.tabs.sendMessage(tab.id, { action: "SendBodyTagString" }, function (response) {
        if (response && response.sourceString && tab.status === "complete") {
            afterGettingSource(response.sourceString, tab);
        }
        else {
            console.log("SendBodyTagString returned UNDEFINED");
            disableExtension(tab.id)
        }
    });
}

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

function flipkartSource(data, tabId) {
    let price = 0;
    productDetails.id = getParameterByName("pid", productDetails.url);


    let productName = $(data).find("._3eAQiD").text().trim();
    let flipkartPriceFormatted = $(data).find("._1vC4OE._37U4_g").text().trim();

    let flipkartRating = $(data).find("span#productRating_" + productDetails.id).eq(0).children("div").children("span").text();
    if (flipkartRating) {
        flipkartRating = flipkartRating.replace(/[^0-9\.]+/g, "");
        if (flipkartRating.length > 3) {
            flipkartRating.length.substr(0, 3)
        }
    }
    let flipkartReviewCount = $(data).find("span._38sUEc").eq(0).children('span').text();
    let flipkartReviewUrl = "";
    let flipkartProductImageUrl = $(data).find("div._2SIJjY").eq(0).children('img').attr('src');

    let isMobile = false;
    if ($(data).find("div._1joEet div:eq(2)").text()) {
        if ($(data).find("div._1joEet div:eq(2)").text().indexOf("Mobile") != -1) {
            isMobile = true;
        }
    }
    else {
        console.log("Breadcrumbs ERROR");
    }

    price = Number(flipkartPriceFormatted.replace(/[^0-9\.]+/g, ""));

    console.log("flipkartPrice  " + flipkartPriceFormatted);
    console.log("price  " + price);
    if (productName && price) {
        productDetails.name = productName;
        productDetails.formattedPrice = flipkartPriceFormatted;
        productDetails.price = price;
        productDetails.rating = flipkartRating;
        productDetails.reviewCount = flipkartReviewCount;
        productDetails.reviewUrl = flipkartReviewUrl;
        productDetails.imageUrl = flipkartProductImageUrl;
        productDetails.isMobile = isMobile;
        setValues(productDetails, tabId);
    }
    else {
        disableExtension(tabId);
    }
}

function amazonSource(data, tabId) {
    let price = 0;
    let amazonFormatterPrice = "";
    let productName = $(data).find("#productTitle").text().trim();
    let amazonSalePriceS = $(data).find("#priceblock_saleprice").text().trim();
    let amazonPriceS = $(data).find("#priceblock_ourprice").text().trim();
    let amazonDealPriceS = $(data).find("#priceblock_dealprice").text().trim();

    let amazonRating = $(data).find("span#acrPopover").attr('title');
    if (amazonRating) {
        amazonRating = amazonRating.substr(0, amazonRating.indexOf('o'));
        amazonRating = amazonRating.replace(/[^0-9\.]+/g, "");
    }

    let amazonReviewCount = $(data).find("span#acrCustomerReviewText").text().trim();
    let amazonReviewUrl = $(data).find("a#acrCustomerReviewLink").attr('href');
    let amazonProductImageUrl = $(data).find("div#imgTagWrapperId").children('img').attr('src');
    if (!amazonProductImageUrl) {
        amazonProductImageUrl = $(data).find("div.imgTagWrapper > img.a-dynamic-image").attr('src');
    }
    let isMobile = false;
    if ($(data).find("div#wayfinding-breadcrumbs_feature_div ul li:last-child").text()) {
        if ($(data).find("div#wayfinding-breadcrumbs_feature_div ul li:last-child").text().indexOf("Smartphones") != -1) {
            isMobile = true;
        }
    }
    else {
        console.log("Breadcrumbs ERROR");
    }


    //Get Product ID
    // str.substr(0, str.indexOf(' ')); // "72"
    // str.substr(str.indexOf(' ') + 1);
    // /Moto-Plus-4th-Gen-Black/product-reviews/B01DDP7GZK/ref=dpx_acr_txt?showViewpoints=1
    let array1 = amazonReviewUrl.split('/');
    let productId = array1[3];
    // $('img[src="' + oldSrc + '"]').attr('src', newSrc);

    let amazonPrice = Number(amazonPriceS.replace(/[^0-9\.]+/g, ""));
    let amazonSalePrice = Number(amazonSalePriceS.replace(/[^0-9\.]+/g, ""));
    let amazonDealPrice = Number(amazonDealPriceS.replace(/[^0-9\.]+/g, ""));
    amazonReviewCount = "" + Number(amazonReviewCount.replace(/[^0-9\.]+/g, ""));

    let prices = [];

    if (amazonSalePrice) { prices.push(amazonSalePrice); }
    if (amazonPrice) { prices.push(amazonPrice); }
    if (amazonDealPrice) { prices.push(amazonDealPrice); }

    price = Math.min.apply(Math, prices);
    if (price === amazonPrice) { amazonFormatterPrice = amazonPriceS; }
    else if (price === amazonSalePrice) { amazonFormatterPrice = amazonSalePriceS; }
    else if (price === amazonDealPrice) { amazonFormatterPrice = amazonDealPriceS; }
    if (price == Infinity) {
        price = 0;
    }
    if (productName && price) {
        productDetails.id = productId;
        productDetails.name = productName;
        productDetails.formattedPrice = '\u20B9 ' + amazonFormatterPrice;
        productDetails.price = price;
        productDetails.rating = amazonRating;
        productDetails.reviewCount = amazonReviewCount;
        productDetails.imageUrl = amazonProductImageUrl;
        productDetails.reviewUrl = amazonReviewUrl;
        productDetails.isMobile = isMobile;
        setValues(productDetails, tabId);
    }
    else {
        disableExtension(tabId);
    }
}

function setValues(productDetails, tabId) {
    if (productDetails.siteName === "Amazon") {
        productDetails.url = productDetails.domain + "/gp/product/" + productDetails.id;
    }
    else if (productDetails.siteName === "Flipkart") {
        if (productDetails.url.indexOf("?") !== -1) {
            productDetails.url = productDetails.url.substr(0, productDetails.url.indexOf("?"));
            productDetails.url = productDetails.url + "?pid=" + productDetails.id
        }
    }
    if (productDetails.reviewUrl) {
        productDetails.reviewUrl = productDetails.domain + productDetails.reviewUrl;
    }
    else {
        productDetails.reviewUrl = productDetails.url
    }

    chrome.browserAction.setIcon({
        path: "icon16.png",
        tabId: tabId
    });
    chrome.browserAction.setBadgeText({ text: "1", tabId: tabId });
    badgeTextData[tabId] = { badgeText: "1" };

    getDetailsById();
    // if (tabDatabase[tabId] && tabDatabase[tabId].productName && tabDatabase[tabId].price) {
    //     if (tabDatabase[tabId].productName === productDetails.productName && tabDatabase[tabId].price === productDetails.price) {
    //         console.log("Values are already stored");
    //     }
    //     else {
    //         tabDatabase[tabId].productName = productDetails.productName;
    //         tabDatabase[tabId].price = productDetails.price;
    //         console.log("Values are UPDATED");
    //         onValuesUpdate(productDetails, tabId);
    //     }
    // }
    // else {
    //     tabDatabase[tabId] = {};
    //     tabDatabase[tabId].productName = productDetails.productName;
    //     tabDatabase[tabId].price = productDetails.price;
    //     console.log("Values are ADDED");
    //     onValuesUpdate(productDetails, tabId);
    // }
}

function getDetailsById() {

    $.ajax({
        url: "http://saileshwedseshwari.in/php/get-mobile-by-id.php",
        type: "GET",
        data: {
            id: productDetails.id,
            siteName: productDetails.siteName
        },
        dataType: "JSON",
        success: function (data) {
            console.log("DTA FROM GET : ", data);
            afterGettingMobileById(data);
        },
        error: function (textStatus, errorThrown) {
            afterNoRecordsFound("")
        }
    });
}
function afterNoRecordsFound(result) {
    if (productDetails.isMobile) {
        console.log("GET ERROR : ADD NEW MOBILE");
        addNewMobile();
    }
    else {
        console.log("This is not Mobile");
    }
}

function afterGettingMobileById(result) {
    if (result) {
        if (productDetails.siteName === "Amazon") {
            if (result.amazonMobileId === productDetails.id) {
                let data = {};
                data.siteName = "Amazon";
                data.id = productDetails.id;
                let callApi = false;
                if (productDetails.price && result.amazonMobilePrice != productDetails.price) {
                    data.price = productDetails.price;
                    callApi = true;
                }
                if (productDetails.name && result.amazonMobileName != productDetails.name) {
                    data.name = productDetails.name;
                    callApi = true;
                }
                if (productDetails.rating && result.amazonMobileRating != productDetails.rating) {
                    data.rating = productDetails.rating;
                    callApi = true;
                }
                if (productDetails.reviewCount && result.amazonMobileReviewCount != productDetails.reviewCount) {
                    data.reviewCount = productDetails.reviewCount;
                    callApi = true;
                }
                if (productDetails.url && result.amazonMobileUrl != productDetails.url) {
                    data.url = productDetails.url;
                    callApi = true;
                }
                if (productDetails.reviewUrl && result.amazonMobileReviewUrl != productDetails.reviewUrl) {
                    data.reviewUrl = productDetails.reviewUrl;
                    callApi = true;
                }
                if (productDetails.imageUrl && result.amazonMobileImageUrl != productDetails.imageUrl) {
                    data.imageUrl = productDetails.imageUrl;
                    callApi = true;
                }
                if (callApi == true && productDetails.isMobile) {
                    updateMobileInfo(data);
                }
                else if (!productDetails.isMobile) {
                    console.log("This is not Mobile");
                }
                else {
                    console.log("No Updates");
                }
            }
        }
        else if (productDetails.siteName === "Flipkart") {
            if (result.flipkartMobileId === productDetails.id) {
                let data = {};
                data.siteName = "Flipkart";
                data.id = productDetails.id;
                let callApi = false;
                if (productDetails.price && result.flipkartMobilePrice != productDetails.price) {
                    data.price = productDetails.price;
                    callApi = true;
                }
                if (productDetails.name && result.flipkartMobileName != productDetails.name) {
                    data.name = productDetails.name;
                    callApi = true;
                }
                if (productDetails.rating && result.flipkartMobileRating != productDetails.rating) {
                    data.rating = productDetails.rating;
                    callApi = true;
                }
                if (productDetails.reviewCount && result.flipkartMobileReviewCount != productDetails.reviewCount) {
                    data.reviewCount = productDetails.reviewCount;
                    callApi = true;
                }
                if (productDetails.url && result.flipkartMobileUrl != productDetails.url) {
                    data.url = productDetails.url;
                    callApi = true;
                }
                if (productDetails.reviewUrl && result.flipkartMobileReviewUrl != productDetails.reviewUrl) {
                    data.reviewUrl = productDetails.reviewUrl;
                    callApi = true;
                }
                if (productDetails.imageUrl && result.flipkartMobileImageUrl != productDetails.imageUrl) {
                    data.imageUrl = productDetails.imageUrl;
                    callApi = true;
                }
                if (callApi == true && productDetails.isMobile) {
                    updateMobileInfo(data);
                }
                else if (!productDetails.isMobile) {
                    console.log("This is not Mobile");
                }
                else {
                    console.log("No Updates");
                }
            }
        }
    }
    else {
        console.log("AFTER GET : ADD NEW MOBILE");
        addNewMobile();
    }
}

function updateMobileInfo(data) {
    $.ajax({
        url: "http://saileshwedseshwari.in/php/update-mobile.php",
        type: "POST",
        data: data,
        dataType: "JSON",
        success: function (response) {
            $("#resultDiv").append("<span class='errorText'>results = " + JSON.stringify(response) + "</span>");
        },
        error: function (textStatus, errorThrown) {
            console.log(textStatus + " " + errorThrown);
        }
    });
}

function addNewMobile() {
    $.ajax({
        url: "http://saileshwedseshwari.in/php/add-mobile.php",
        type: "POST",
        data: productDetails,
        dataType: "JSON",
        success: function (data) {
            console.log("ADDED NEW MOBILE ", data);
        },
        error: function (textStatus, errorThrown) {
            console.log(textStatus + " " + errorThrown);
        }
    });

    console.log("PRODUCT DETAILS === > ", productDetails);
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

// function getCurrentTab(callback) {
//     // Query filter to be passed to chrome.tabs.query - see
//     // https://developer.chrome.com/extensions/tabs#method-query
//     var queryInfo = {
//         active: true,
//         currentWindow: true
//     };

//     chrome.tabs.query(queryInfo, function (tabs) {
//         var tab = tabs[0];

//         callback(tab);
//     });
// }