//
// JavaScript unit
// Add-on for the string and number manipulation
//
// Copyright (c) 2005, 2006, 2007, 2010, 2011 by Ildar Shaimordanov
//

/*

The following code is described in ECMA drafts and
might be implemented in the future of ECMA

*/

if ( ! String.prototype.repeat ) {
/**
 * object.x(number)
 * object.repeat(number)
 * Transform the string object multiplying the string
 *
 * @param	number	Amount of repeating
 * @return	string
 * @access	public
 * @see		http://svn.debugger.ru/repos/jslibs/BrowserExtensions/trunk/ext/string.js
 * @see		http://wiki.ecmascript.org/doku.php?id=harmony:string_extras
 */
String.prototype.repeat = function(n)
{
	n = Math.max(n || 0, 0);
	return new Array(n + 1).join(this.valueOf());
};

}

if ( ! String.prototype.startsWith ) {

/**
 * Returns true if the sequence of characters of searchString converted
 * to a String match the corresponding characters of this object
 * (converted to a String) starting at position. Otherwise returns false.
 *
 * @param	string
 * @param	integer
 * @return	bollean
 * @acess	public
 */
String.prototype.startsWith = function(searchString, position)
{
	position = Math.max(position || 0, 0);
	return this.indexOf(searchString) == position;
};

}

if ( ! String.prototype.endsWith ) {

/**
 * Returns true if the sequence of characters of searchString converted
 * to a String match the corresponding characters of this object
 * (converted to a String) starting at endPosition - length(this).
 * Otherwise returns false.
 *
 * @param	string
 * @param	integer
 * @return	bollean
 * @acess	public
 */
String.prototype.endsWith = function(searchString, endPosition)
{
	endPosition = Math.max(endPosition || 0, 0);
	var s = String(searchString);
	var pos = this.lastIndexOf(s);
	return pos >= 0 && pos == this.length - s.length - endPosition;
};

}

if ( ! String.prototype.contains ) {

/**
 * If searchString appears as a substring of the result of converting
 * this object to a String, at one or more positions that are greater than
 * or equal to position, then return true; otherwise, returns false.
 * If position is undefined, 0 is assumed, so as to search all of the String.
 *
 * @param	string
 * @param	integer
 * @return	bollean
 * @acess	public
 */
String.prototype.contains = function(searchString, position)
{
	position = Math.max(position || 0, 0);
	return this.indexOf(searchString) != -1;
};

}

if ( ! String.prototype.toArray ) {

/**
 * Returns an Array object with elements corresponding to
 * the characters of this object (converted to a String).
 *
 * @param	void
 * @return	array
 * @acess	public
 */
String.prototype.toArray = function()
{
	return this.split('');
};

}

if ( ! String.prototype.reverse ) {


/**
 * Returns an Array object with elements corresponding to
 * the characters of this object (converted to a String) in reverse order.
 *
 * @param	void
 * @return	string
 * @acess	public
 */
String.prototype.reverse = function()
{
	return this.split('').reverse().join('');
};

}

/*

The following ode is not described in ECMA specs or drafts.

*/

/**
 * String.validBrackets(string)
 * Checks string to be valid brackets. Valid brackets are:
 *	quotes	- '' "" `' ``
 *	single	- <> {} [] () %% || // \\
 *	double	- miltiline comments
 *		  /** / C/C++ like (without whitespace)
 *		  <??> PHP like
 *		  <%%> ASP like
 *		  (**) Pascal like
 *
 * @param	string	Brackets (left and right)
 * @return	boolean	Result of validity of brackets
 * @access	static
 */
String.validBrackets = function(br)
{
	if ( ! br ) {
		return false;
	}
	var quot = "''\"\"`'``";
	var sgl = "<>{}[]()%%||//\\\\";
	var dbl = "/**/<??><%%>(**)";
	return (br.length == 2 && (quot + sgl).indexOf(br) != -1)
		|| (br.length == 4 && dbl.indexOf(br) != -1);
};

