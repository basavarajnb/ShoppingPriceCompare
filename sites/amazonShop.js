function amazonSource(data, tabId, setAmazonValuesCallback, unsetAmazonValuesCallback) {
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
    let isMobile = true;
    // if ($(data).find("div#wayfinding-breadcrumbs_feature_div ul li:last-child").text()) {
    //     if ($(data).find("div#wayfinding-breadcrumbs_feature_div ul li:last-child").text().indexOf("Smartphones") != -1) {
    //         isMobile = true;
    //     }
    // }
    // else {
    //     console.log("Breadcrumbs ERROR");
    // }


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
        productDetails.url = productDetails.domain + "/gp/product/" + productDetails.id;
        if (productDetails.reviewUrl) {
            productDetails.reviewUrl = productDetails.domain + productDetails.reviewUrl;
        }
        else {
            productDetails.reviewUrl = productDetails.url
        }
        setAmazonValuesCallback(productDetails, tabId);
    }
    else {
        unsetAmazonValuesCallback(tabId);
    }
}

function setAmazonValues(productDetails, tabId) {

    console.log("Product Details => ", productDetails);

    setTabDetails(tabId);

    getProductDetailsById(productDetails, afterGettingMobileById, afterAmazonNoRecordsFound);
}

function afterAmazonNoRecordsFound(result) {
    if (productDetails.isMobile) {
        console.log("GET ERROR");
        // addNewProduct(productDetails);
    }
    else {
        console.log("This is not Mobile");
    }
}

