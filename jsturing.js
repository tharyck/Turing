var nDebugLevel = 0;

var bFullSpeed = false;

var bIsReset = false;
var sFita = "";
var nTapeOffset = 0;
var nPosicaoCabeca = 0;
var sEstados = "0";
var nPassos = 0;
var nVariante = 0;
var hRunTimer = null;
var aProgram = new Object();
var contador = 0;
Controles( true, true, false, true, false);

var nMaxUndo = 0;
var aUndoList = [];
var nTextareaLines = -1;
var oTextarea;
var bIsDirty = true;
var oNextLineMarker = $("<div class='NextLineMarker'>Next<div class='NextLineMarkerEnd'></div></div>");
var oPrevLineMarker = $("<div class='PrevLineMarker'>Prev<div class='PrevLineMarkerEnd'></div></div>");
var oPrevInstruction = null;

var sPreviousStatusMsg = "";

function Step()
{
	if(contador<=0){
		Controles( false, false, true, true, false);
	}else{
		if( bIsDirty) Compile();
		
		bIsReset = false;
		if( sEstados.substring(0,4).toLowerCase() == "halt" ) {
			Controles( false, false, true, true, true );
			return( false );
		}
	}
	var NovoEstado, NovoSimbolo, nAction, nLinhas;

	var sSimboloDaCabeca = GetTapeSymbol( nPosicaoCabeca );
	
	var aInstructions = GetNextInstructions( sEstados, sSimboloDaCabeca );
	var OInstrucao;
	if( aInstructions.length == 0 ) {
    OInstrucao = null;
	} else if( nVariante == 2 ) {
    OInstrucao = aInstructions[Math.floor(Math.random()*aInstructions.length)];
	} else {
    OInstrucao = aInstructions[0];
	}
	
	if( OInstrucao != null ) {
		NovoEstado = (OInstrucao.newState == "*" ? sEstados : OInstrucao.newState);
		NovoSimbolo = (OInstrucao.newSymbol == "*" ? sSimboloDaCabeca : OInstrucao.newSymbol);
		nAction = (OInstrucao.action.toLowerCase() == "r" ? 1 : (OInstrucao.action.toLowerCase() == "l" ? -1 : 0));
    if( nVariante == 1 && nPosicaoCabeca == 0 && nAction == -1 ) {
      nAction = 0;
    }
		nLinhas = OInstrucao.sourceLineNumber;
	} else {
		debug( 1, "Warning: no instruction found for state '" + sEstados + "' symbol '" + sSimboloDaCabeca + "'; halting" );
		NovoEstado = "halt";
		NovoSimbolo = sSimboloDaCabeca;
		nAction = 0;
		nLinhas = -1;
	}
	
  if( nMaxUndo > 0 ) {
    if( aUndoList.length >= nMaxUndo ) aUndoList.shift();  /* Discard oldest undo entry */
    aUndoList.push({state: sEstados, position: nPosicaoCabeca, symbol: sSimboloDaCabeca});
  }
	
	SetTapeSymbol( nPosicaoCabeca, NovoSimbolo );
	sEstados = NovoEstado;
	nPosicaoCabeca += nAction;
	
	nPassos++;
	nMaxUndo=nPassos+1;
	
	oPrevInstruction = OInstrucao;
	
	debug( 4, "Step() finished. New tape: '" + sFita + "'  new state: '" + sEstados + "'  action: " + nAction + "  line number: " + nLinhas  );
	UpdateInterface();
	
	if( NovoEstado.substring(0,4).toLowerCase() == "halt" ) {
		if( OInstrucao != null ) {
		} 
		Controles( false, false, true, true, true );
		return( false );
	} else {
		if( OInstrucao.breakpoint ) {
			Controles( true, true, true, true, true );
			return( false );
		} else {
			return( true );
		}
	}
}