/**
 * object.bracketize(string)
 * Transform the string object by setting in frame of valid brackets
 *
 * @param	string	Brackets
 * @return	string	Bracketized string
 * @access	public
 */
String.prototype.brace =
String.prototype.bracketize = function(br)
{
	var string = this;
	if ( ! String.validBrackets(br) ) {
		return string;
	}
	var midPos = br.length / 2;
	return br.substr(0, midPos) + string.toString() + br.substr(midPos);
};

/**
 * object.unbracketize(string)
 * Transform the string object removing the leading and trailing brackets
 * If the parameter is not defined the method will try to remove existing valid brackets
 *
 * @param	string	Brackets
 * @return	string	Unbracketized string
 * @access	public
 */
String.prototype.unbrace =
String.prototype.unbracketize = function(br)
{
	var string = this;
	if ( ! br ) {
		var len = string.length;
		for (var i = 2; i >= 1; i--) {
			br = string.substring(0, i) + string.substring(len - i);
			if ( String.validBrackets(br) ) {
				return string.substring(i, len - i);
			}
		}
	}
	if ( ! String.validBrackets(br) ) {
		return string;
	}
	var midPos = br.length / 2;
	var i = string.indexOf(br.substr(0, midPos));
	var j = string.lastIndexOf(br.substr(midPos));
	if (i == 0 && j == string.length - midPos) {
		string = string.substring(i + midPos, j);
	}
	return string;
};

/**
 * object.radix(number, number, string)
 * Transform the number object to string in accordance with a scale of notation
 * If it is necessary the numeric string will aligned to right and filled by '0' character, by default
 *
 * @param	number	Radix of scale of notation (it have to be greater or equal 2 and below or equal 36)
 * @param	number	Width of numeric string
 * @param	string	Padding chacracter (by default, '0')
 * @return	string	Numeric string
 * @access	public
 */
Number.prototype.radix = function(r, n, c)
{
	return this.toString(r).padding(-n, c);
//	return this.toString(r).padding(-Math.abs(n), c);
};

/**
 * object.bin(number, string)
 * Transform the number object to string of binary presentation
 *
 * @param	number	Width of numeric string
 * @param	string	Padding chacracter (by default, '0')
 * @return	string	Numeric string
 * @access	public
 */
Number.prototype.bin = function(n, c)
{
	return this.radix(0x02, n, c);
//	return this.radix(0x02, (n) ? n : 16, c);
};

/**
 * object.oct(number, string)
 * Transform the number object to string of octal presentation
 *
 * @param	number	Width of numeric string
 * @param	string	Padding chacracter (by default, '0')
 * @return	string	Numeric string
 * @access	public
 */
Number.prototype.oct = function(n, c)
{
	return this.radix(0x08, n, c);
//	return this.radix(0x08, (n) ? n : 6, c);
};

/**
 * object.dec(number, string)
 * Transform the number object to string of decimal presentation
 *
 * @param	number	Width of numeric string
 * @param	string	Padding chacracter (by default, '0')
 * @return	string	Numeric string
 * @access	public
 */
Number.prototype.dec = function(n, c)
{
	return this.radix(0x0A, n, c);
};

/**
 * object.hexl(number, string)
 * Transform the number object to string of hexadecimal presentation in lower-case of major characters (0-9 and a-f)
 *
 * @param	number	Width of numeric string
 * @param	string	Padding chacracter (by default, '0')
 * @return	string	Numeric string
 * @access	public
 */
Number.prototype.hexl = function(n, c)
{
	return this.radix(0x10, n, c);
//	return this.radix(0x10, (n) ? n : 4, c);
};

/**
 * object.hex(number, string)
 * Transform the number object to string of the hexadecimal presentation
 * in upper-case of major characters (0-9 and A-F)
 *
 * @param	number	Width of numeric string
 * @param	string	Padding chacracter (by default, '0')
 * @return	string	Numeric string
 * @access	public
 */
