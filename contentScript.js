
function getProductDetailsFromPage(selectorObj) {
    console.log("selectorObj IN CONTENT SCRIPT = > ", selectorObj);
    let productDetails = {};
    let originUrl = location.href.match(/^[\w-]+:\/{2,}\[?[\w\.:-]+\]?(?::[0-9]*)?/)[0];
    productDetails.domain = originUrl;
    productDetails.url = location.href;
    productDetails.productName = $(selectorObj.name).text().trim();

    if (selectorObj.siteName === "Flipkart") {
        productDetails.productId = getParameterByName("pid", location.href);
        productDetails.siteName = selectorObj.siteName;
        productDetails.productFormatterPrice = $(selectorObj.formattedPrice).text().trim();
        productDetails.productReviewCount = $(selectorObj.reviewCount).text().trim();
        let productRating = $(selectorObj.rating).text().trim();
        if (productRating) {
            productRating = productRating.replace(/[^0-9\.]+/g, "");
            if (productRating.length > 3) { productRating.length.substr(0, 3); }
        }
        productDetails.productRating = productRating;
        if (productDetails.url.indexOf("?") !== -1) {
            productDetails.url = productDetails.url.substr(0, productDetails.url.indexOf("?"));
            productDetails.url = productDetails.url + "?pid=" + productDetails.productId;
        }
        productDetails.productReviewUrl = productDetails.url;
    }
    else if (selectorObj.siteName === "Amazon") {
        productDetails.siteName = "Amazon";
        productDetails.productId = "";

        productSalePriceS = $(selectorObj.productSalePriceS).text().trim();
        productPriceS = $(selectorObj.productPriceS).text().trim();
        productDealPriceS = $(selectorObj.productDealPriceS).text().trim();

        let productPrice = Number(productPriceS.replace(/[^0-9\.]+/g, ""));
        let productSalePrice = Number(productSalePriceS.replace(/[^0-9\.]+/g, ""));
        let productDealPrice = Number(productDealPriceS.replace(/[^0-9\.]+/g, ""));

        let prices = [];

        if (productSalePrice) { prices.push(productSalePrice); }
        if (productPrice) { prices.push(productPrice); }
        if (productDealPrice) { prices.push(productDealPrice); }

        price = Math.min.apply(Math, prices);
        if (price === productPrice) { productDetails.productFormatterPrice = productPriceS; }
        else if (price === productSalePrice) { productDetails.productFormatterPrice = productSalePriceS; }
        else if (price === productDealPrice) { productDetails.productFormatterPrice = productDealPriceS; }

        productDetails.productReviewCount = $(selectorObj.reviewCount).text().trim();
        productDetails.productReviewCount = "" + Number(productDetails.productReviewCount.replace(/[^0-9\.]+/g, ""));
        let productRating = $(selectorObj.rating).text().trim();
        if (productRating) {
            productRating = productRating.substr(0, productRating.indexOf('o'));
            productRating = productRating.replace(/[^0-9\.]+/g, "");
        }

        productDetails.productRating = productRating;
        let productReviewUrlPart2 = $(selectorObj.reviewUrl).attr("href");
        if (productReviewUrlPart2) {
            
            productDetails.productReviewUrl = productDetails.domain?  productDetails.domain + productReviewUrlPart2: productReviewUrlPart2;
        }
        else {
            productDetails.productReviewUrl = productDetails.url
        }
        let array1 = productReviewUrlPart2.split('/');
        productDetails.productId = array1[3];
        productDetails.url = productDetails.domain + "/gp/product/" + productDetails.productId;
    }

    productDetails.productImageUrl = $(selectorObj.imageUrl).eq(0).attr("src");
    if (!productDetails.productImageUrl) {
        productDetails.productImageUrl = $(selectorObj.imageUrl2).eq(0).attr("src");
    }

    console.log("DATA FROM THE PAGE => ", productDetails);
    return productDetails;
}

chrome.extension.onMessage.addListener(function (msg, sender, sendResponse) {
    if (msg.action == 'SendProductDetails') {
        sendResponse({ productDetails: getProductDetailsFromPage(msg.selectorObj) });
    }
});

function getParameterByName(name, url) {
    name = name.replace(/[\[\]]/g, "\\$&");
    var regex = new RegExp("[?&]" + name + "(=([^&#]*)|&|#|$)"),
        results = regex.exec(url);
    if (!results) return null;
    if (!results[2]) return '';
    return decodeURIComponent(results[2].replace(/\+/g, " "));
}

// Listen for messages from the popup
chrome.runtime.onMessage.addListener(function (msg, sender, response) {
    // First, validate the message's structure
    if ((msg.from === 'popup') && (msg.subject === 'GeProductDetailsFromBackground')) {
        response({ productDetails: getProductDetailsFromPage(msg.selectorObj) });
    }
});