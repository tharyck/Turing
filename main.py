#Autor: Tharyck Vasconcelos
int PosicaoApontador=0
int numPassos=0
int maxVoltar=0
ListaVoltar=[]
str entrada

#cria uma fita finita
def fita():
	fita=[]
	for i in range(0,300):
		fita.append(0)
	return fita

def passos():
	novoEstado
	novoSimbolo
	Acoes
	Linhas
	SimboloDoApontador= getSimboloFita(PosicaoApontador)
	instrucao= getInstrucao(Estado, SimboloDoApontador)
	inst

	#se a instrucao tiver tamanho zero, torna o elemento inst null, senao inst será a posicao zero
	if(instrucao.length == 0):
		inst=null
	else:
		inst=instrucao[0]
	
	if(instrucao != null):
		novoEstado=instrucao.novoEstado == "*"
		novoSimbolo


	if(PosicaoApontador == 0 and Acoes == -1):
		Acoes=0

	Linhas=instrucao.contaLinhas

def voltar():
	#remove o ultimo elemento da lista
	voltar = ListaVoltar.pop()

	#testa se voltar nao é vazio
	if(voltar.length > 0):
		#subtrai um passo
		numPassos--
		#numero maximo de voltas é igual ao novo numero de passos
		maxVoltar=numPassos+1
		#estado atual é o estado da lista voltar
		Estado=voltar.Estado
		#apontador está na posicao de voltar
		PosicaoApontador=voltar.PosicaoApontador
		#seta o simbolo da fita
		setSimboloFita(PosicaoApontador,voltar.simbolo)

def executar():
	#corrigir
	while(entrada().length > 0){
	passos()
	}

def resetar():
	fitaInicial = entrada[0].value
	PosicaoApontador = fitaInicial.indexOf("*")


def analisaLinha():
	

#refatorar
def getInstrucao(estados, SimboloDoApontador):
    result
	if( aProgram[estados] != null && aProgram[estados][SimboloDoApontador] != null ):
		return( aProgram[estados][SimboloDoApontador] )
	elif( aProgram[estados] != null && aProgram[estados]["*"] != null ):
		return( aProgram[estados]["*"] )
	elif( aProgram["*"] != null && aProgram["*"][SimboloDoApontador] != null ):
		return( aProgram["*"][SimboloDoApontador] );
	elif( aProgram["*"] != null && aProgram["*"]["*"] != null ):
		return( aProgram["*"]["*"] );
	else:
    	return( [] )

#recebe o simbolo da fita
def getSimboloFita(element):
	#se o elemento for menor do que 
	if( element < nTapeOffset || element >= sFita.length + nTapeOffset ):
		return="_"
	else:
		c = sFita.charAt( element - nTapeOffset );
		if( c == " " ): 
			c = "_"
	return c

#refatorar
def SetSiboloFita( element, c ):
	if( c == " " )
		c = "_"
	
	if( n < nTapeOffset ):
		sFita = c + repeat( "_", nTapeOffset - n - 1 ) + sFita;
		nTapeOffset = n
	elif( n > nTapeOffset + sFita.length ):
		sFita = sFita + repeat( "_", nTapeOffset + sFita.length - n - 1 ) + c
	else:
		sFita = sFita.substr( 0, n - nTapeOffset ) + c + sFita.substr( n - nTapeOffset + 1 )

#refatorar
def AnalizaLinha( sLine, nLineNum )

	sLine = sLine.split( ";", 1 )[0]

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