/* Undo(): undo a single step of the machine */
function Undo()
{
  var oUndoData = aUndoList.pop();
  if( oUndoData ) {
    nPassos--;
    nMaxUndo=nPassos+1;
    sEstados = oUndoData.state;
    nPosicaoCabeca = oUndoData.position;
    SetTapeSymbol( nPosicaoCabeca, oUndoData.symbol );
    oPrevInstruction = null;
    debug( 3, "Passo Anterior. Novo Estado: '" + sEstados + "' position : " + nPosicaoCabeca + " symbol: '" + oUndoData.symbol + "'" );
    Controles( true, true, true, true, true );
    UpdateInterface();
  } else {
    debug( 1, "Warning: Tried to undo with no undo data available!" );
  }
}


/* Run(): run the TM until it halts or until user interrupts it */
function Run()
{
  var bContinue = true;
  if( bFullSpeed ) {
    /* Run 25 steps at a time in fast mode */
    for( var i = 0; bContinue && i < 25; i++ ) {
      bContinue = Step();
    }
    if( bContinue ) hRunTimer = window.setTimeout( Run, 10 );
    else UpdateInterface();   /* Sometimes updates get lost at full speed... */
  } else {
    /* Run a single step every 50ms in slow mode */
    if( Step() ) {
      hRunTimer = window.setTimeout( Run, 50 );
    }
  }
}

/* Reset( ): re-initialise the TM */
function Reset()
{
	var sInitialTape = $("#InitialInput")[0].value;

	/* Find the initial head location, if given */
	nPosicaoCabeca = sInitialTape.indexOf( "*" );
	if( nPosicaoCabeca == -1 ) nPosicaoCabeca = 0;

	/* Initialise tape */
	sInitialTape = sInitialTape.replace( /\*/g, "" ).replace( / /g, "_" );
	if( sInitialTape == "" ) sInitialTape = " ";
	sFita = sInitialTape;
	nTapeOffset = 0;
	
	/* Initialise state */
	var sInitialState = $("#InitialState")[0].value;
	sInitialState = $.trim( sInitialState ).split(/\s+/)[0];
	if( !sInitialState || sInitialState == "" ) sInitialState = "0";
	sEstados = sInitialState;
	
	/* Initialise variant */
  var dropdown = $("#MachineVariant")[0];
  nVariante = Number(dropdown.options[dropdown.selectedIndex].value);
  SetupVariantCSS();
	
	nPassos = 0;
	nMaxUndo=nPassos+1;
	bIsReset = true;
	
	Compile();
	oPrevInstruction = null;
	
	aUndoList = [];
	
	ShowResetMsg(false);
	Controles( true, true, true, true, false );
	UpdateInterface();
}

function createTuringInstructionFromTuple( tuple, line )
{
	return {
		newSymbol: tuple.newSymbol,
		action: tuple.action,
		newState: tuple.newState,
		sourceLineNumber: line,
		breakpoint: tuple.breakpoint
	};
}

function isArray( possiblyArr )
{
	Object.prototype.toString.call(possiblyArr) === "[object Array]";
}

