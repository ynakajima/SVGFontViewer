/*!
 * TouchScroller v0.1
 * http://svgfontviewer.googlecode.com/
 *
 * Copyright 2010, Yuhta Nakajima<ynakajima@mac.com>
 * Dual licensed under the MIT or GPL Version 2 licenses.
 * http://svgfontviewer.googlecode.com/hg/GPL-LICENSE.txt
 * http://svgfontviewer.googlecode.com/hg/MIT-LICENSE.txt
 *
 * Date: 201008240132
 */
var TouchScroller = function(target){
		
	var _enable = true;
		
	function setEnable(flg) {
		if(typeof flg != "undefined") {
			_enable = Boolean(flg);
		}
		return _enable;
	};
	
	this.setEnable = function(flg) {
		setEnable(flg);
	}
	
	this.getEnable = function() {
		return setEnable();
	}
	
	this.target = target;
	
	var self = this;
	
	target.addEventListener("touchstart", function(e){ self.handler(e);}, false);
	target.addEventListener("touchmove", function(e){ self.handler(e);}, false); 
	target.addEventListener("touchend", function(e){ self.handler(e);}, false);
	
};

TouchScroller.prototype.on = function() {
	this.setEnable(true);
};

TouchScroller.prototype.off = function() {
	this.setEnable(false);
};

TouchScroller.prototype.isEnable = function() {
	return this.getEnable();
}

TouchScroller.prototype.handler = function(e) {
	
	if(this.isEnable){
		
		var touch = e.touches[0];

		if(e.type == "touchstart") {
			
			this.startY = touch.pageY;
			this.startScrollTop = this.target.scrollTop;
			
		} else if(e.type == "touchmove") {
			
			e.preventDefault();
			var diffX = touch.pageY - this.startY;
			this.target.scrollTop = this.startScrollTop - diffX;
			
		} else if(e.type == "touchend") {
			
		}
		
	}
	
};
