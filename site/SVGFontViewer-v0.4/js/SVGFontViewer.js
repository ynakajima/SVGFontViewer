/*!
 * SVGFontViewer v0.4
 * http://svgfontviewer.googlecode.com/
 *
 * Copyright 2010, Yuhta Nakajima<ynakajima@mac.com>
 * Dual licensed under the MIT or GPL Version 2 licenses.
 * http://svgfontviewer.googlecode.com/hg/GPL-LICENSE.txt
 * http://svgfontviewer.googlecode.com/hg/MIT-LICENSE.txt
 *
 * Date: 201008220457
 */

/**
 * EventDispacher
 */
var EventDispacher = function(){};

/**
 * EventDispacher addEventListener
 */
EventDispacher.prototype.addEventListener = function(type, handler) {
	
	if(typeof this.eventList == "undefined") {
		this.eventList = [];	
	}
	
	if(typeof this.eventList[type] == "undefined") {
		this.eventList[type] = [];
	}
	
	this.eventList[type].push(handler);	
	
};

/**
 * EventDispacher removeEventListener
 */
EventDispacher.prototype.removeEventListener = function(type, handler) {

	var handlers = this.eventList[type];
	
	if(hadnlers){
		for(var i=0; i<handlers.length; i++){
			if(handlers[i] == handler) {
				handlers.splice(i,1);
			}
		}
	}

};

/**
 * EventDispacher dispatchEvent
 */
EventDispacher.prototype.dispatchEvent = function(type) {
	
	var handlers = this.eventList[type] || false;
		
	if(handlers) {
		for(var i=0,l=handlers.length; i<l; i++){
			handlers[i]();
		}
	}
};



/**
 * SVGFontViewer
 */
var SVGFontViewer = {};

SVGFontViewer.SVG_NS = "http://www.w3.org/2000/svg";

/**
 * init
 */
SVGFontViewer.init = function(param) {

	//SVGファイルをロード
	var svgLoader = new this.SVGLoader();
	svgLoader.load(param.svgFontPath);
	
	var self = this;
	
	svgLoader.addEventListener(this.SVGLoader.LOADED, function(){
		
		self.svgDocument = svgLoader.content;
		self.svg = document.importNode(self.svgDocument.getElementsByTagName("svg")[0], true);
		self.svg.style.display = "none";
		document.body.appendChild(self.svg);
		
		self.glyphs = self.svg.getElementsByTagName('glyph');

		
		//単グリフビューアー
		self.glyphView = new self.GlyphView({
			parent: "glyph",
			font: self.svg.getElementsByTagName('font')[0],
			guideline: true,
			outline: true
		});
		self.glyph = self.glyphs[2];		
		self.glyphView.display(self.glyph);
		
		
		
		//グリフリスト
		var glyphsEle = document.getElementById("glyphs");
		for(var i=0,l=self.glyphs.length; i<l; i++) {
			
			var glyph = self.glyphs[i];
			
			var li = document.createElement("li");
			var dl = document.createElement("dl");
			var dt = document.createElement("dt");
			var dd = document.createElement("dd");
			
			var glyphName = glyph.getAttribute('unicode')+" ["+glyph.getAttribute('glyph-name')+"]";
			dt.appendChild(document.createTextNode(glyphName));
			
			var glyphView = new self.GlyphView({
				parent: dd,
				font: self.svg.getElementsByTagName('font')[0],
				guideline: false
			});
			glyphView.display(glyph);
			
			li.glyphView = glyphView;
			
			li.addEventListener('click', function(){
				
				var glyph = this.glyphView.glyph;
				self.glyph = glyph;		
				self.glyphView.display(glyph);
				
			}, false)
			
			dl.appendChild(dt);
			dl.appendChild(dd);
			li.appendChild(dl);
			glyphsEle.appendChild(li);
			
		}
			
	});
	
	
	//レイアウト
	onWindowResize();
	
	window.onresize = function(){
		onWindowResize();	
	}
	
	function onWindowResize() {
		//DOMエレメントを取得
		var glyphList = document.getElementById("glyphList");
		var glyphView = document.getElementById("glyphView");
		var glyph  = document.getElementById("glyph");
		var height = window.innerHeight-85;
		
		glyphList.style.height = glyphView.style.height = height+"px";
		glyph.style.height = height-20+"px";
		
	}
};

/**
 * SVGLoader
 */
SVGFontViewer.SVGLoader = function() {
		
};

SVGFontViewer.SVGLoader.prototype = new EventDispacher();

/**
 * event
 */
