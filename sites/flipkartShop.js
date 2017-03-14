function flipkartSource(data, tabId, setFlipkartValuesCallback, disableExtension) {
    let price = 0;
    let productFormatterPrice = "";

    let productName;
    let productRating;
    let productReviewCount;
    let productReviewUrl;
    let productImageUrl;

    let isMobile;

    try {
        productDetails.id = getParameterByName("pid", productDetails.url);
        productName = $(data).find("._3eAQiD").text().trim();
        productFormatterPrice = $(data).find("._1vC4OE._37U4_g").text().trim();

        productRating = $(data).find("span#productRating_" + productDetails.id).eq(0).children("div").children("span").text();
        if (productRating) {
            productRating = productRating.replace(/[^0-9\.]+/g, "");
            if (productRating.length > 3) {
                productRating.length.substr(0, 3)
            }
        }
        productReviewCount = $(data).find("span._38sUEc").eq(0).children('span').text();
        productReviewUrl = "";
        productImageUrl = $(data).find("div._2SIJjY").eq(0).children('img').attr('src');

        isMobile = true;

        price = Number(productFormatterPrice.replace(/[^0-9\.]+/g, ""));

        console.log("flipkartPrice  " + productFormatterPrice);
        console.log("price  " + price);
        if (productName && price) {
            productDetails.name = productName;
            productDetails.formattedPrice = productFormatterPrice;
            productDetails.price = price;
            productDetails.rating = productRating;
            productDetails.reviewCount = productReviewCount;
            productDetails.reviewUrl = productReviewUrl;
            productDetails.imageUrl = productImageUrl;
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
            disableExtension(tabId);
        }
    }
    catch (err) {
        console.log("ERROR WHILE PARSING PAGE ", err);
        disableExtension(tabId);
    }


    // if ($(data).find("div._1joEet div:eq(2)").text()) {
    //     if ($(data).find("div._1joEet div:eq(2)").text().indexOf("Mobile") != -1) {
    //         isMobile = true;
    //     }
    // }
    // else {
    //     console.log("Breadcrumbs ERROR");
    // }
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