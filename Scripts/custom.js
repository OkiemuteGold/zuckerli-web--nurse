var $grid;
var buttonFilter;
// quick search regex
var qsRegex;

jQuery(document).ready(function ($) {


    "use strict";

    var $quicksearch = $('#searchPrd').keyup(debounce(function () {
        qsRegex = new RegExp($quicksearch.val(), 'gi');
        $grid.isotope();
    }));

    $('.filters ul li').click(function () {
        $('.filters ul li').removeClass('active');
        $(this).addClass('active');

        buttonFilter = $(this).attr('data-filter');
        $grid.isotope();
    });

    

    var goToCartIcon = function ($addTocartBtn) {
        var $cartIcon = $(".my-cart-icon");
        var $image = $('<img width="30px" height="30px" src="' + $addTocartBtn.data("image") + '"/>').css({ "position": "fixed", "z-index": "999" });
        $addTocartBtn.prepend($image);
        var position = $cartIcon.position();
        $image.animate({
            top: position.top,
            left: position.left
        }, 500, "linear", function () {
            $image.remove();
        });
    }


    $('.my-cart-btn').myCart({
        classCartIcon: 'my-cart-icon',
        classCartBadge: 'my-cart-badge',
        classProductQuantity: 'my-product-quantity',
        classProductRemove: 'my-product-remove',
        classCheckoutCart: 'my-cart-checkout',
        affixCartIcon: true,
        showCheckoutModal: true,
        clickOnAddToCart: function ($addTocart) {
            goToCartIcon($addTocart);
        },
        clickOnCartIcon: function ($cartIcon, products, totalPrice, totalQuantity) {
            console.log("cart icon clicked", $cartIcon, products, totalPrice, totalQuantity);
        },
        checkoutCart: function (products, totalPrice, totalQuantity) {
            console.log("checking out", products, totalPrice, totalQuantity);
        },
        getDiscountPrice: function (products, totalPrice, totalQuantity) {
            console.log("calculating discount", products, totalPrice, totalQuantity);
            return totalPrice * 0.5;
        }
    });
       
 
});


$(window).load(function () {
    $grid =$(".grid").isotope({
        itemSelector: ".all",
        percentPosition: true,
        resize: true,
        filter: function () {
            var $this = $(this);
            var searchResult = qsRegex ? $this.text().match(qsRegex) : true;
            var buttonResult = buttonFilter ? $this.is(buttonFilter) : true;
            return searchResult && buttonResult;
        },
    });

});

function debounce(fn, threshold) {
    var timeout;
    threshold = threshold || 100;
    return function debounced() {
        clearTimeout(timeout);
        var args = arguments;
        var _this = this;
        function delayed() {
            fn.apply(_this, args);
        }
        timeout = setTimeout(delayed, threshold);
    };
}

//$(window).smartresize(function () {

//    var $container = $(".grid").isotope({});

//    $container.isotope({
//        // update columnWidth to a percentage of container width
//        masonry: { columnWidth: $container.width() - 20 }
//    });
//});



   