SVGFontViewer.SVGLoader.LOADED = "loaded";

/**
 * SVGLoader load
 */
SVGFontViewer.SVGLoader.prototype.load = function(url) {
	
	var req = new XMLHttpRequest();
	req.open('GET', url, true);
	
	var self = this;
	
	req.onreadystatechange = function(aEvt){
				
		if (req.readyState == 4) {
			var parser = new DOMParser();
			dom = parser.parseFromString(req.responseText, "text/xml");
			self.content = dom;//document.importNode(dom.getElementsByTagName("svg")[0], true);
			self.dispatchEvent(SVGFontViewer.SVGLoader.LOADED);
						
			if(req.status == 200) {
					 
			} else {
				console.log("Error loading page");
				console.log(req);
				console.log(req.status);

			}
		}
		
	};
	
	req.send(null); 
	
	
};


/**
 * GlyphList
 */
SVGFontViewer.GlyphList = function(font) {
	
	console.log(font);
		
};

SVGFontViewer.GlyphList.prototype = new EventDispacher();


/**
 * GlyphList
 */
SVGFontViewer.GlyphList.prototype.get = function(index) {
		
};


/**
 * GlyphView
 */
SVGFontViewer.GlyphView = function(param) {
		
	this.param = param;
	this.font = param.font;
	this.outline = param.outline;
	this.guideline = param.guideline;
	
	this.fontFase = this.font.getElementsByTagName('font-face')[0];
	this.fontWeight = this.fontFase.getAttribute('font-weight');
	this.fontFamily = this.fontFase.getAttribute('font-family');
	this.bbox = this.fontFase.getAttribute('bbox');
	this.unitsPerEm = this.fontFase.getAttribute('units-per-em') || 1000;
	this.ascent = this.fontFase.getAttribute('ascent');
	this.descent = this.fontFase.getAttribute('descent');
	this.xHeight = this.fontFase.getAttribute('x-height');
	this.capHeight = this.fontFase.getAttribute('cap-height');
	this.horizAdvX = this.fontFase.getAttribute('horiz-adv-x') || this.unitsPerEm;


	var bbox = this.bbox.split(" ");
	this.unit = (Math.abs(bbox[0])+Math.abs(bbox[2]))/this.unitsPerEm;
	
	this.parent = (param.parent instanceof Element)? param.parent : document.getElementById(param.parent);
	this.canvas = document.createElementNS(SVGFontViewer.SVG_NS, 'svg');
	this.canvas.setAttribute("viewBox", this.bbox);
	
	this.g = document.createElementNS(SVGFontViewer.SVG_NS, 'g');
	this.g.setAttribute('transform', 'scale(1,-1) translate(0 '+bbox[1]+')');

	if(this.guideline) {
		//ガイドライン描画
		this.showGuide();
	}
	
	//グリフ表示用pathの作成
	this.path = document.createElementNS(SVGFontViewer.SVG_NS, 'path');
	
	this.g.appendChild(this.path);
	this.canvas.appendChild(this.g);
	this.parent.appendChild(this.canvas);
		
};

SVGFontViewer.GlyphView.prototype = new EventDispacher();

/**
 * GlyphView showGuide
 */