/* Compile(): parse the inputted program and store it in aProgram */
function Compile()
{
	var sSource = oTextarea.value;
	debug( 2, "Compile()" );
	
	/* Clear syntax error messages */
	SetSyntaxMessage( null );
	ClearErrorLines();
	
	/* clear the old program */
	aProgram = new Object;
	
	sSource = sSource.replace( /\r/g, "" );	/* Internet Explorer uses \n\r, other browsers use \n */
	
	var aLines = sSource.split("\n");
	for( var i = 0; i < aLines.length; i++ )
	{
		var OTupla = ParseLine( aLines[i], i );
		if( OTupla.isValid ) {
			debug( 5, " Parsed tuple: '" + OTupla.currentState + "'  '" + OTupla.currentSymbol + "'  '" + OTupla.newSymbol + "'  '" + OTupla.action + "'  '" + OTupla.newState + "'" );
			if( aProgram[OTupla.currentState] == null ) aProgram[OTupla.currentState] = new Object;
			if( aProgram[OTupla.currentState][OTupla.currentSymbol] == null ) {
        aProgram[OTupla.currentState][OTupla.currentSymbol] = [];
			}
			if( aProgram[OTupla.currentState][OTupla.currentSymbol].length > 0 && nVariante != 2 ) {
        debug( 1, "Warning: multiple definitions for state '" + OTupla.currentState + "' symbol '" + OTupla.currentSymbol + "' on lines " + (aProgram[OTupla.currentState][OTupla.currentSymbol][0].sourceLineNumber+1) + " and " + (i+1) );
        SetSyntaxMessage( "Warning: Multiple definitions for state '" + OTupla.currentState + "' symbol '" + OTupla.currentSymbol + "' on lines " + (aProgram[OTupla.currentState][OTupla.currentSymbol][0].sourceLineNumber+1) + " and " + (i+1) );
        SetErrorLine( i );
        SetErrorLine( aProgram[OTupla.currentState][OTupla.currentSymbol][0].sourceLineNumber );
        aProgram[OTupla.currentState][OTupla.currentSymbol][0] = createTuringInstructionFromTuple( OTupla, i );
			} else {
        aProgram[OTupla.currentState][OTupla.currentSymbol].push( createTuringInstructionFromTuple( OTupla, i ) );
      }
		}
		else if( OTupla.error )
		{
			/* Syntax error */
			debug( 2, "Syntax error: " + OTupla.error );
			SetSyntaxMessage( OTupla.error );
			SetErrorLine( i );
		}
	}
	
	oRegExp = new RegExp( ";.*\\$DEBUG: *(.+)" );
	aResult = oRegExp.exec( sSource );
	if( aResult != null && aResult.length >= 2 ) {
		var nNewDebugLevel = parseInt( aResult[1] );
		if( nNewDebugLevel != nDebugLevel ) {
			nDebugLevel = parseInt( aResult[1] );
			debug( 1, "Setting debug level to " + nDebugLevel );
			if( nDebugLevel > 0 ) $(".DebugClass").toggle( true );
		}
	}
	
	/* Lines have changed. Previous line is no longer meaningful, recalculate next line. */
	oPrevInstruction = null;
	
	bIsDirty = false;
	
	UpdateInterface();
}

function ParseLine( sLine, nLineNum )
{
	/* discard anything following ';' */
	debug( 5, "ParseLine( " + sLine + " )" );
	sLine = sLine.split( ";", 1 )[0];

	/* split into tokens - separated by tab or space */
	var aTokens = sLine.split(/\s+/);
	aTokens = aTokens.filter( function (arg) { return( arg != "" ) ;} );

	var OTupla = new Object;
	
	if( aTokens.length == 0 )
	{
		OTupla.isValid = false;
		return( OTupla );
	}
	
	OTupla.currentState = aTokens[0];
	
	if( aTokens.length < 2 ) {
		OTupla.isValid = false;
		OTupla.error = "Syntax error on line " + (nLineNum + 1) + ": missing &lt;current symbol&gt;!" ;
		return( OTupla );
	}
	if( aTokens[1].length > 1 ) {
		OTupla.isValid = false;
		OTupla.error = "Syntax error on line " + (nLineNum + 1) + ": &lt;current symbol&gt; should be a single character!" ;
		return( OTupla );
	}
	OTupla.currentSymbol = aTokens[1];
	
	if( aTokens.length < 3 ) {
		OTupla.isValid = false;
		OTupla.error = "Syntax error on line " + (nLineNum + 1) + ": missing &lt;new symbol&gt;!" ;
		return( OTupla );
	}
	if( aTokens[2].length > 1 ) {
		OTupla.isValid = false;
		OTupla.error = "Syntax error on line " + (nLineNum + 1) + ": &lt;new symbol&gt; should be a single character!" ;
		return( OTupla );
	}
	OTupla.newSymbol = aTokens[2];
	
	if( aTokens.length < 4 ) {
		OTupla.isValid = false;
		OTupla.error = "Syntax error on line " + (nLineNum + 1) + ": missing &lt;direction&gt;!" ;
		return( OTupla );
	}
	if( ["l","r","*"].indexOf( aTokens[3].toLowerCase() ) < 0 ) {
		OTupla.isValid = false;
		OTupla.error = "Syntax error on line " + (nLineNum + 1) + ": &lt;direction&gt; should be 'l', 'r' or '*'!";
		return( OTupla );
	}
	OTupla.action = aTokens[3].toLowerCase();

	if( aTokens.length < 5 ) {
		OTupla.isValid = false;
		OTupla.error = "Syntax error on line " + (nLineNum + 1) + ": missing &lt;new state&gt;!" ;
		return( OTupla );
	}
	OTupla.newState = aTokens[4];
	
	if( aTokens.length > 6 ) {
		OTupla.isValid = false;
		OTupla.error = "Syntax error on line " + (nLineNum + 1) + ": too many entries!" ;
		return( OTupla );
	}
	if( aTokens.length == 6 ) {		/* Anything other than '!' in position 6 is an error */
		if( aTokens[5] == "!" ) {
			OTupla.breakpoint = true;
		} else {
			OTupla.isValid = false;
			OTupla.error = "Syntax error on line " + (nLineNum + 1) + ": too many entries!";
			return( OTupla );
		}
	} else {
		OTupla.breakpoint = false;
	}

	OTupla.isValid = true;
	return( OTupla );
}