Number.prototype.hex = function(n, c)
{
	return this.radix(0x10, n, c).toUpperCase();
};

/**
 * object.human([digits[, true]])
 * Transform the number object to string in human-readable format (e.h., 1k, 234M, 5G)
 *
 * @example
 * var n = 1001;
 *
 * // will output 1.001K
 * var h = n.human(3);
 *
 * // will output 1001.000
 * var H = n.human(3, true);
 *
 * @param	integer	Optional. Number of digits after the decimal point. Must be in the range 0-20, inclusive.
 * @param	boolean	Optional. If true then use powers of 1024 not 1000
 * @return	string	Human-readable string
 * @access	public
 */
Number.prototype.human = function(digits, binary)
{
	var n = Math.abs(this);
	var p = this;
	var s = '';
	var divs = arguments.callee.add(binary);
	for (var i = divs.length - 1; i >= 0; i--) {
		if ( n >= divs[i].d ) {
			p /= divs[i].d;
			s = divs[i].s;
			break;
		}
	}
	return p.toFixed(digits) + s;
};

/**
 * Subsidiary method.
 * Stores suffixes and divisors to use in Number.prototype.human.
 *
 * @param	boolean
 * @param	string
 * @param	divisor
 * @return	array
 * @access	static
 */
Number.prototype.human.add = function(binary, suffix, divisor)
{
	var name = binary ? 'div2' : 'div10';
	var divs = Number.prototype.human[name] = Number.prototype.human[name] || [];

	if ( arguments.length < 3 ) {
		return divs;
	}

	divs.push({s: suffix, d: Math.abs(divisor)});
	divs.sort(function(a, b)
	{
		return a.d - b.d;
	});

	return divs;
};

// Binary prefixes
Number.prototype.human.add(true,  'K', 1 << 10);
Number.prototype.human.add(true,  'M', 1 << 20);
Number.prototype.human.add(true,  'G', 1 << 30);
Number.prototype.human.add(true,  'T', Math.pow(2, 40));

// Decimal prefixes
Number.prototype.human.add(false, 'K', 1e3);
Number.prototype.human.add(false, 'M', 1e6);
Number.prototype.human.add(false, 'G', 1e9);
Number.prototype.human.add(false, 'T', 1e12);

/**
 * object.fromHuman([digits[, binary]])
 * Transform the human-friendly string to the valid numeriv value
 *
 * @example
 * var n = 1001;
 *
 * // will output 1.001K
 * var h = n.human(3);
 *
 * // will output 1001
 * var m = h.fromHuman(h);
 *
 * @param	boolean	Optional. If true then use powers of 1024 not 1000
 * @return	number
 * @access	public
 */
Number.fromHuman = function(value, binary)
{
	var m = String(value).match(/^([\-\+]?\d+\.?\d*)([A-Z])?$/);
	if ( ! m ) {
		return Number.NaN;
	}
	if ( ! m[2] ) {
		return +m[1];
	}
	var divs = Number.prototype.human.add(binary);
	for (var i = 0; i < divs.length; i++) {
		if ( divs[i].s == m[2] ) {
			return m[1] * divs[i].d;
		}
	}
	return Number.NaN;
};

if ( ! String.prototype.trim ) {

/**
 * object.trim()
 * Transform the string object removing leading and trailing whitespaces
 *
 * @return	string
 * @access	public
 */
String.prototype.trim = function()
{
	return this.replace(/(^\s*)|(\s*$)/g, "");
};

}

if ( ! String.prototype.trimLeft ) {

/**
 * object.trimLeft()
 * Transform the string object removing leading whitespaces
 *
 * @return	string
 * @access	public
 */
String.prototype.trimLeft = function()
{
	return this.replace(/(^\s*)/, "");
};

}

if ( ! String.prototype.trimRight ) {

/**
 * object.trimRight()
 * Transform the string object removing trailing whitespaces
 *
 * @return	string
 * @access	public
 */
String.prototype.trimRight = function()
{
	return this.replace(/(\s*$)/g, "");
};

}

