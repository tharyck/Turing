var nDebugLevel = 0;
var sFita = "";
var nTapeOffset = 0;
var nPosicaoCabeca = 0;
var sEstados = "0";
var nPassos = 0;//numero de passos dados
var aProgram = new Object();
var contador = 0;//contador para o passo a passo
Controles( true, true, false, true, false);//Habilita e desabilita botoes de controle
var nMaxUndo = 0;//quantidade de Passos que podem ser voltados
var aUndoList = [];
var nTextareaLines = -1;
var oTextarea;
var bIsDirty = true;
var oNextLineMarker = $("<div class='NextLineMarker'>Next<div class='NextLineMarkerEnd'></div></div>");
var oPrevLineMarker = $("<div class='PrevLineMarker'>Prev<div class='PrevLineMarkerEnd'></div></div>");
var oPrevInstruction = null;

function Step()//Passos da maquina
{
	//se nao houver movimento na maquina o painel fica parcialmente desabilitado
	if(contador<=0){
		Controles( false, false, true, true, false);
	}else{
		if( bIsDirty) Compile();
		
		if( sEstados.substring(0,4).toLowerCase() == "halt" ) {
			Controles( false, false, true, true, true );
			return( false );
		}
	}

	var NovoEstado, NovoSimbolo, nAcoes, nLinhas;//cria novo estado, simbolo, acoes e linhas
	var sSimboloDaCabeca = GetTapeSymbol( nPosicaoCabeca );	//marca posicao da cabeca
	var aInstructions = GetNextInstructions( sEstados, sSimboloDaCabeca );
	var OInstrucao;
	
	if( aInstructions.length == 0 ) {
    OInstrucao = null;
	} else {
    OInstrucao = aInstructions[0];
	}
	
	if( OInstrucao != null ) {
		NovoEstado = (OInstrucao.newState == "*" ? sEstados : OInstrucao.newState);
		NovoSimbolo = (OInstrucao.newSymbol == "*" ? sSimboloDaCabeca : OInstrucao.newSymbol);
		nAcoes = (OInstrucao.action.toLowerCase() == "r" ? 1 : (OInstrucao.action.toLowerCase() == "l" ? -1 : 0));
    if(nPosicaoCabeca == 0 && nAcoes == -1 ) {
      nAcoes = 0;
    }
		nLinhas = OInstrucao.sourceLineNumber;

	} else {
		NovoEstado = "halt";
		NovoSimbolo = sSimboloDaCabeca;
		nAcoes = 0;
		nLinhas = -1;
	}
	
  if( nMaxUndo > 0 ) {
    if( aUndoList.length >= nMaxUndo ) aUndoList.shift();
    aUndoList.push({state: sEstados, position: nPosicaoCabeca, symbol: sSimboloDaCabeca});
  }
	
	SetTapeSymbol( nPosicaoCabeca, NovoSimbolo );
	sEstados = NovoEstado;
	nPosicaoCabeca += nAcoes;
	
	nPassos++;
	nMaxUndo=nPassos+1;
	
	oPrevInstruction = OInstrucao;
	
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


function Undo()//volta um passo na execucao
{

  var oUndoData = aUndoList.pop();
  if( oUndoData ) {
  	//remove um passo
    nPassos--;
    //deixa a quantidade de passos aserem voltados permitidos iguais a quantidade de passos existentes
    nMaxUndo=nPassos+1;

    sEstados = oUndoData.state;
    nPosicaoCabeca = oUndoData.position;
    SetTapeSymbol( nPosicaoCabeca, oUndoData.symbol );
    oPrevInstruction = null;
    Controles( true, true, true, true, true );
    UpdateInterface();
  }
}

function Executar()//inicia a maquina de maneira continua;
{    if( Step() ) {
      window.setTimeout( Executar, 50 );
    }
  }

function Reiniciar()//reseta a maquina
{
	var sInitialTape = $("#InitialInput")[0].value;

	nPosicaoCabeca = sInitialTape.indexOf( "*" );
	if( nPosicaoCabeca == -1 ) nPosicaoCabeca = 0;

	sInitialTape = sInitialTape.replace( /\*/g, "" ).replace( / /g, "_" );
	if( sInitialTape == "" ) sInitialTape = " ";
	sFita = sInitialTape;
	nTapeOffset = 0;
	
	var sInitialState = $("#InitialState")[0].value;
	sInitialState = $.trim( sInitialState ).split(/\s+/)[0];
	if( !sInitialState || sInitialState == "" ) sInitialState = "0";
	sEstados = sInitialState;
	
	nPassos = 0;
	nMaxUndo=nPassos+1;
	
	Compile();
	oPrevInstruction = null;
	
	aUndoList = [];
	
	ShowResetMsg(false);
	Controles( true, true, true, true, false );
	UpdateInterface();
}

function transformarEmTupla( tuple, line )
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

function Compile()
{
	var sSource = oTextarea.value;
	SetSyntaxMessage( null );
	ClearErrorLines();
	
	aProgram = new Object;
	
	sSource = sSource.replace( /\r/g, "" );
	
	var aLines = sSource.split("\n");
	for( var i = 0; i < aLines.length; i++ ){
		var OTupla = AnalizaLinha( aLines[i], i );
		if( OTupla.isValid ) {
			if( aProgram[OTupla.currentState] == null ) aProgram[OTupla.currentState] = new Object;
			if( aProgram[OTupla.currentState][OTupla.currentSymbol] == null ) {
        aProgram[OTupla.currentState][OTupla.currentSymbol] = [];
			}
			if( aProgram[OTupla.currentState][OTupla.currentSymbol].length > 0 ) {
        SetSyntaxMessage( "Warning: Multiple definitions for state '" + OTupla.currentState + "' symbol '" + OTupla.currentSymbol + "' on lines " + (aProgram[OTupla.currentState][OTupla.currentSymbol][0].sourceLineNumber+1) + " and " + (i+1) );
        SetErrorLine( i );
        SetErrorLine( aProgram[OTupla.currentState][OTupla.currentSymbol][0].sourceLineNumber );
        aProgram[OTupla.currentState][OTupla.currentSymbol][0] = transformarEmTupla( OTupla, i );
			} else {
        aProgram[OTupla.currentState][OTupla.currentSymbol].push( transformarEmTupla( OTupla, i ) );
      }
		}
		else if( OTupla.error )
		{
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
			if( nDebugLevel > 0 ) $(".DebugClass").toggle( true );
		}
	}
	
	oPrevInstruction = null;
	bIsDirty = false;
	UpdateInterface();
}

function AnalizaLinha( sLine, nLineNum )//testa tamanho da tupla e se e valida
{
	sLine = sLine.split( ";", 1 )[0];

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
		return( OTupla );
	}

	if( aTokens[1].length > 1 ) {
		OTupla.isValid = false;
		return( OTupla );
	}
	OTupla.currentSymbol = aTokens[1];
	
	if( aTokens.length < 3 ) {
		OTupla.isValid = false;
		return( OTupla );
	}
	if( aTokens[2].length > 1 ) {
		OTupla.isValid = false;
		return( OTupla );
	}
	OTupla.newSymbol = aTokens[2];
	
	if( aTokens.length < 4 ) {
		OTupla.isValid = false;
		return( OTupla );
	}
	if( ["l","r","*"].indexOf( aTokens[3].toLowerCase() ) < 0 ) {
		OTupla.isValid = false;
		return( OTupla );
	}
	OTupla.action = aTokens[3].toLowerCase();

	if( aTokens.length < 5 ) {
		OTupla.isValid = false;
		return( OTupla );
	}
	OTupla.newState = aTokens[4];
	
	if( aTokens.length > 6 ) {
		OTupla.isValid = false;
		return( OTupla );
	}
	if( aTokens.length == 6 ) {
		if( aTokens[5] == "!" ) {
			OTupla.breakpoint = true;
		} else {
			OTupla.isValid = false;
			return( OTupla );
		}
	} else {
		OTupla.breakpoint = false;
	}

	OTupla.isValid = true;
	return( OTupla );
}

