(function ($) {
  $.fn.styleddropdown = function () {
    return this.each(function () {
      var obj = $(this);

      obj.find(".field").click(function () {
        //onclick event, 'list' fadein
        var self = $(this)[0];
        if (!submenuVisibility) {
          obj.find(".list").fadeIn(300);
          submenuVisibility = self.name;
        } else {
          if (submenuVisibility == self.name) {
            obj.find(".list").fadeOut(300);
            submenuVisibility = null;
          } else {
            submenuVisibility = self.name;
          }
        }

        if (self.name == "rooms") {
          obj.find(".list")[0].innerHTML =
            "\
		<li>Rectangular room</li>\
		<li>Square room</li>\
    <li>Wall</li>\
		<li>Recessed room</li>";
        } else if (self.name == "furniture") {
          obj.find(".list")[0].innerHTML =
            '\
        <li onclick="openFurniture(1)">Bedroom</li>\
		<ul id="bedroom" style="display:none">\
		<li>Bed</li>\
		<li>Wardrobe</li>\
		<li>Sideboard</li>\
		</ul>\
        <li onclick="openFurniture(6)">Childroom</li>\
		<ul id="childroom" style="display:none">\
		<li>Child bed</li>\
		<li>Baby bed</li>\
		<li>Shelf double</li>\
		<li>Child desk</li>\
		</ul>\
        <li onclick="openFurniture(2)">Living room</li>\
		<ul id="living-room" style="display:none">\
		<li>Sofa</li>\
		<li>Coffee table</li>\
		<li>Side table</li>\
		<li>Table lamp</li>\
		<li>Relax sofa</li>\
		<li>Armchair</li>\
		<li>TV stand</li>\
		<li>TV</li>\
		</ul>\
        <li onclick="openFurniture(3)">Kitchen</li>\
		<ul id="kitchen" style="display:none">\
		<li>Dining set</li>\
		<li>Dresser</li>\
		<li>Fridge</li>\
		<li>Lower cabinet</li>\
		<li>High coffee table</li>\
		<li>Coffee chair</li>\
		<li>Wash basin</li>\
		<li>Isle cabinet</li>\
		<li>Cooker</li>\
		<li>Vent</li>\
		</ul>\
        <li onclick="openFurniture(4)">Decor</li>\
		<ul id="decor" style="display:none">\
		<li>Picture</li>\
		<li>Car model</li>\
		</ul>\
        <li onclick="openFurniture(5)">Office</li>\
		<ul id="office" style="display:none">\
		<li>Bookcase</li>\
		<li>Bookcase empty</li>\
		<li>PC</li>\
		<li>Angled desk</li>\
		<li>Ikea desk-bookcase</li>\
		<li>Office set</li>\
		</ul>';
        }
        $(document).keyup(function (event) {
          //keypress event, fadeout on 'escape'
          if (event.keyCode == 27) {
            obj.find(".list").fadeOut(300);
            submenuVisibility = false;
          }
        });
        obj.find(".list li").click(function () {
          var toLoad = $(this)[0].innerHTML;
          if (loadModel(toLoad)) {
            obj.find(".list").fadeOut(300);
            submenuVisibility = false;
          }
        });
      });
    });
  };
})(jQuery);
$(function () {
  $(".accordion").styleddropdown();
});
