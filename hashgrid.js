/**
 * Overlay tool (jQuery version)
 * http://github.com/dotjay/hashgrid
 * Version 1, 21 Dec 2009
 * By Jon Gibbins, accessibility.co.uk
 *
 * Ported to work with Mootools by Mark Story (http://mark-story.com)
 */
window.addEvent('domready', function () {
	var grid = new GridOverlay('grid');
})

var GridOverlay = new Class({
	Implements: Options,

	options : {
		cookiePrefix: 'gridOverlay'
	},
	overlay: null,
	visible: false,
	sticky: false,
	originalZIndex: null,

	initialize: function (id, options) {
		this.setOptions(options || {});
		var overlayEl = new Element('div', {
			id: id,
			styles: {display: 'none'}
		});

		//remove the existing element if any and append to the DOM
		if (document.id(id)) document.id(id).destroy();
		document.id(document.body).adopt(overlayEl);
		this.overlay = document.id(id);

		//set the z-index
		var zIndex = this.originalZIndex = this.overlay.getStyle('zIndex');
		if (zIndex == 'auto') {
			this.originalZIndex = '-1';
			this.overlay.setStyle('zIndex', '-1');
		}
		this.generateGrid();
		this.checkCookie();
		this.bindEvents();
	},

	generateGrid: function () {
		// Override the default overlay height with the actual page height
		var pageHeight = document.id(document).getScrollSize().y;
		this.overlay.set('height', pageHeight);

		// Add the first grid line so that we can measure it
		this.overlay.adopt(new Element('div', {'class': 'horiz first-line'}));

		// Calculate the number of grid lines needed
		var gridLines = this.overlay.getChildren('.horiz'),
			gridLineHeight = gridLines[0].getStyle('height').toFloat() + gridLines[0].getStyle('borderBottomWidth').toFloat(),
			numGridLines = Math.floor(pageHeight / gridLineHeight),
			i = numGridLines - 1;

		// Add the remaining grid lines
		while (i--) {
			this.overlay.adopt(new Element('div', {'class': 'horiz'}));
		}
	},

	checkCookie: function () {
		this.Cookie = new Cookie(this.options.cookiePrefix + this.overlay.get('id'));
		if (this.Cookie.read()) {
			this.visible = true;
			this.sticky = true;
			this.overlay.setStyle('display', 'block');
		}
	},
	
	bindEvents: function () {
		var self = this;
		document.addEvent('keydown', function (event) {
			if (self.visible) {
				// alt+b toggles front/back for overlay
				if (event.alt && event.key == 'b') {
					if (self.overlay.getStyle('zIndex') == 9999) {
						self.overlay.setStyle('zIndex', self.originalZIndex);
					} else {
						self.overlay.setStyle('zIndex', 9999);
					}
				}
				// alt+g+enter makes the grid stick.
				if (event.alt && event.key == 'enter') {
					self.sticky = true;
					self.Cookie.write(1);
				} else if (self.sticky && event.alt && event.key == 'g') {
					self.overlay.setStyle('display', 'none');
					self.visible = self.sticky = false;
					self.Cookie.dispose()
				}
			} else {
				//alt+g shows the grid
				if (event.alt && event.key == 'g') {
					self.overlay.setStyle('display', 'block');
					self.visible = true;
				}
			}
		});

		// Hide the overlay on alt+g
		document.addEvent('keyup', function (event) {
			if (!self.sticky && event.alt && event.key == 'g') {
				self.overlay.setStyle('display', 'none');
				self.visible =  false;
			}
		});
	}
});