// Get all applicable instructions for the given state and symbol.
// Returns an array of instructions, to support non-deterministic machines.
function GetNextInstructions( sEstados, sSimboloDaCabeca )
{
  var result = null;
	if( aProgram[sEstados] != null && aProgram[sEstados][sSimboloDaCabeca] != null ) {
		/* Use instructions specifically corresponding to current state & symbol, if any */
		return( aProgram[sEstados][sSimboloDaCabeca] );
	} else if( aProgram[sEstados] != null && aProgram[sEstados]["*"] != null ) {
		/* Next use rules for the current state and default symbol, if any */
		return( aProgram[sEstados]["*"] );
	} else if( aProgram["*"] != null && aProgram["*"][sSimboloDaCabeca] != null ) {
		/* Next use rules for default state and current symbol, if any */
		return( aProgram["*"][sSimboloDaCabeca] );
	} else if( aProgram["*"] != null && aProgram["*"]["*"] != null ) {
		/* Finally use rules for default state and default symbol */
		return( aProgram["*"]["*"] );
	} else {
    return( [] );
  }
}

/* GetTapeSymbol( n ): returns the symbol at cell n of the TM tape */
function GetTapeSymbol( n )
{
	if( n < nTapeOffset || n >= sFita.length + nTapeOffset ) {
		debug( 4, "GetTapeSymbol( " + n + " ) = '" + c + "'   outside sFita range" );
		return( "_" );
	} else {
		var c = sFita.charAt( n - nTapeOffset );
		if( c == " " ) { c = "_"; debug( 4, "Warning: GetTapeSymbol() got SPACE not _ !" ); }
		debug( 4, "GetTapeSymbol( " + n + " ) = '" + c + "'" );
		return( c );
	}
}


/* SetTapeSymbol( n, c ): writes symbol c to cell n of the TM tape */
function SetTapeSymbol( n, c )
{
	debug( 4, "SetTapeSymbol( " + n + ", " + c + " ); sFita = '" + sFita + "' nTapeOffset = " + nTapeOffset );
	if( c == " " ) { c = "_"; debug( 4, "Warning: SetTapeSymbol() with SPACE not _ !" ); }
	
	if( n < nTapeOffset ) {
		sFita = c + repeat( "_", nTapeOffset - n - 1 ) + sFita;
		nTapeOffset = n;
	} else if( n > nTapeOffset + sFita.length ) {
		sFita = sFita + repeat( "_", nTapeOffset + sFita.length - n - 1 ) + c;
	} else {
		sFita = sFita.substr( 0, n - nTapeOffset ) + c + sFita.substr( n - nTapeOffset + 1 );
	}
}

/* SetSyntaxMessage(): display a syntax error message in the textarea */
function SetSyntaxMessage( msg )
{
	$("#SyntaxMsg").html( (msg?msg:"&nbsp;") )
}

