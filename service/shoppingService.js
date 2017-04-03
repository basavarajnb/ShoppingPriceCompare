var serviceHostAddress = "http://pricecompare/";

function getProductDetailsById(productDetails, successCallback, errorCallback) {
    $.ajax({
        url: serviceHostAddress + "get-mobile-by-id.php",
        type: "GET",
        data: {
            id: productDetails.id,
            siteName: productDetails.siteName
        },
        dataType: "JSON",
        success: function (data) {
            console.log("DATA FROM GET : ", data);
            getProductDetailsByIdOnSuccess(data, productDetails, successCallback);
        },
        error: function (textStatus, errorThrown) {
            errorCallback("")
        }
    });
}

function getPriceHistoryById(productDetails, successCallback, errorCallback) {
    $.ajax({
        url: serviceHostAddress + "get-price-history.php",
        type: "GET",
        data: {
            id: productDetails.id,
            siteName: productDetails.siteName
        },
        dataType: "JSON",
        success: function (data) {
            console.log("PRICE HISTORY GET : ", data);
            successCallback(data);
        },
        error: function (textStatus, errorThrown) {
            errorCallback("")
        }
    });
}

function updateProductInfo(data) {
    $.ajax({
        url: serviceHostAddress + "update-mobile.php",
        type: "POST",
        data: data,
        dataType: "JSON",
        success: function (data) {
            console.log("UPDATED MOBILE INFO ", data);
        },
        error: function (textStatus, errorThrown) {
            console.log(textStatus + " " + errorThrown);
        }
    });
}

function getSelectorObject(url) {
    let productDetailsSelector = {};
    let originUrl = url.match(/^[\w-]+:\/{2,}\[?[\w\.:-]+\]?(?::[0-9]*)?/)[0];
    if (originUrl.indexOf("amazon") !== -1) {
        productDetailsSelector.siteName = "Amazon";
        productDetailsSelector.id = "";
        productDetailsSelector.name = "#productTitle";
        productDetailsSelector.productSalePriceS = "#priceblock_saleprice";
        productDetailsSelector.productPriceS = "#priceblock_ourprice";
        productDetailsSelector.productDealPriceS = "#priceblock_dealprice";
        productDetailsSelector.rating = "span#acrPopover";
        productDetailsSelector.reviewCount = "span#acrCustomerReviewText";
        productDetailsSelector.reviewUrl = "a#acrCustomerReviewLink";
        productDetailsSelector.imageUrl = "div#imgTagWrapperId > img";
        productDetailsSelector.imageUrl2 = "div.imgTagWrapper > img.a-dynamic-image";
    }
    else if (originUrl.indexOf("flipkart") !== -1) {
        productDetailsSelector.siteName = "Flipkart";
        productDetailsSelector.id = "";
        productDetailsSelector.name = "._3eAQiD";
        productDetailsSelector.formattedPrice = "._1vC4OE._37U4_g"; // '\u20B9 '
        // productDetailsSelector.price = "";
        productDetailsSelector.rating = "._1dlNCg > div > span > div > span";
        productDetailsSelector.reviewCount = "._1dlNCg > div > span._38sUEc >span";
        productDetailsSelector.reviewUrl = "";
        productDetailsSelector.imageUrl = "div._2SIJjY > img";
    }
    return productDetailsSelector;
}

function addNewProduct(productDetails) {
    $.ajax({
        url: serviceHostAddress + "add-mobile.php",
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


var getProductDetailsByIdOnSuccess = (result, productDetails, successCallback) => {
    if (result && !isEmpty(result)) {
        if (result.productId === productDetails.id) {
            let data = {};
            let isUpdated = false;
            data.siteName = productDetails.siteName;
            data.id = productDetails.id;
            data.price = productDetails.price;
            let callApi = false;
            if (productDetails.price && result.productPrice != productDetails.price) {
                data.price = productDetails.price;
                callApi = true;
            }
            if (productDetails.name && result.productName != productDetails.name) {
                data.name = productDetails.name;
                callApi = true;
            }
            if (productDetails.rating && result.productRating != productDetails.rating) {
                data.rating = productDetails.rating;
                callApi = true;
            }
            if (productDetails.reviewCount && result.productReviewCount != productDetails.reviewCount) {
                data.reviewCount = productDetails.reviewCount;
                callApi = true;
            }
            if (productDetails.url && result.productUrl != productDetails.url) {
                data.url = productDetails.url;
                callApi = true;
            }
            if (productDetails.reviewUrl && result.productReviewUrl != productDetails.reviewUrl) {
                data.reviewUrl = productDetails.reviewUrl;
                callApi = true;
            }
            if (productDetails.imageUrl && result.productImageUrl != productDetails.imageUrl) {
                data.imageUrl = productDetails.imageUrl;
                callApi = true;
            }
            if (callApi == true && productDetails.isMobile) {
                updateProductInfo(data);
                isUpdated = true;
            }
            else if (!productDetails.isMobile) {
                console.log("This is not Mobile");
            }
            else {
                console.log("No Updates");
            }
            successCallback(result, isUpdated);
        }
    }
    else {
        addNewProduct(productDetails);
    }
}

function isEmpty(obj) {
    for (var prop in obj) {
        if (obj.hasOwnProperty(prop))
            return false;
    }
    return JSON.stringify(obj) === JSON.stringify({});
}