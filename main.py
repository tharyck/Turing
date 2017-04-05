#Autor: Tharyck Vasconcelos

PosicaoApontador = 0
numPassos = 0
maxVoltar = 0
listaVoltar=[]
entrada = ""
fita=""
estados="0"

def menu():
	print ("Maquina de Turing")
	print ("-----------------")
	RecebeCodigo()

def RecebeCodigo():
	lercodigo = open('./codigo.txt', 'r')
	codigo = lercodigo.readlines()
	lercodigo.close()
	AnalizaLinha(codigo)	

#ler as linhas do arquivo recebido
def AnalizaLinha(codigo):
	novoCodigo = []
	
	#retirando comentarios
	for i in range(len(codigo)):
		if(codigo[i].startswith(";")):
			pass
		else:
			novoCodigo.append(codigo[i])
	return novoCodigo


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

	#se a instrucao tiver tamanho zero, torna o elemento inst null, senao inst sera a posicao zero
	if(instrucao.length == 0):
		inst=null
	else:
		inst=instrucao[0]
	
	if(instrucao != null):
		novoEstado
		if(instrucao.novoEstado == "*"):
			Estado = instrucao.novoEstado
		
		novoSimbolo
		if (instrucao.novoSimbolo == "*"):
			SimboloDoApontador = instrucao.novoSimbolo
		acoes
		if(instrucao.acao.toLowerCase() == "r"):
			acoes=1
		elif(instrucao.acao.toLowerCase() == "l"):
			acoes=-1
		else:
			acoes=0		
	
	if(PosicaoApontador == 0 and Acoes == -1):
		Acoes=0
	else:
		novoEstado = "halt"
		novoSimbolo = SimboloDoApontador
		acoes = 0
		linhas = -1	

	if(maxVoltar > 0):
		if(listaVoltar.length >= maxVoltar):
			listaVoltar.shift()
			listaVoltar.push(estado)

  # if( nMaxUndo > 0 ) {
  #   if( aUndoList.length >= nMaxUndo ) aUndoList.shift();
  #   aUndoList.push({state: sEstados, position: nPosicaoCabeca, symbol: sSimboloDaCabeca});
  # }

	setSimboloFita(PosicaoApontador, NovoSimbolo)
	estados = NovoEstado
	PosicaoApontador += acoes
	numPassos+1
	maxVoltar = numPassos+1
	PrevInstruction = instrucao

	if(NovoEstado.toLowerCase() == "halt"):
		if(instrucao != null):
			return false
	else:
		if(instrucao.breakpoint):
			return false
		else:
			return true
	

def voltar():
	#remove o ultimo elemento da lista
	voltar = listaVoltar.pop()

	#testa se voltar nao e vazio
	if(voltar.length > 0):
		#subtrai um passo
		numPassos-1
		#numero maximo de voltas e igual ao novo numero de passos
		maxVoltar=numPassos+1
		#estado atual e o estado da lista voltar
		Estado=voltar.Estado
		#apontador esta na posicao de voltar
		PosicaoApontador=voltar.PosicaoApontador
		#seta o simbolo da fita
		setSimboloFita(PosicaoApontador,voltar.simbolo)

def executar():
	#corrigir
	while(entrada().length > 0):
		passos()
	

def resetar():
	fitaInicial = entrada[0].value
	PosicaoApontador = fitaInicial.indexOf("*")

#refatorar
def getInstrucao(estados, SimboloDoApontador):
	if((aProgram[estados] != null) and (aProgram[estados][SimboloDoApontador] != null)):
		return(aProgram[estados][SimboloDoApontador])
	elif( aProgram[estados] != null and aProgram[estados]["*"] != null ):
		return( aProgram[estados]["*"] )
	elif( aProgram["*"] != null and aProgram["*"][SimboloDoApontador] != null ):
		return( aProgram["*"][SimboloDoApontador] );
	elif( aProgram["*"] != null and aProgram["*"]["*"] != null ):
		return( aProgram["*"]["*"] );
	else:
		return([])

#recebe o simbolo da fita
def getSimboloFita(element):
	#se o elemento for menor do que 
	if((element < nTapeOffset) or (element >= sFita.length + nTapeOffset)):
		return ("_")
	else:
		c = sFita.charAt( element - nTapeOffset )
		if( c == " " ): 
			c = "_"
	return c

#refatorar
def SetSiboloFita( element, c ):
	if( c == " " ):
		c = "_"
	
	if( n < nTapeOffset ):
		sFita = c + repeat( "_", nTapeOffset - n - 1 ) + sFita;
		nTapeOffset = n
	elif( n > nTapeOffset + sFita.length ):
		sFita = sFita + repeat( "_", nTapeOffset + sFita.length - n - 1 ) + c
	else:
		sFita = sFita.substr( 0, n - nTapeOffset ) + c + sFita.substr( n - nTapeOffset + 1 )



		
menu()
