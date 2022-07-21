/*
* jQuery myCart - v1.0 - 2016-04-21
* http://asraf-uddin-ahmed.github.io/
* Copyright (c) 2016 Asraf Uddin Ahmed; Licensed None
*/

(function ($) {

  "use strict";

  var OptionManager = (function () {
    var objToReturn = {};

    var defaultOptions = {
      classCartIcon: 'my-cart-icon',
      classCartBadge: 'my-cart-badge',
      classProductQuantity: 'my-product-quantity',
      classProductRemove: 'my-product-remove',
      classCheckoutCart: 'my-cart-checkout',
      affixCartIcon: true,
      showCheckoutModal: true,
      clickOnAddToCart: function($addTocart) { },
      clickOnCartIcon: function($cartIcon, products, totalPrice, totalQuantity) { },
      checkoutCart: function(products, totalPrice, totalQuantity) { },
      getDiscountPrice: function(products, totalPrice, totalQuantity) { return null; }
    };


    var getOptions = function (customOptions) {
      var options = $.extend({}, defaultOptions);
      if (typeof customOptions === 'object') {
        $.extend(options, customOptions);
      }
      return options;
    }

    objToReturn.getOptions = getOptions;
    return objToReturn;
  }());


  var ProductManager = (function(){
    var objToReturn = {};

    /*
    PRIVATE
    */
    localStorage.products = localStorage.products ? localStorage.products : "";
    var getIndexOfProduct = function(id){
      var productIndex = -1;
      var products = getAllProducts();
      $.each(products, function(index, value){
        if(value.id == id){
          productIndex = index;
          return;
        }
      });
      return productIndex;
    }
    var setAllProducts = function(products){
      localStorage.products = JSON.stringify(products);
    }
    var addProduct = function(id, name, summary, price, quantity, image,quantityMax) {
      var products = getAllProducts();
      products.push({
        id: id,
        name: name,
        summary: summary,
        price: price,
        quantity: quantity,
        image: image,
        quantityMax: quantityMax

      });
      setAllProducts(products);
    }

    /*
    PUBLIC
    */
    var getAllProducts = function(){
      try {
        var products = JSON.parse(localStorage.products);
        return products;
      } catch (e) {
        return [];
      }
    }
    var updatePoduct = function(id, quantity) {
      var productIndex = getIndexOfProduct(id);
      if(productIndex < 0){
        return false;
      }
      var products = getAllProducts();
      products[productIndex].quantity = quantity;
      setAllProducts(products);
      return true;
    }
      var setProduct = function (id, name, summary, price, quantity, image,maxquantity) {
      if(typeof id === "undefined"){
        console.error("id required")
        return false;
      }
      if(typeof name === "undefined"){
        console.error("name required")
        return false;
      }
      if(typeof image === "undefined"){
        console.error("image required")
        return false;
      }
      if(!$.isNumeric(price)){
        console.error("price is not a number")
        return false;
      }
      if(!$.isNumeric(quantity)) {
        console.error("quantity is not a number");
        return false;
      }
       
      summary = typeof summary === "undefined" ? "" : summary;

      if(!updatePoduct(id)){
          addProduct(id, name, summary, price, quantity, image, maxquantity);
      }
    }
    var clearProduct = function(){
      setAllProducts([]);
    }
    var removeProduct = function(id){
      var products = getAllProducts();
      products = $.grep(products, function(value, index) {
        return value.id != id;
      });
      setAllProducts(products);
    }
    var getTotalQuantity = function(){
      var total = 0;
      var products = getAllProducts();
      $.each(products, function(index, value){
        total += value.quantity * 1;
      });
      return total;
    }
    var getTotalPrice = function(){
      var products = getAllProducts();
      var total = 0;
      $.each(products, function(index, value){
        total += value.quantity * value.price;
      });
      return total;
    }

    objToReturn.getAllProducts = getAllProducts;
    objToReturn.updatePoduct = updatePoduct;
    objToReturn.setProduct = setProduct;
    objToReturn.clearProduct = clearProduct;
    objToReturn.removeProduct = removeProduct;
    objToReturn.getTotalQuantity = getTotalQuantity;
    objToReturn.getTotalPrice = getTotalPrice;
    return objToReturn;
  }());


  var loadMyCartEvent = function(userOptions){

      var objToReturn = {};


    var options = OptionManager.getOptions(userOptions);
    var $cartIcon = $("." + options.classCartIcon);
    var $cartBadge = $("." + options.classCartBadge);
    var classProductQuantity = options.classProductQuantity;
    var classProductRemove = options.classProductRemove;
    var classCheckoutCart = options.classCheckoutCart;

    var idCartModal = 'my-cart-modal';
    var idCartTable = 'my-cart-table';
    var idGrandTotal = 'my-cart-grand-total';
    var idEmptyCartMessage = 'my-cart-empty-message';
    var idDiscountPrice = 'my-cart-discount-price';
    var classProductTotal = 'my-product-total';
    var classAffixMyCartIcon = 'my-cart-icon-affix';

    $cartBadge.text(ProductManager.getTotalQuantity());

    if(!$("#" + idCartModal).length) {
      $('body').append(
        '<div class="modal fade" id="' + idCartModal + '" tabindex="-1" role="dialog" aria-labelledby="myModalLabel">' +
        '<div class="modal-dialog" role="document">' +
        '<div class="modal-content">' +
        '<div class="modal-header">' +
        '<button type="button" class="close" data-dismiss="modal" aria-label="Close"><span aria-hidden="true">&times;</span></button>' +
        '<h4 class="modal-title" id="myModalLabel"><span class="glyphicon glyphicon-shopping-cart"></span> Mein Einkaufswagen</h4>' +
        '</div>' +
        '<div class="modal-body">' +
        '<table class="table table-hover table-responsive" id="' + idCartTable + '"></table>' +
        '</div>' +
        '<div class="modal-footer">' +
        '<form action="/ProductBasket" method="POST">' +
          '<input type="hidden" name="Ids" id="Ids"></input>' +
          '<input type="hidden" name="Quantity" id="Quantity"></input>' +
        '<button type="button" class="btn btn-default" data-dismiss="modal">Schliessen</button>' +
        '<button type="submit" class="btn btn-primary ' + classCheckoutCart + '">Weiter</a>' +
        '</form>'+
        '</div>' +
        '</div>' +
        '</div>' +
        '</div>'
      );
    }

    var drawTable = function(){
      var $cartTable = $("#" + idCartTable);
      $cartTable.empty();
      $cartTable.append("<tbody>");
      var products = ProductManager.getAllProducts();
      $.each(products, function(){
          var total = this.quantity * this.price;
          var options = "";
          for (var i = 1; i <= this.quantityMax; i++) {
              if (i == this.quantity) {
                  options += "<option selected>" + i + "</option>";
              }
              else {
                  options += "<option>" + i + "</option>";
              }
          }
        $cartTable.append(
          '<tr title="' + this.summary + '" data-id="' + this.id + '" data-price="' + this.price + '">' +
            '<td class="text-left" style="width: 30%"><img width="120px" height="87px" src="' + this.image + '"/></td>' +
            '<td style="width: 68%">' + this.name + '</br>' + this.summary + '</td>' +
            '<td> <select class="form-select my-product-quantity" style="width:min-content;">' + options + '</select> </td>' +
          '<td title="Remove from Cart" class="text-center" style="width: 30px;"><a href="javascript:void(0);" class="btn btn-xs btn-danger ' + classProductRemove + '">X</a></td>' +
          '</tr>'
        );
      });
        $cartTable.append("</tbody>");
      $cartTable.append(products.length ?
        ''
          : '<div class="alert alert-danger" role="alert" id="' + idEmptyCartMessage + '">Ihr Warenkorb ist leer</div>'
      );

     

      showGrandTotal();
      showDiscountPrice();
    }
    var showModal = function(){
      drawTable();
      $("#" + idCartModal).modal('show');
    }
    var updateCart = function(){
      $.each($("." + classProductQuantity), function(){
        var id = $(this).closest("tr").data("id");
        ProductManager.updatePoduct(id, $(this).val());
      });
    }
    var showGrandTotal = function(){
      $("#" + idGrandTotal).text("$" + ProductManager.getTotalPrice());
    }
    var showDiscountPrice = function(){
      $("#" + idDiscountPrice).text("$" + options.getDiscountPrice(ProductManager.getAllProducts(), ProductManager.getTotalPrice(), ProductManager.getTotalQuantity()));
    }

    /*
    EVENT
    */
    if(options.affixCartIcon) {
      var cartIconBottom = $cartIcon.offset().top * 1 + $cartIcon.css("height").match(/\d+/) * 1;
      var cartIconPosition = $cartIcon.css('position');
      $(window).scroll(function () {
        $(window).scrollTop() >= cartIconBottom ? $cartIcon.addClass(classAffixMyCartIcon) : $cartIcon.removeClass(classAffixMyCartIcon);
      });
    }

    $cartIcon.click(function(){
      options.showCheckoutModal ? showModal() : options.clickOnCartIcon($cartIcon, ProductManager.getAllProducts(), ProductManager.getTotalPrice(), ProductManager.getTotalQuantity());
    });

    $(document).on("change", "." + classProductQuantity, function () {
    
      var id = $(this).closest("tr").data("id");
      var quantity = $(this).val();
      ProductManager.updatePoduct(id, quantity);

      $cartBadge.text(ProductManager.getTotalQuantity());
      showGrandTotal();
    });

    $(document).on('keypress', "." + classProductQuantity, function(evt){
      if(evt.keyCode == 38 || evt.keyCode == 40){
        return ;
      }
      evt.preventDefault();
    });

    $(document).on('click', "." + classProductRemove, function(){
      var $tr = $(this).closest("tr");
      var id = $tr.data("id");
      $tr.hide(500, function(){
        ProductManager.removeProduct(id);
        drawTable();
        $cartBadge.text(ProductManager.getTotalQuantity());
      });
    });

    $("." + classCheckoutCart).click(function(){
      var products = ProductManager.getAllProducts();
        if (!products.length) {
        $("#" + idEmptyCartMessage).fadeTo('fast', 0.5).fadeTo('fast', 1.0);
        return false;
        }

        var id = '';
        $.each(products, function () {
            id +=  this.id + ',';
        });

        var quantity = '';
        $.each(products, function () {
            quantity += this.quantity + ',';
        });

        $('#Ids').val(id);
        $('#Quantity').val(quantity);
      updateCart();
      options.checkoutCart(ProductManager.getAllProducts(), ProductManager.getTotalPrice(), ProductManager.getTotalQuantity());
      ProductManager.clearProduct();
      $cartBadge.text(ProductManager.getTotalQuantity());
      $("#" + idCartModal).modal("hide");
    });
  }


  var MyCart = function (target, userOptions) {
    /*
    PRIVATE
    */
    var $target = $(target);
    var options = OptionManager.getOptions(userOptions);
    var $cartIcon = $("." + options.classCartIcon);
    var $cartBadge = $("." + options.classCartBadge);

    /*
    EVENT
    */
    $target.click(function(){
     

      var id = $target.data('id');
      var name = $target.data('name');
      var summary = $target.data('summary');
      var price = $target.data('price');
      var quantity = $target.data('quantity');
      var image = $target.data('image');
      var maxQuantity = $target.data('maxquantity');
      ProductManager.setProduct(id, name, summary, price, quantity, image, maxQuantity);
        $cartBadge.text(ProductManager.getTotalQuantity());

        options.clickOnAddToCart($target);
        
    });

  }


  $.fn.myCart = function (userOptions) {
    loadMyCartEvent(userOptions);
    return $.each(this, function () {
      new MyCart(this, userOptions);
    });
  }


})(jQuery);