SVGFontViewer.GlyphView.prototype.showGuide = function() {
	
	//ガイドライン
	var bbox = this.bbox.split(" ");
	
	var guidLeft = document.createElementNS(SVGFontViewer.SVG_NS, 'path');
	var guidBaseline = document.createElementNS(SVGFontViewer.SVG_NS, 'path');
	var guidCap = document.createElementNS(SVGFontViewer.SVG_NS, 'path');
	var guidXheight = document.createElementNS(SVGFontViewer.SVG_NS, 'path');
	var guidDescent = document.createElementNS(SVGFontViewer.SVG_NS, 'path');
	var guidAscent = document.createElementNS(SVGFontViewer.SVG_NS, 'path');
	this.guidRight = document.createElementNS(SVGFontViewer.SVG_NS, 'path');
	
	guidLeft.setAttribute("d", "M 0 -2000 L 0 1000");
	guidLeft.setAttribute("stroke", "#f00");
	
	this.guidRight.setAttribute("stroke", "#f00");
	
	guidBaseline.setAttribute("d", "M "+bbox[0]+" 0 L "+bbox[2]+" 0");
	guidBaseline.setAttribute("stroke", "#f00");
	var guidAscentText = document.createElementNS(SVGFontViewer.SVG_NS, 'text');
	guidAscentText.setAttribute("transform", "scale(1 -1)");
	guidAscentText.setAttribute("font-size", 24);
	guidAscentText.setAttribute("x", parseInt(bbox[0])+10);
	guidAscentText.setAttribute("y", 0-5);
	guidAscentText.setAttribute("opacity", ".5");
	guidAscentText.appendChild(document.createTextNode("baseline"));
	
	var capY = parseInt(this.capHeight);
	guidCap.setAttribute("d", "M "+bbox[0]+" "+capY+" L "+bbox[2]+" "+capY);
	guidCap.setAttribute("stroke", "#00f");
	var guidCapText = document.createElementNS(SVGFontViewer.SVG_NS, 'text');
	guidCapText.setAttribute("transform", "scale(1 -1)");
	guidCapText.setAttribute("font-size", 24);
	guidCapText.setAttribute("x", parseInt(bbox[0])+10);
	guidCapText.setAttribute("y", -capY-5);
	guidCapText.setAttribute("opacity", ".5");
	guidCapText.appendChild(document.createTextNode("cap-height"));
		
	var xHeightY = parseInt(this.xHeight);
	guidXheight.setAttribute("d", "M "+bbox[0]+" "+xHeightY+" L "+bbox[2]+" "+xHeightY);
	guidXheight.setAttribute("stroke", "#0f0");
	var xHeightText = document.createElementNS(SVGFontViewer.SVG_NS, 'text');
	xHeightText.setAttribute("transform", "scale(1 -1)");
	xHeightText.setAttribute("font-size", 24);
	xHeightText.setAttribute("x", parseInt(bbox[0])+10);
	xHeightText.setAttribute("y", -xHeightY-5);
	xHeightText.setAttribute("opacity", ".5");
	xHeightText.appendChild(document.createTextNode("x-height"));
			
	var descentY = parseInt(this.descent);
	guidDescent.setAttribute("d", "M "+bbox[0]+" "+descentY+" L "+bbox[2]+" "+descentY);
	guidDescent.setAttribute("stroke", "#000");
	guidDescent.setAttribute("opacity", ".5");
	var descentText = document.createElementNS(SVGFontViewer.SVG_NS, 'text');
	descentText.setAttribute("transform", "scale(1 -1)");
	descentText.setAttribute("font-size", 24);
	descentText.setAttribute("x", parseInt(bbox[0])+10);
	descentText.setAttribute("y", -descentY-5);
	descentText.setAttribute("opacity", ".5");
	descentText.appendChild(document.createTextNode("descent"));

	
	var ascentY = parseInt(this.ascent);
	guidAscent.setAttribute("d", "M "+bbox[0]+" "+ascentY+" L "+bbox[2]+" "+ascentY);
	guidAscent.setAttribute("stroke", "#000");
	guidAscent.setAttribute("opacity", ".5");
	var ascentText = document.createElementNS(SVGFontViewer.SVG_NS, 'text');
	ascentText.setAttribute("transform", "scale(1 -1)");
	ascentText.setAttribute("font-size", 24);
	ascentText.setAttribute("x", parseInt(bbox[0])+10);
	ascentText.setAttribute("y", -ascentY-5);
	ascentText.setAttribute("opacity", ".5");
	ascentText.appendChild(document.createTextNode("ascent"));
	
	this.g.appendChild(guidAscent);
	this.g.appendChild(guidDescent);
	this.g.appendChild(guidXheight);
	this.g.appendChild(guidCap);
	this.g.appendChild(guidLeft);
	this.g.appendChild(guidBaseline);
	this.g.appendChild(this.guidRight);
	
	this.g.appendChild(ascentText);
	this.g.appendChild(descentText);
	this.g.appendChild(xHeightText);
	this.g.appendChild(guidCapText);
	this.g.appendChild(guidAscentText);
	
};

/**
 * GlyphView
 */
SVGFontViewer.GlyphView.prototype.display = function(glyph) {

	this.glyph = glyph.cloneNode(true);
	var d = (this.glyph.getAttribute("d"))? this.glyph.getAttribute("d") : "M 0 0";
	this.path.setAttribute("d", d);
	
	if(this.guideline) {
		//ガイドライン描画
		var rightX = (this.glyph.getAttribute('horiz-adv-x'))? this.glyph.getAttribute('horiz-adv-x') : this.horizAdvX;
 		this.guidRight.setAttribute("d", "M "+rightX+" -2000 L "+rightX+" 1000");
	}
	
	if(this.outline) {
		this.path.setAttribute("fill", "#ddd");
		this.path.setAttribute("fill-opacity", ".5");
		this.path.setAttribute("stroke", "#000");	
	}

};