/**
 * object.dup()
 * Transform the string object duplicating the string
 *
 * @return	string
 * @access	public
 */
String.prototype.dup = function()
{
	var val = this.valueOf();
	return val + val;
};

/**
 * object.padding(number, string)
 * Transform the string object to string of the actual width filling by the padding character (by default ' ')
 * Negative value of width means left padding, and positive value means right one
 *
 * @param	number	Width of string
 * @param	string	Padding chacracter (by default, ' ')
 * @return	string
 * @access	public
 */
String.prototype.padding = function(n, c)
{
	var val = this.valueOf();
	if ( Math.abs(n) <= val.length ) {
		return val;
	}
	var m = Math.max((Math.abs(n) - this.length) || 0, 0);
	var pad = Array(m + 1).join(String(c || ' ').charAt(0));
//	var pad = String(c || ' ').charAt(0).repeat(Math.abs(n) - this.length);
	return (n < 0) ? pad + val : val + pad;
//	return (n < 0) ? val + pad : pad + val;
};

/**
 * object.padLeft(number, string)
 * Wrapper for object.padding
 * Transform the string object to string of the actual width adding the leading padding character (by default ' ')
 *
 * @param	number	Width of string
 * @param	string	Padding chacracter
 * @return	string
 * @access	public
 */
String.prototype.padLeft = function(n, c)
{
	return this.padding(-Math.abs(n), c);
};

/**
 * object.alignRight(number, string)
 * Wrapper for object.padding
 * Synonym for object.padLeft
 *
 * @param	number	Width of string
 * @param	string	Padding chacracter
 * @return	string
 * @access	public
 */
String.prototype.alignRight = String.prototype.padLeft;

/**
 * object.padRight(number, string)
 * Wrapper for object.padding
 * Transform the string object to string of the actual width adding the trailing padding character (by default ' ')
 *
 * @param	number	Width of string
 * @param	string	Padding chacracter
 * @return	string
 * @access	public
 */
String.prototype.padRight = function(n, c)
{
	return this.padding(Math.abs(n), c);
};

/**
 * Formats arguments accordingly the formatting string.
 * Each occurence of the "{\d+}" substring refers to
 * the appropriate argument.
 *
 * @example
 * '{0}is not {1} + {2}'.format('JavaScript', 'Java', 'Script');
 *
 * @param	mixed
 * @return	string
 * @access	public
 */
String.prototype.format = function()
{
	var args = arguments;
	return this.replace(/\{(\d+)\}/g, function($0, $1)
	{
		return args[$1] !== void 0 ? args[$1] : $0;
	});
};

/**
 * object.alignLeft(number, string)
 * Wrapper for object.padding
 * Synonym for object.padRight
 *
 * @param	number	Width of string
 * @param	string	Padding chacracter
 * @return	string
 * @access	public
 */
String.prototype.alignLeft = String.prototype.padRight;

/**
 * sprintf(format, argument_list)
 *
 * The string function like one in C/C++, PHP, Perl
 * Each conversion specification is defined as below:
 *
 * %[index][alignment][padding][width][precision]type
 *
 * index	An optional index specifier that changes the order of the
 *		arguments in the list to be displayed.
 * alignment	An optional alignment specifier that says if the result should be
 *		left-justified or right-justified. The default is
 *		right-justified; a "-" character here will make it left-justified.
 * padding	An optional padding specifier that says what character will be
 *		used for padding the results to the right string size. This may
 *		be a space character or a "0" (zero character). The default is to
 *		pad with spaces. An alternate padding character can be specified
 *		by prefixing it with a single quote ('). See the examples below.
 * width	An optional number, a width specifier that says how many
 *		characters (minimum) this conversion should result in.
 * precision	An optional precision specifier that says how many decimal digits
 *		should be displayed for floating-point numbers. This option has
 *		no effect for other types than float.
 * type		A type specifier that says what type the argument data should be
 *		treated as. Possible types:
 *
 * % - a literal percent character. No argument is required.
 * b - the argument is treated as an integer, and presented as a binary number.
 * c - the argument is treated as an integer, and presented as the character
 *	with that ASCII value.
 * d - the argument is treated as an integer, and presented as a decimal number.
 * u - the same as "d".
 * f - the argument is treated as a float, and presented as a floating-point.
 * o - the argument is treated as an integer, and presented as an octal number.
 * s - the argument is treated as and presented as a string.
 * x - the argument is treated as an integer and presented as a hexadecimal
 *	 number (with lowercase letters).
 * X - the argument is treated as an integer and presented as a hexadecimal
 *	 number (with uppercase letters).
 * h - the argument is treated as an integer and presented in human-readable format
 *	 using powers of 1024.
 * H - the argument is treated as an integer and presented in human-readable format
 *	 using powers of 1000.
 */
