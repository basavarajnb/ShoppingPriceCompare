function amazonSource(data, tabId, setAmazonValuesCallback, disableExtension) {
    let price = 0;
    let productFormatterPrice = "";

    let productName;
    let productRating;
    let productReviewCount;
    let productReviewUrl;
    let productImageUrl;

    let productSalePriceS;
    let productPriceS;
    let productDealPriceS;

    let isMobile;

    try {
        productName = $(data).find("#productTitle").text().trim();
        productSalePriceS = $(data).find("#priceblock_saleprice").text().trim();
        productPriceS = $(data).find("#priceblock_ourprice").text().trim();
        productDealPriceS = $(data).find("#priceblock_dealprice").text().trim();

        productRating = $(data).find("span#acrPopover").attr('title');
        if (productRating) {
            productRating = productRating.substr(0, productRating.indexOf('o'));
            productRating = productRating.replace(/[^0-9\.]+/g, "");
        }

        productReviewCount = $(data).find("span#acrCustomerReviewText").text().trim();
        productReviewUrl = $(data).find("a#acrCustomerReviewLink").attr('href');
        productImageUrl = $(data).find("div#imgTagWrapperId").children('img').attr('src');
        if (!productImageUrl) {
            productImageUrl = $(data).find("div.imgTagWrapper > img.a-dynamic-image").attr('src');
        }
        isMobile = true;



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
        let array1 = productReviewUrl.split('/');
        let productId = array1[3];
        // $('img[src="' + oldSrc + '"]').attr('src', newSrc);

        let productPrice = Number(productPriceS.replace(/[^0-9\.]+/g, ""));
        let productSalePrice = Number(productSalePriceS.replace(/[^0-9\.]+/g, ""));
        let productDealPrice = Number(productDealPriceS.replace(/[^0-9\.]+/g, ""));
        productReviewCount = "" + Number(productReviewCount.replace(/[^0-9\.]+/g, ""));

        let prices = [];

        if (productSalePrice) { prices.push(productSalePrice); }
        if (productPrice) { prices.push(productPrice); }
        if (productDealPrice) { prices.push(productDealPrice); }

        price = Math.min.apply(Math, prices);
        if (price === productPrice) { productFormatterPrice = productPriceS; }
        else if (price === productSalePrice) { productFormatterPrice = productSalePriceS; }
        else if (price === productDealPrice) { productFormatterPrice = productDealPriceS; }
        if (price == Infinity) {
            price = 0;
        }
        if (productName && price) {
            productDetails.id = productId;
            productDetails.name = productName;
            productDetails.formattedPrice = '\u20B9 ' + productFormatterPrice;
            productDetails.price = price;
            productDetails.rating = productRating;
            productDetails.reviewCount = productReviewCount;
            productDetails.imageUrl = productImageUrl;
            productDetails.reviewUrl = productReviewUrl;
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
            disableExtension(tabId);
        }
    }
    catch (err) {
        console.log("ERROR WHILE PARSING PAGE ", err);
        disableExtension(tabId);
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

