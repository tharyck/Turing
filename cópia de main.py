#Autor: Tharyck Vasconcelos

PosicaoApontador = 0

numPassos = 0

maxVoltar = 0

listaVoltar=[]

entrada = ""

estados="0"

tabela = []


def menu():
	print ("Maquina de Turing")
	print ("-----------------")

	RecebeCodigo()
	criaFita(entrada = raw_input("Digite sua Entrada: "))

def RecebeCodigo():
	lercodigo = open('./codigo.txt', 'r')
	codigo = lercodigo.readlines()
	lercodigo.close()
	tabela = criaTabela(AnalizaLinha(codigo))	

#ler as linhas do arquivo recebido
def AnalizaLinha(codigo):
	novoCodigo = []
	
	#retirando comentarios
	for i in range(len(codigo)):
		if(codigo[i].startswith(";") or (len(codigo[i]) <= 4)):
			pass
		else:
			criaRegra(codigo)

#cria uma fita com a entrada informada
def criaFita(entrada):
	fita=[]
	for i in range(len(entrada)):
		fita.append(entrada[i])
	return fita

def criaRegra(linha):
	regra = []
	regra.append(linha[0])
	regra.append(linha[2])
	regra.append(linha[4])
	regra.append(linha[6])
	regra.append(linha[8])
	
	print regra
	
def criaTabela(codigo):
	tabela = []
	#primeira casa se refere ao estado
	for i in range(len(codigo)):
		tabela.append(codigo[i])
	print tabela


def passos():
	novoEstado #cria novo estado
	novoSimbolo#cria novo simbolo
	Acoes
	Linhas

	SimboloDoApontador= getSimboloFita(PosicaoApontador)#recebe o simbolo

	instrucoes= getInstrucao(Estado, SimboloDoApontador)#recebe a instrucoes da maquina
	
	instrucao#

	#se a instrucoes tiver tamanho zero, torna o elemento instrucao null, senao instrucao sera a posicao zero
	if(instrucoes.length == 0):
		instrucao = null
	else:
		instrucao=instrucoes[0]
	
	if(instrucoes != null):
		novoEstado
		if(instrucoes.novoEstado == "*"):
			novoEstado = Estado
		else:
			novoEstado = instrucoes.novoEstado
		
		novoSimbolo
		if (instrucoes.novoSimbolo == "*"):
			novoSimbolo = SimboloDoApontador
		else:
			novoSimbolo = instrucoes.novoSimbolo
		
		acoes
		if(instrucoes.acao == "r"):
			acoes=1
		elif(instrucoes.acao.toLowerCase() == "l"):
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
			listaVoltar.push(estado, PosicaoApontador, SimboloDaCabeca)


	setSimboloFita(PosicaoApontador, NovoSimbolo)
	estados = novoEstado
	PosicaoApontador += acoes
	numPassos+=1
	maxVoltar = numPassos+1
	PrevInstruction = instrucoes

	if(NovoEstado == "halt"):
		if(instrucoes != null):
			return false
	else:
		if(instrucoes.breakpoint):
			return false
		else:
			return true
	print estado

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
	while(len(entrada) > 0):
		passos()
	



		
menu()