String.prototype.sprintf = function()
{
	var args = arguments;
	var index = 0;

	var x;
	var ins;
	var fn;

	/*
	 * The callback function accepts the following properties
	 *	x.index contains the substring position found at the origin string
	 *	x[0] contains the found substring
	 *	x[1] contains the index specifier (as \d+\$ or \d+#)
	 *	x[2] contains the alignment specifier ("+" or "-" or empty)
	 *	x[3] contains the padding specifier (space char, "0" or defined as '.)
	 *	x[4] contains the width specifier (as \d*)
	 *	x[5] contains the floating-point precision specifier (as \.\d*)
	 *	x[6] contains the type specifier (as [bcdfosuxX])
	 */
	return this.replace(String.prototype.sprintf.re, function()
	{
		if ( arguments[0] == "%%" ) {
			return "%";
		}

		x = [];
		for (var i = 0; i < arguments.length; i++) {
			x[i] = arguments[i] || '';
		}
		x[3] = x[3].slice(-1) || ' ';

		ins = args[+x[1] ? x[1] - 1 : index++];
//		index++;

		return String.prototype.sprintf[x[6]](ins, x);
	});
};

String.prototype.sprintf.re = /%%|%(?:(\d+)[\$#])?([+-])?('.|0| )?(\d*)(?:\.(\d+))?([bcdfosuxXhH])/g;

String.prototype.sprintf.b = function(ins, x)
{
	return Number(ins).bin(x[2] + x[4], x[3]);
};
String.prototype.sprintf.c = function(ins, x)
{
	return String.fromCharCode(ins).padding(x[2] + x[4], x[3]);
};
String.prototype.sprintf.d =
String.prototype.sprintf.u = function(ins, x)
{
	return Number(ins).dec(x[2] + x[4], x[3]);
};
String.prototype.sprintf.f = function(ins, x)
{
	var ins = Number(ins);
//	var fn = String.prototype.padding;
	if (x[5]) {
		ins = ins.toFixed(x[5]);
	} else if (x[4]) {
		ins = ins.toExponential(x[4]);
	} else {
		ins = ins.toExponential();
	}
	// Invert sign because this is not number but string
	x[2] = x[2] == "-" ? "+" : "-";
	return ins.padding(x[2] + x[4], x[3]);
//	return fn.call(ins, x[2] + x[4], x[3]);
};
String.prototype.sprintf.o = function(ins, x)
{
	return Number(ins).oct(x[2] + x[4], x[3]);
};
String.prototype.sprintf.s = function(ins, x)
{
	return String(ins).padding(x[2] + x[4], x[3]);
};
String.prototype.sprintf.x = function(ins, x)
{
	return Number(ins).hexl(x[2] + x[4], x[3]);
};
String.prototype.sprintf.X = function(ins, x)
{
	return Number(ins).hex(x[2] + x[4], x[3]);
};
String.prototype.sprintf.h = function(ins, x)
{
	var ins = String.prototype.replace.call(ins, /,/g, '');
	// Invert sign because this is not number but string
	x[2] = x[2] == "-" ? "+" : "-";
	return Number(ins).human(x[5], true).padding(x[2] + x[4], x[3]);
};
String.prototype.sprintf.H = function(ins, x)
{
	var ins = String.prototype.replace.call(ins, /,/g, '');
	// Invert sign because this is not number but string
	x[2] = x[2] == "-" ? "+" : "-";
	return Number(ins).human(x[5], false).padding(x[2] + x[4], x[3]);
};

/**
 * compile()
 *
 * This string function compiles the formatting string to the internal function
 * to acelerate an execution a formatting within loops.
 *
 * @example
 * // Standard usage of the sprintf method
 * var s = '';
 * for (var p in obj) {
 *     s += '%s = %s'.sprintf(p, obj[p]);
 * }
 *
 * // The more speed usage of the sprintf method
 * var sprintf = '%s = %s'.compile();
 * var s = '';
 * for (var p in obj) {
 *     s += sprintf(p, obj[p]);
 * }
 *
 * @see		String.prototype.sprintf()
 */
String.prototype.compile = function()
{
	var args = arguments;
	var index = 0;

	var x;
	var ins;
	var fn;

	/*
	 * The callback function accepts the following properties
	 *	x.index contains the substring position found at the origin string
	 *	x[0] contains the found substring
	 *	x[1] contains the index specifier (as \d+\$ or \d+#)
	 *	x[2] contains the alignment specifier ("+" or "-" or empty)
	 *	x[3] contains the padding specifier (space char, "0" or defined as '.)
	 *	x[4] contains the width specifier (as \d*)
	 *	x[5] contains the floating-point precision specifier (as \.\d*)
	 *	x[6] contains the type specifier (as [bcdfosuxX])
	 */
	var result = this.replace(/(\\|")/g, '\\$1').replace(String.prototype.sprintf.re, function()
	{
		if ( arguments[0] == "%%" ) {
			return "%";
		}

		arguments.length = 7;
		x = [];
		for (var i = 0; i < arguments.length; i++) {
			x[i] = arguments[i] || '';
		}
		x[3] = x[3].slice(-1) || ' ';

		ins = x[1] ? x[1] - 1 : index++;
//		index++;

		return '", String.prototype.sprintf.' + x[6] + '(arguments[' + ins + '], ["' + x.join('", "') + '"]), "';
	});

	return Function('', 'return ["' + result + '"].join("")');
};

/**
 * Considers the string object as URL and returns it's parts separately
 *
 * @param	void
 * @return	Object
 * @access	public
 */
String.prototype.parseUrl = function()
{
	var matches = this.match(arguments.callee.re);

	if ( ! matches ) {
		return null;
	}

	var result = {
		'scheme': matches[1] || '',
		'subscheme': matches[2] || '',
		'user': matches[3] || '',
		'pass': matches[4] || '',
		'host': matches[5],
		'port': matches[6] || '',
		'path': matches[7] || '',
		'query': matches[8] || '',
		'fragment': matches[9] || ''};

	return result;
};

String.prototype.parseUrl.re = /^(?:([a-z]+):(?:([a-z]*):)?\/\/)?(?:([^:@]*)(?::([^:@]*))?@)?((?:[a-z0-9_-]+\.)+[a-z]{2,}|localhost|(?:(?:[01]?\d\d?|2[0-4]\d|25[0-5])\.){3}(?:(?:[01]?\d\d?|2[0-4]\d|25[0-5])))(?::(\d+))?(?:([^:\?\#]+))?(?:\?([^\#]+))?(?:\#([^\s]+))?$/i;

String.prototype.camelize = function()
{
	return this.replace(/([^-]+)|(?:-(.)([^-]+))/mg, function($0, $1, $2, $3)
	{
		return ($2 || '').toUpperCase() + ($3 || $1).toLowerCase();
	});
};

String.prototype.uncamelize = function()
{
	return this
		.replace(/[A-Z]/g, function($0)
		{
			return '-' + $0.toLowerCase();
		});
};