/* RenderTape(): show the tape contents and head position in the MachineTape div */
function RenderTape()
{
	/* calculate the strings:
	  sFirstPart is the portion of the tape to the left of the head
	  sSimboloDaCabeca is the symbol under the head
	  sSecondPart is the portion of the tape to the right of the head
	*/
	var nMovimentacaoPosicaoCabeca = nPosicaoCabeca - nTapeOffset;  /* position of the head relative to sFita */
	var sFirstPart, sSimboloDaCabeca, sSecondPart;
	debug( 4, "RenderTape: translated head pos: " + nMovimentacaoPosicaoCabeca + "  head pos: " + nPosicaoCabeca + "  tape offset: " + nTapeOffset );
	debug( 4, "RenderTape: sFita = '" + sFita + "'" );

	if( nMovimentacaoPosicaoCabeca > 0 ) {
		sFirstPart = sFita.substr( 0, nMovimentacaoPosicaoCabeca );
	} else {
		sFirstPart = "";
	}
	if( nMovimentacaoPosicaoCabeca > sFita.length ) {  /* Need to append blanks to sFirstPart.  Shouldn't happen but just in case. */
		sFirstPart += repeat( " ", nMovimentacaoPosicaoCabeca - sFita.length );
	}
	sFirstPart = sFirstPart.replace( /_/g, " " );
	
	if( nMovimentacaoPosicaoCabeca >= 0 && nMovimentacaoPosicaoCabeca < sFita.length ) {
		sSimboloDaCabeca = sFita.charAt( nMovimentacaoPosicaoCabeca );
	} else {
		sSimboloDaCabeca = " ";	/* Shouldn't happen but just in case */
	}
	sSimboloDaCabeca = sSimboloDaCabeca.replace( /_/g, " " );
	
	if( nMovimentacaoPosicaoCabeca >= 0 && nMovimentacaoPosicaoCabeca < sFita.length - 1 ) {
		sSecondPart = sFita.substr( nMovimentacaoPosicaoCabeca + 1 );
	} else if( nMovimentacaoPosicaoCabeca < 0 ) {  /* Need to prepend blanks to sSecondPart. Shouldn't happen but just in case. */
		sSecondPart = repeat( " ", -nMovimentacaoPosicaoCabeca - 1 ) + sFita;
	} else {  /* nMovimentacaoPosicaoCabeca > sFita.length */
		sSecondPart = "";
	}
	sSecondPart = sSecondPart.replace( /_/g, " " );
	
	debug( 4, "RenderTape: sFirstPart = '" + sFirstPart + "' sSimboloDaCabeca = '" + sSimboloDaCabeca + "'  sSecondPart = '" + sSecondPart + "'" );
	
	$("#LeftTape").text( sFirstPart );
	$("#ActiveTape").text( sSimboloDaCabeca );
	$("#RightTape").text( sSecondPart );
	debug( 4, "RenderTape(): LeftTape = '" + $("#LeftTape").text() + "' ActiveTape = '" + $("#ActiveTape").text() + "' RightTape = '" + $("#RightTape").text() + "'" );
	
	/* Scroll tape display to make sure that head is visible */
	if( $("#ActiveTapeArea").position().left < 0 ) {
		$("#MachineTape").scrollLeft( $("#MachineTape").scrollLeft() + $("#ActiveTapeArea").position().left - 10 );
	} else if( $("#ActiveTapeArea").position().left + $("#ActiveTapeArea").width() > $("#MachineTape").width() ) {
		$("#MachineTape").scrollLeft( $("#MachineTape").scrollLeft() + ($("#ActiveTapeArea").position().left - $("#MachineTape").width()) + 10 );
	}
}

function RenderState()
{
	$("#MachineState").html( sEstados );
}

function RenderSteps()
{
	$("#MachineSteps").html( nPassos );
}

