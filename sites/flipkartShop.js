function flipkartSource(data, tabId, setFlipkartValuesCallback, unsetFlipkartValuesCallback) {
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

    let isMobile = true;
    // if ($(data).find("div._1joEet div:eq(2)").text()) {
    //     if ($(data).find("div._1joEet div:eq(2)").text().indexOf("Mobile") != -1) {
    //         isMobile = true;
    //     }
    // }
    // else {
    //     console.log("Breadcrumbs ERROR");
    // }

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
        setFlipkartValuesCallback(productDetails, tabId);
    }
    else {
        unsetFlipkartValuesCallback(tabId);
    }
}

function setFlipkartValues(productDetails, tabId) {

    console.log("Product Details => ", productDetails);

    setTabDetails(tabId);

    getProductDetailsById(productDetails, afterGettingMobileById, afterFlipkartNoRecordsFound);
}

function afterFlipkartNoRecordsFound(result) {
    if (productDetails.isMobile) {
        console.log("GET ERROR");
    }
    else {
        console.log("This is not Mobile");
    }
}