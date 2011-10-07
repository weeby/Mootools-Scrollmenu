/**
 * Scrollmenu class (shows few elements from list moving them)
 * @author: Krzysztof Wilczek
 * @since: 30.10.2011
 **/
var Scrollmenu = new Class({

	Implements: [Options, Events],

	_element: null, // DOM element for Scrollmenu
	_items: [], // Scrollmenu elements list
	_wrapper: null, // Object wrapper
	_menu: null, // Object menu
	current: null, // Index of current showed list start element

	options: {
		wrapper_css_class: 'scrollmenu',
		list_wrapper_css_class: 'scrollmenu_list_wrapper',
		menu_css_class: 'scrollmenu_menu',
		list_css_class: 'scrollmenu_list',
		width: 300,
		height: 100,
		elements_per_page: 3,
		elements_per_scroll: 2,
		element_width: null
	},

	/**
	 * Object initialization, create wrapper, item list and assign options
	 * @param Object element
	 * @param Object options
	 * @return Scrollmenu
	 */
	initialize: function(element, options)
	{
		if (!element)
		{
			return false;
		}
		this._element = element;
		this.setOptions(options);
		
		this._items = this._element.getChildren();
		this.current = 0;
		
		this._render();
		
		this._setElementsSizes();
		this._setListSizes();

	},
	
	/**
	 * Set sizes to selected element containing list of elements
	 */
	_setListSizes: function()
	{
		var width = this._items.length * this.options.element_width;
		if (!width)
		{
			return false;
		}
		this._element.setStyles({
			'width': width,
			'height': this.options.height
		});
	},
	
	/**
	 * Set standard elements sizes
	 */
	_setElementsSizes: function()
	{
		var self = this;
		
		if (!this.options.element_width)
		{
			this.options.element_width = Math.round(this.options.width / this.options.elements_per_page);	
		}
		
		this._items.each(function(item) {
		
			extra_sizes = item.getLayout();
		
			item.setStyles({
				'width': self.options.element_width - extra_sizes.layout_horizontal,
				'height': self.options.height - extra_sizes.layout_vertical
			});
		});
	},
	
	/**
	 * Move left or right with elements list
	 */
	_setPosition: function(move)
	{
		if (!move)
		{
			return false;
		}
		
		var target_element = null;
		
		// First element show
		if ((this.current + move) < 0)
		{
			target_element = 0;
		}
		// Last elements group show
		else if ((this.current + move + this.options.elements_per_page) > this._items.length)
		{
			target_element = this._items.length - this.options.elements_per_page;
		}
		// Simple move to next group of elements
		else {
			target_element = this.current + move;
		}
		console.log(this.current, target_element);
		this._animateMove(target_element);
	},
	
	/**
	 * Animate movement of elements
	 * @param Int target_element
	 */
	_animateMove: function(target_element) {
		var difference = this.current - target_element;
		if (!difference)
		{
			return false;
		}
		this._element.set('tween', {transition: Fx.Transitions.Elastic.linear});
		this._element.tween('margin-left', parseInt(this._element.getStyle('margin-left'),10) + difference * this.options.element_width);
		
		this.current = target_element;
		this._renderMenu();
	},
	
	/**
	 * Left menu arrow was clicked
	 */
	moveLeft: function(event) {
		this._setPosition(-this.options.elements_per_scroll);
	},
	
	/**
	 * Right menu arrow was clicked
	 */
	moveRight: function(event) {
		this._setPosition(this.options.elements_per_scroll);
	},
	
	/**
	 * Render scroll menu arrow menu
	 */
	_renderMenu: function() {
		// Clear old menu 
		if (this._menu)
		{
			this._menu.dispose();
			this._menu = null;
		}
		
		
		this._menu = new Element('div', {'class': this.options.menu_css_class});
		
		// Create left arrow
		var left_arrow = new Element('div', {'class': 'move_left'});
		if (!this.current)
		{
			left_arrow.addClass('disable');
		}
		else
		{
			left_arrow.addEvent('click', this.moveLeft.bind(this));	
		}
		this._menu.grab(left_arrow);
		
		// Create right arrow
		var right_arrow = new Element('div', {'class': 'move_right'}); 
		if (this.current == this._items.length - this.options.elements_per_page)
		{
			right_arrow.addClass('disable');
		} 
		else 
		{
			right_arrow.addEvent('click', this.moveRight.bind(this));	
		}
		this._menu.grab(right_arrow);
		
		// Add new menu to wrapper 
		this._wrapper.grab(this._menu);
	},
	
	/**
	 * Create layout elements for Scrollmenu
	 */
	_render: function()
	{
		// Render object wrapper
		this._wrapper = new Element('div', {'class': this.options.wrapper_css_class});
		this._wrapper.setStyles({'width': this.options.width, 'height': this.options.height});
		this._wrapper.inject(this._element, 'before');
		
		// Render list wrapper
		this._list_wrapper = new Element('div', {'class': this.options.list_wrapper_css_class});
		this._list_wrapper.setStyles({'width': this.options.width, 'height': this.options.height});
		this._list_wrapper.grab(this._element);
		this._wrapper.grab(this._list_wrapper);
		this._element.addClass(this.options.list_css_class);

		// Render arrow menu
		this._renderMenu();
		
	} 
	
});

/**
 * Standard Mootools Element extension 
 * add new method called: scrollemnu (create new Scrollmenu contains all element DOM childrens)
 * @param Object options  
 * @return Scrollmenu
 */
Element.implement('scrollmenu', function(){

	var options = arguments[0];	

	if (options != null) {
		var scrollmenu = new Scrollmenu(this, options);
		this.store('scrollmenu', scrollmenu);		
	} 
	else 
	{
		var scrollmenu = this.retrieve('scrollmenu');	
		if (scrollmenu != null) {
			return scrollmenu;
		}
	}
	return this;
});

/**
 * Standard Mootools Elements extension
 * add new mathod called getLayout who return layout sizes 
 * @return Object
 */
Element.implement('getLayout', function() {
	
	function getLayoutDimensions(element, type)
	{
	
		if (!element)
		{
			return false;
		}
		if (!(['left', 'top', 'right', 'bottom'].contains(type)))
		{
			return false;
		}
		return parseInt(element.getStyle('padding-'+type), 10) + parseInt(element.getStyle('margin-'+type), 10) + parseInt(element.getStyle('border-'+type+'-width'), 10);
	}
	
	var sizes = {
		'width': parseInt(this.getStyle('width'), 10),
		'height': parseInt(this.getStyle('height'),10),
		'layout_left': getLayoutDimensions(this, 'left'),
		'layout_right': getLayoutDimensions(this, 'right'),
		'layout_top': getLayoutDimensions(this, 'top'),
		'layout_bottom': getLayoutDimensions(this, 'bottom')
	}
	
	sizes.layout_vertical = sizes.layout_top + sizes.layout_bottom;
	sizes.layout_horizontal = sizes.layout_left + sizes.layout_right;
	
	return sizes;
	
});