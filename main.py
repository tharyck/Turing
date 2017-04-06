#Autor: Tharyck Vasconcelos

entrada = ""
#tabela de regras da maquina
tabela = []
#posicao atual do apontador
posicao = 0
#estado atual
estadoAtual = 0
#
proximoEstado = 0

#
proximoElemento = 0
#quantidade de passos dados
passos = 0
#mover para direita
direita = 1
#mover para esquerda
esquerda = -1

fita = []

def imprimeFita(fita, posicao):
	apontador = [len(fita)]
	print fita
	apontador[posicao] ="|"
	print apontador


def main():
	#recebe oarquivo texto com o codigo
	codigo = AnalizaEntrada(RecebeCodigo())
	#cria uma fita com a entrada informada
	fita  = criaFita(entrada = raw_input("Digite sua Entrada: "))
	#cria a tabela de regras
	for i in range(len(codigo)):
		tabela.append(criaRegra(codigo[i]))

	#recebe o elemento atual da fita
	elemento = fita[posicao]

	#chama procura regra
	regra = procuraRegra(estadoAtual, elemento)

	turing(regra, fita, posicao, passos)


#recebe um arquivo texto como entrada
def RecebeCodigo():
	lercodigo = open('./codigo.txt', 'r')
	codigo = lercodigo.readlines()
	lercodigo.close()
	return codigo

#ler as linhas do arquivo recebido e remove comentarios
def AnalizaEntrada(codigo):
	novoCodigo = []
	
	#retirando comentarios
	for i in range(len(codigo)):
		if(codigo[i].startswith(";") or (len(codigo[i]) <= 4)):
			pass
		else:
			novoCodigo.append(codigo[i])
	return novoCodigo


def imprimeNovoCodigo(codigo):
	for i in range(len(codigo)):
		print codigo[i]

#cria uma fita com a entrada informada
def criaFita(entrada):
	fita=[]
	for i in range(len(entrada)):
		fita.append(entrada[i])
	fita.append("")
	return fita

#le cada linha do codigo e cria uma linha da tabela de regras
def criaRegra(linha):
	regra = []

	novalinha = linha.split(" ")
	regra.append(novalinha[0])
	regra.append(novalinha[1])
	regra.append(novalinha[2])
	regra.append(novalinha[3])
	estado  = novalinha[4].rstrip()
	regra.append(estado)
	print regra
	return regra


#recebe uma linha de regra
def criaTabela(linha):
	tabela = []
	tabela.append(linha)

#metodo que escreve na fita e apresenta o resultado
def escreveFita(fita, posicao, regra):
	fita[posicao] = regra[2]
	return fita

def proximoElemento(fita, posicao, regra):
	elemento = fita[posicao]

	return
def turing(regra, fita, posicao, passos):

	if(posicao < 0):
		print "ERRO, Posicao < 0"
	if (passos > 1000):
		print "Quantidade de Passos Execedida."

	#imprime a fita atual e onde esta o apontador
	imprimeFita(fita, posicao)

	#recebe o elemento onde esta o apontador
	elemento = fita[posicao]
	fita = escreveFita(fita,posicao, regra)
	#imprimeFita(fita, posicao)
	
	#checa se o apontador se move para direita ou esquerda
	if(regra[3] == "r"):
		posicao = posicao +1
	elif(regra[3] == "l"):
		posicao = posicao - 1
	else:
		pass
	#imprimeFita(novaFita, posicao)
	novaRegra = procuraRegra(regra[4], elemento)
	#print imprimeFita(novaFita, posicao)
	#adiciona um passo
	passos+=1
	
	#o proximo estado e o ultimo elemento da regra
	proximoEstado = regra[4]
	print proximoEstado

	#o estado atual e o primeiro elemento da regra
	estado = regra[0]

	
	turing(novaRegra, fita, posicao, passos)

#procura a regra que corresponde ao estado passado e ao elemento lido
def procuraRegra(estado, elemento):
	for i in range(len(tabela)):
		#procura o estado passado e se existe o elemento para tal estado
		if ((tabela[i][0] == str(estado)) and (tabela[i][1] == str(elemento))):
			return tabela[i]

		
main()