function GetNextInstructions( sEstados, sSimboloDaCabeca )
{
  var result = null;
	if( aProgram[sEstados] != null && aProgram[sEstados][sSimboloDaCabeca] != null ) {
		return( aProgram[sEstados][sSimboloDaCabeca] );
	} else if( aProgram[sEstados] != null && aProgram[sEstados]["*"] != null ) {
		return( aProgram[sEstados]["*"] );
	} else if( aProgram["*"] != null && aProgram["*"][sSimboloDaCabeca] != null ) {
		return( aProgram["*"][sSimboloDaCabeca] );
	} else if( aProgram["*"] != null && aProgram["*"]["*"] != null ) {
		return( aProgram["*"]["*"] );
	} else {
    return( [] );
  }
}

function GetTapeSymbol( n )
{
	if( n < nTapeOffset || n >= sFita.length + nTapeOffset ) {
		return( "_" );
	} else {
		var c = sFita.charAt( n - nTapeOffset );
		if( c == " " ) { 
			c = "_"; 
		}
		return( c );
	}
}

function SetTapeSymbol( n, c )
{
	if( c == " " ) { 
		c = "_"; 
	 }
	
	if( n < nTapeOffset ) {
		sFita = c + repeat( "_", nTapeOffset - n - 1 ) + sFita;
		nTapeOffset = n;
	} else if( n > nTapeOffset + sFita.length ) {
		sFita = sFita + repeat( "_", nTapeOffset + sFita.length - n - 1 ) + c;
	} else {
		sFita = sFita.substr( 0, n - nTapeOffset ) + c + sFita.substr( n - nTapeOffset + 1 );
	}
}