function RenderLineMarkers()
{
  var oNextList = $.map(GetNextInstructions( sEstados, GetTapeSymbol( nPosicaoCabeca ) ), function(x){return(x.sourceLineNumber);} );
	debug( 3, "Rendering line markers: " + (oNextList) + " " + (oPrevInstruction?oPrevInstruction.sourceLineNumber:-1) );
	SetActiveLines( oNextList, (oPrevInstruction?oPrevInstruction.sourceLineNumber:-1) );
}

/* UpdateInterface(): refresh the tape, state and steps displayed on the page */
function UpdateInterface()
{
	RenderTape();
	RenderState();
	RenderSteps();
	RenderLineMarkers();

}

function ClearDebug()
{
	$("#debug").empty();
}

function Controles( bStep, bRun, bReset, bTextarea, bUndo )
{
  document.getElementById( 'StepButton' ).disabled = !bStep;
  document.getElementById( 'RunButton' ).disabled = !bRun;
  document.getElementById( 'ResetButton' ).disabled = !bReset;
  document.getElementById( 'Source' ).disabled = !bTextarea;
  EnableUndoButton(bUndo);

}

function EnableUndoButton(bUndo)
{
  document.getElementById( 'UndoButton' ).disabled = !(bUndo && aUndoList.length > 0);
}

/* Trigger functions for the buttons */

function StepButton()
{
	if(contador>0){
	Step();
	EnableUndoButton(true);
	}else{
		ResetButton();
		contador++;
	}
}

function RunButton()
{
	ResetButton();
	/* Make sure that the step interval is up-to-date */
	Controles( false, false, false, false, false );
	Run();
}

function ResetButton()
{
	contador=0;
	Reset();
	Controles( true, true, false, true, false );
}

function SetupVariantCSS()
{
  if( nVariante == 1 ) {
    $("#LeftTape").addClass( "OneDirectionalTape" );
  } else {
    $("#LeftTape").removeClass( "OneDirectionalTape" );
  }
}

function ShowResetMsg(b)
{
  if( b ) {
    $("#ResetMessage").fadeIn();
    $("#ResetButton").addClass("glow");
  } else {
    $("#ResetMessage").hide();
    $("#ResetButton").removeClass("glow");
  }
}

/* Highlight given lines as the next/previous tuple */
/* next is a list of lines (to support nondeterministic TM), prev is a number */
function SetActiveLines( next, prev )
{
	$(".talinebgnext").removeClass('talinebgnext');
	$(".NextLineMarker").remove();
	$(".talinebgprev").removeClass('talinebgprev');
	$(".PrevLineMarker").remove();
	
  var shift = false;
	for( var i = 0; i < next.length; i++ )
	{
    var oMarker = $("<div class='NextLineMarker'>Next<div class='NextLineMarkerEnd'></div></div>");
    $("#talinebg"+(next[i]+1)).addClass('talinebgnext').prepend(oMarker);
    if( next[i] == prev ) {
      oMarker.addClass('shifted');
      shift = true;
    }
	}
	if( prev >= 0 )
	{
    var oMarker = $("<div class='PrevLineMarker'>Prev<div class='PrevLineMarkerEnd'></div></div>");
    if( shift ) {
      $("#talinebg"+(prev+1)).prepend(oMarker);
      oMarker.addClass('shifted');
    } else {
      $("#talinebg"+(prev+1)).addClass('talinebgprev').prepend(oMarker);
    }
	}
}

/* Highlight given line as an error */
function SetErrorLine( num )
{
	$("#talinebg"+(num+1)).addClass('talinebgerror');
}

/* Clear error highlights from all lines */
function ClearErrorLines()
{
	$(".talinebg").removeClass('talinebgerror');
}

/* OnLoad function for HTML body.  Initialise things when page is loaded. */
function OnLoad()
{
	if( nDebugLevel > 0 ) $(".DebugClass").toggle( true );
	oTextarea = $("#Source")[0];
	TextareaChanged();
	
	VariantChanged(false); /* Set up variant description */
}

function debug( n, str )
{
	if( n <= 0 ) {
		console.log( str );
	}
	if( nDebugLevel >= n  ) {
		$("#debug").append( document.createTextNode( str + "\n" ) );
		console.log( str );
	}
}

