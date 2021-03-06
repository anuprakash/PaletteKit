
var width = 15;
var height = 15;
var blockModel = new BlockModel( $( '#root' ), width, height );
var selectedBlock = blockModel.centerBlock();
var shadowMagnetColor = null;
var highlightMagnetColor = null;
var pasteboardColor = null;


function selectBlock( block )
{
	if( selectedBlock )
		selectedBlock.element.removeClass( 'selected' );

	selectedBlock = block;

	if( selectedBlock )
	{
		selectedBlock.element.addClass( 'selected' );
		picker.ColorPickerSetColor( selectedBlock.color.toHexString() );
	}
}

var picker = $( '#picker' ).ColorPicker
({
	flat: true,
	onChange: function( hsb, hex, rgb )
	{
		if( selectedBlock )
			selectedBlock.setColor( '#' + hex );
	}
});
picker.ColorPickerSetColor( '#f33930' );


$( document ).ready( function()
{
	selectBlock( selectedBlock );
	$( '#root' ).delegate( 'div', 'click', function()
	{
		if( selectedBlock )
			selectedBlock.element.removeClass( 'selected' );

		selectBlock( $( this ).data().block );
	});
});



// ##### ##### ##### ##### #####
// ## popup menu
// ##### ##### ##### ##### #####
$( document ).bind( 'contextmenu', function( e )
{
	e.preventDefault();
	showPopupMenu();
});

$( '#popupMenu' ).delegate( 'a', 'click', function()
{
	if( !selectedBlock )
		return;

	var method = $( this ).data( 'method' );
	switch( method )
	{
		case 'lighten':
		case 'brighten':
		case 'darken':
		case 'saturate':
		case 'desaturate':
		case 'spin':
			selectedBlock.setColor( selectedBlock.getColor()[method]( 10 ) );
			selectBlock( selectedBlock );
		break;

		case 'complement': // 1
			blockModel.addColorsNearBlock( selectedBlock, [selectedBlock.getColor().complement()] );
		break;
		case 'tetrad': // 4
			blockModel.addColorsNearBlock( selectedBlock, selectedBlock.getColor().tetrad() );
		break;
		case 'triad': // 3
			blockModel.addColorsNearBlock( selectedBlock, selectedBlock.getColor().triad() );
		break;
		case 'analogous': // 6
			blockModel.addColorsNearBlock( selectedBlock, selectedBlock.getColor().analogous() );
		break;
		case 'monochromatic': // 6
		{
			var colors = selectedBlock.getColor().monochromatic();
			colors.shift();
			colors.reverse();
			blockModel.addColorsNearBlock( selectedBlock, colors );
		}
		break;
		case 'splitcomplement': // 3
			blockModel.addColorsNearBlock( selectedBlock, selectedBlock.getColor().splitcomplement() );
		break;
	}

	hidePopupMenu();
});

function showPopupMenu()
{
	var root = $( '#root' );
	var menu = $( '#popupMenu' );

	var left = root.width() * 0.5 - menu.width() * 0.5;
	var top = root.height() * 0.5 - menu.height() * 0.5;

	menu.css( 'left', left );
	menu.css( 'top', top );
	menu.fadeIn( 100 );
	$.blockUI({ message: null });
	$( '.blockOverlay' ).attr( 'title','Click to close' ).click( hidePopupMenu );
}


function hidePopupMenu()
{
	$.unblockUI();
	$( '#popupMenu' ).fadeOut( 100 );
}


// ##### ##### ##### ##### #####
// ## help
// ##### ##### ##### ##### #####

$( '#help' ).bind( 'click', hideHelp );
function showHelp()
{
	$( '#help' ).fadeIn( 100 );
	$.blockUI({ message: null });
	$( '.blockOverlay' ).attr( 'title','Click to close' ).click( hideHelp );
}

function hideHelp()
{
	$.unblockUI();
	$( '#help' ).fadeOut( 100 );
}



// ##### ##### ##### ##### #####
// ## keyboard shortcuts
// ##### ##### ##### ##### #####