function SetSyntaxMessage( msg )
{
	$("#SyntaxMsg").html( (msg?msg:"&nbsp;") )
}

function RenderizarFita()
{
	var nMovimentacaoPosicaoCabeca = nPosicaoCabeca - nTapeOffset;
	var sFirstPart, sSimboloDaCabeca, sSecondPart;
	
	if( nMovimentacaoPosicaoCabeca > 0 ) {
		sFirstPart = sFita.substr( 0, nMovimentacaoPosicaoCabeca );
	} else {
		sFirstPart = "";
	}
	if( nMovimentacaoPosicaoCabeca > sFita.length ) {
		sFirstPart += repeat( " ", nMovimentacaoPosicaoCabeca - sFita.length );
	}
	sFirstPart = sFirstPart.replace( /_/g, " " );
	
	if( nMovimentacaoPosicaoCabeca >= 0 && nMovimentacaoPosicaoCabeca < sFita.length ) {
		sSimboloDaCabeca = sFita.charAt( nMovimentacaoPosicaoCabeca );
	} else {
		sSimboloDaCabeca = " ";
	}
	sSimboloDaCabeca = sSimboloDaCabeca.replace( /_/g, " " );
	
	if( nMovimentacaoPosicaoCabeca >= 0 && nMovimentacaoPosicaoCabeca < sFita.length - 1 ) {
		sSecondPart = sFita.substr( nMovimentacaoPosicaoCabeca + 1 );
	} else if( nMovimentacaoPosicaoCabeca < 0 ) {
		sSecondPart = repeat( " ", -nMovimentacaoPosicaoCabeca - 1 ) + sFita;
	} else {
		sSecondPart = "";
	}
	sSecondPart = sSecondPart.replace( /_/g, " " );
	
	$("#LeftTape").text( sFirstPart );
	$("#ActiveTape").text( sSimboloDaCabeca );
	$("#RightTape").text( sSecondPart );
	
	if( $("#ActiveTapeArea").position().left < 0 ) {
		$("#MachineTape").scrollLeft( $("#MachineTape").scrollLeft() + $("#ActiveTapeArea").position().left - 10 );
	} else if( $("#ActiveTapeArea").position().left + $("#ActiveTapeArea").width() > $("#MachineTape").width() ) {
		$("#MachineTape").scrollLeft( $("#MachineTape").scrollLeft() + ($("#ActiveTapeArea").position().left - $("#MachineTape").width()) + 10 );
	}
}

function RenderState()//renderiza os estados
{
	$("#MachineState").html( sEstados );
}

function RenderSteps()//renderiza os passos
{
	$("#MachineSteps").html( nPassos );
}

function RenderLineMarkers()
{
  var oNextList = $.map(GetNextInstructions( sEstados, GetTapeSymbol( nPosicaoCabeca ) ), function(x){return(x.sourceLineNumber);} );
	SetActiveLines( oNextList, (oPrevInstruction?oPrevInstruction.sourceLineNumber:-1) );
}

function UpdateInterface()//faz a renderizacao de toda a interface grafica da maquina.
{
	RenderizarFita();
	RenderState();
	RenderSteps();
	RenderLineMarkers();
}

function Controles( bStep, bRun, bReset, bTextarea, bUndo )//habilita e desabilita botoes de controle
{
  document.getElementById( 'StepButton' ).disabled = !bStep;
  document.getElementById( 'RunButton' ).disabled = !bRun;
  document.getElementById( 'ResetButton' ).disabled = !bReset;
  document.getElementById( 'Source' ).disabled = !bTextarea;
  UndoButton(bUndo);

}

function UndoButton(bUndo)//habilita e desabilita botao voltar
{
  document.getElementById( 'UndoButton' ).disabled = !(bUndo && aUndoList.length > 0);
}

function StepButton()//botao de passo a passo
{
	if(contador>0){//se o contador for zero, inicia a maquina e habilita botao de voltar
	Step();
	UndoButton(true);
	}else{//se a maquina ja estiver em uso, reseta a maquina
		ResetButton();
		contador++;
	}
}

function RunButton()//botao de inicio. reseta a maquina (volta a maquina ao estado inicial, reseta os controles e inicia a maquina)
{
	ResetButton();
	Controles( false, false, false, false, false );
	Executar();
}

function ResetButton()//botao de Reiniciar. reseta a maquina e os controles
{
	contador=0;
	Reiniciar();
	Controles( true, true, false, true, false );
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

function SetErrorLine( num )
{
	$("#talinebg"+(num+1)).addClass('talinebgerror');
}

function ClearErrorLines()
{
	$(".talinebg").removeClass('talinebgerror');
}

function OnLoad()
{
	if( nDebugLevel > 0 ) $(".DebugClass").toggle( true );
	oTextarea = $("#Source")[0];
	TextareaChanged();
	
	VariantChanged(false);
}