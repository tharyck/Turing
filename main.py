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
#quantidade de passos dados
passos = 0
#mover para direita
direita = 1
#mover para esquerda
esquerda = -1

fita = []

def main():
	#recebe oarquivo texto com o codigo
	codigo = AnalizaEntrada(RecebeCodigo())
	#cria uma fita com a entrada informada
	fita  = criaFita(entrada = raw_input("Digite sua Entrada: "))

	#cria a tabela de regras
	for i in range(len(codigo)):
		tabela.append(criaRegra(codigo[i]))

	print tabela
	elemento = fita[posicao]

	#chama procura regra
	regra = procuraRegra(estadoAtual, elemento)
	print regra


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

#cria uma fita com a entrada informada
def criaFita(entrada):
	fita=[]
	for i in range(len(entrada)):
		fita.append(entrada[i])
	return fita

#le cada linha do codigo e cria uma linha da tabela de regras
def criaRegra(linha):
	regra = []
	regra.append(linha[0])
	regra.append(linha[2])
	regra.append(linha[4])
	regra.append(linha[6])
	regra.append(linha[8])
	return regra
	
#recebe uma linha de regra
def criaTabela(linha):
	tabela = []
	tabela.append(linha)

#metodo que escreve na fita e apresenta o resultado
def escreveFita(fita, posicao, regra):
	fita[posicao] = regra[4]
	pass

def turing(regra, fita, posicao, passos):

	if(posicao<0):
		print "ERRO, Posicao < 0"
	if (passos > 1000):
		print 

	elemento = fita[posicao]
	procuraRegra(regra, proximoElemento)
	
	
	passos+=1 #adiciona um passo
	
	#o proximo estado e o ultimo elemento da regra
	proximoEstado = regra[8]

	#o estado atual e o primeiro elemento da regra
	estado = regra[0]

	#indica para onde o apontador se movera
	if(regra[6] == "r"):
		posicao += direita
	elif(regra[6] == "l"):
		posicao += esquerda
	else:
		pass

	proximaRegra = procuraRegra(estadoAtual[8],estadoAtual[6])
	turing(procuraRegra, fita, posicao, passos)

	pass

#procura a regra que corresponde ao estado passado e ao elemento lido
def procuraRegra(estado, elemento):
	for i in range(len(tabela)):
		if ((tabela[i][0] == str(estado)) and (tabela[i][2] == str(elemento))):
			print "ok"
			return tabela[i]
		else:
			pass

#Funcion recursiva que lee la cinta en una de las
#evaluaciones deseadas, regresa el resultado de la evaluacion
#var "estado"= El estado actual de la maquina
#var "lugar"= Lugar actual de la maquina
#var "dic"= Diccionario que contine las reglas de la maquina
#var "cinta"= Cinta en la que actualmente nos movemos
#var "contador"= Contador del numero de veces
#                 que se a llamado a la funcion.
#var "unos"= La cantidad de unos que deberia de tener la cinta al final
def leer(estado, lugar, dic,cinta, contador, unos):

    contador += 1    #Aumentamos en 1 el contador
    valor = cinta[lugar]    #El valor en el lugar actual de la cinta
    llave = str(estado) + str(valor)   #Llave para el diccionario

    #Clausula de escape
    if not llave in dic:
        #Si la llave no se encuntra en el diccionario
        #procedemos a verificar si la cantidad de unos es correcta.
        contar(cinta, unos)
        return

    rules = dic[llave] #Obtenemos las reglas de la cinta
    cinta[lugar] = int(rules[1]) #Actualizamos el valor
    estado = rules[0] #Actualizamos el estado

    #Verificaremos hacia que direccion se movera lugar
    if rules[2] == "R":
        #Movemos a la derecha el lugar
        lugar += 1
    else:
        #Movemos a la izquierda el lugar
        lugar -= 1

    #Hacemos la llamada recursivo de la funcion
    leer(estado, lugar, dic,
         cinta, contador, unos)


		
main()