$( document ).keydown( function( e )
{
	if( !selectedBlock )
		return;

	var block = selectedBlock;
	var forceUpdateBlock = false;
    switch( e.which )
	{
        case 37: // left
			block = blockModel.tryShadow( selectedBlock );
        break;

        case 38: // up
			blockModel.tryFillVertical( selectedBlock, 1 );
        break;

        case 39: // right
			block = blockModel.tryHighlight( selectedBlock );
        break;

        case 40: // down
			blockModel.tryFillVertical( selectedBlock, -1 );
        break;

		case 27: // escape
			block = null;
		break

		case 191: // question mark
			showHelp();
		break;

		case 84: // t
			showPopupMenu();
		break;

		case 8: // delete
			if( selectedBlock )
			{
				selectedBlock.clearColor();
				forceUpdateBlock = true;
			}
		break

		case 76: // l
			if( selectedBlock )
			{
				selectedBlock.setColor( selectedBlock.getColor().lighten() );
				forceUpdateBlock = true;
			}
		break;

		case 68: // d
			if( selectedBlock )
			{
				selectedBlock.setColor( selectedBlock.getColor().darken() );
				forceUpdateBlock = true;
			}
		break;

		case 66: // b
			if( selectedBlock )
			{
				selectedBlock.setColor( selectedBlock.getColor().brighten() );
				forceUpdateBlock = true;
			}
		break;

		case 83: // s
			if( selectedBlock )
			{
				selectedBlock.setColor( selectedBlock.getColor().saturate() );
				forceUpdateBlock = true;
			}
		break;

		case 69: // e
			if( selectedBlock )
			{
				selectedBlock.setColor( selectedBlock.getColor().desaturate() );
				forceUpdateBlock = true;
			}
		break;

		case 72: // h
			if( selectedBlock )
			{
				selectedBlock.setColor( selectedBlock.getColor().spin( 10 ) );
				forceUpdateBlock = true;
			}
		break;
		
		case 67: // c
			if( selectedBlock )
				pasteboardColor = selectedBlock.getColor();
		break;
	
		case 86: // v
			if( selectedBlock && pasteboardColor )
			{
				selectedBlock.setColor( pasteboardColor );
				forceUpdateBlock = true;
			}
		break;
					  
		case 81: // q
		{
			if( typeof( quark ) == 'undefined' )
				return;

			quark.showMenu
			({
				items: [
					{ label: "Cancel", click: function() {} },
					{ label: "Pin", click: function() { quark.pin(); } },
					{ label: "Unpin", click: function() { quark.unpin(); } },
					{ label: 'Save pal File', click: function() { generatePalFile() } },
					{ type: "separator"},
					{ label: "Quit", click: function() { quark.quit(); } }
				],
				x: 160,
				y: 130
			});
		}
		break;

        default:
			//console.log(e.which)
			return; // exit this handler for other keys
    }
    e.preventDefault(); // prevent the default action (scroll / move caret)

	if( forceUpdateBlock || block != selectedBlock )
	{
		selectBlock( block );
	}
});



// ##### ##### ##### ##### #####
// ## button handlers and options color pickers
// ##### ##### ##### ##### #####

$( document ).ready( function()
{
	$( '#clearPaletteBtn' ).bind( 'click', function()
	{
		blockModel.clear();
	});

	$( '#optionsBtn' ).bind( 'click', function()
	{
		var showOptions = $( '#optionsBtn' ).html().substring( 0, 1 ) == 'S';
		$( '#options' ).css( 'display', showOptions ? 'block' : 'none' );
		$( '#picker' ).css( 'display', showOptions ? 'none' : 'block' );
		$( '#optionsBtn' ).html( showOptions ? 'Hide Options' : 'Show Options' );
	});

	var colorChangeHandler = {
		bgColorChanged: function( hsb, hex, rgb )
		{
			$( '#bgColorSelector div' ).css( 'backgroundColor', '#' + hex );
			blockModel.setBackgroundColor( hex );
		},
		shadowColorChanged: function( hsb, hex, rgb )
		{
			$( '#shadowColorSelector div' ).css( 'backgroundColor', '#' + hex );
			shadowMagnetColor = tinycolor( hex );
		},
		highlightColorChanged: function( hsb, hex, rgb )
		{
			$( '#highlightColorSelector div' ).css( 'backgroundColor', '#' + hex );
			highlightMagnetColor = tinycolor( hex );
		}
	}

	setupColorPicker( '#bgColorSelector', '#111111', colorChangeHandler.bgColorChanged );
	setupColorPicker( '#shadowColorSelector', '#1f2cb8', colorChangeHandler.shadowColorChanged );
	setupColorPicker( '#highlightColorSelector', '#f0d030', colorChangeHandler.highlightColorChanged );

	function setupColorPicker( sel, color, onChange )
	{
		onChange( 0, color.substring( 1 ), 0 );
		$( sel ).ColorPicker
		({
			color: color,
			onShow: function( colpkr )
			{
				$( colpkr ).fadeIn( 100 );
				return false;
			},
			onHide: function( colpkr )
			{
				$( colpkr ).fadeOut( 100 );
				return false;
			},
			onChange: onChange
		});
	}
});



// ##### ##### ##### ##### #####
// ## palette file downloads
// ##### ##### ##### ##### #####

function generatePalFile()
{
	var colors = blockModel.getColorsInJascFormat();
	var data = 'JASC-PAL\r\n0100\r\n' + colors.length + '\r\n';
	data += colors.join( '\r\n' );
	
	if( typeof( quark ) != 'undefined' )
		quark.saveStringToFile( data, 'palette.pal' );
	else
		download( 'palette.pal', data );
}

function download( filename, text )
{
    var pom = document.createElement('a');
    pom.setAttribute( 'href', 'data:text/plain;charset=utf-8,' + encodeURIComponent( text ) );
    pom.setAttribute( 'download', filename );
	
    if( document.createEvent )
	{
        var event = document.createEvent( 'MouseEvents' );
        event.initEvent( 'click', true, true );
        pom.dispatchEvent( event );
    }
    else
	{
        pom.click();
    }
}
