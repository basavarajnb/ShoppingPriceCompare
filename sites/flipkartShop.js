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
        setFlipkartValues(productDetails, tabId);
    }
    else {
        disableExtension(tabId);
    }
}

function setFlipkartValues(productDetails, tabId) {
    if (productDetails.url.indexOf("?") !== -1) {
            productDetails.url = productDetails.url.substr(0, productDetails.url.indexOf("?"));
            productDetails.url = productDetails.url + "?pid=" + productDetails.id
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

    getProductDetailsById(productDetails, afterGettingFlipkartMobileById, afterFlipkartNoRecordsFound);
}

function afterFlipkartNoRecordsFound(result) {
    if (productDetails.isMobile) {
        console.log("GET ERROR : ADD NEW MOBILE");
        addNewProduct(productDetails);
    }
    else {
        console.log("This is not Mobile");
    }
}

function afterGettingFlipkartMobileById(result) {
    if (result) {
        if (productDetails.siteName === "Flipkart") {
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
                    updateProductInfo(data);
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
        addNewProduct(productDetails);
    }
}