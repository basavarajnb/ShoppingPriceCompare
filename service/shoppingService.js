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
            console.log("DTA FROM GET : ", data);
            getProductDetailsByIdOnSuccess(data, productDetails, successCallback);
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
        compareToUpdate(result, productDetails, successCallback);
    }
    else {
        addNewProduct(productDetails);
    }
}

function compareToUpdate(result, productDetails, successCallback) {
    if (result.mobileId === productDetails.id) {
        let data = {};
        let isUpdated = false;
        data.siteName = productDetails.siteName;
        data.id = productDetails.id;
        let callApi = false;
        if (productDetails.price && result.mobilePrice != productDetails.price) {
            data.price = productDetails.price;
            callApi = true;
        }
        if (productDetails.name && result.mobileName != productDetails.name) {
            data.name = productDetails.name;
            callApi = true;
        }
        if (productDetails.rating && result.mobileRating != productDetails.rating) {
            data.rating = productDetails.rating;
            callApi = true;
        }
        if (productDetails.reviewCount && result.mobileReviewCount != productDetails.reviewCount) {
            data.reviewCount = productDetails.reviewCount;
            callApi = true;
        }
        if (productDetails.url && result.mobileUrl != productDetails.url) {
            data.url = productDetails.url;
            callApi = true;
        }
        if (productDetails.reviewUrl && result.mobileReviewUrl != productDetails.reviewUrl) {
            data.reviewUrl = productDetails.reviewUrl;
            callApi = true;
        }
        if (productDetails.imageUrl && result.mobileImageUrl != productDetails.imageUrl) {
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



function isEmpty(obj) {
    for (var prop in obj) {
        if (obj.hasOwnProperty(prop))
            return false;
    }
    return JSON.stringify(obj) === JSON.stringify({});
}