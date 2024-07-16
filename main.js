var c = document.getElementById('c')
var ctx = c.getContext('2d')

var cellSize = 50

if(/Mobi|Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent)) cellSize = 100

var fieldW = 8
var fieldH = 12
var cardId = 0
var waitingForNewRow = false

var currentWord = ""
var currentWordCellIds = []
var currentWordScore = 0
var currentWordLegal = false
var currentWordSpecialMult = 1

var score = 0
var deltaScore = 0

c.width = cellSize*fieldW
c.height = cellSize*fieldH

var alphabet = 'АБВГДЕЁЖЗІЙКЛМНОПРСТУЎФХЦЧШЫЬЭЮЯ'
var alphabet2 = 'АААААААААААААААААААААААААААААААААААААААААААААААААААААААААААААААААААААААААААААААААААААААААААААААААААААААААААААААААААААААААААААААААААААААААААААААААААААААААААББББББББББББББББББББББББББББББББББББББББББББВВВВВВВВВВВВВВВВВВВВВВВВВВВВВВВВВВВВВВВВВВВВВВВВВВВВВВВВВВВВВВВВВВВВВВГГГГГГГГГГГГГГГГГГГГГГГГГГГГГГГГГГГГГГГГГГГГГГГДДДДДДДДДДДДДДДДДДДДДДДДДДДДДДДДДДДДДДДДДДДДДДДДДДДДДДДДДЕЕЕЕЕЕЕЕЕЕЕЕЕЕЕЕЕЕЕЕЕЕЕЕЕЕЕЕЕЕЕЕЕЕЕЕЕЕЕЕЕЕЕЕЕЕЕЕЕЕЕЕЕЕЕЕЕЕЕЕЕЕЕЕЕЕЕЕЕЕЕЕЕЕЁЁЁЁЁЁЁЁЁЁЁЁЁЁЁЁЁЁЁЖЖЖЖЖЖЖЖЖЖЖЖЖЖЖЖЖЖЖЖЖЖЖЖЖЖЖЗЗЗЗЗЗЗЗЗЗЗЗЗЗЗЗЗЗЗЗЗЗЗЗЗЗЗЗЗЗЗЗЗЗЗЗЗЗЗЗЗЗЗЗЗЗЗЗЗЗЗЗІІІІІІІІІІІІІІІІІІІІІІІІІІІІІІІІІІІІІІІІІІІІІІІІІІІІІІІІІІІІІІІІІІІІІІІІІІІЙЙЙЙЙЙЙЙЙЙЙЙЙЙЙЙЙЙЙЙЙЙЙЙЙЙЙЙЙЙЙЙЙЙЙЙЙЙЙЙЙЙККККККККККККККККККККККККККККККККККККККККККККККККККККККККККККККККККККЛЛЛЛЛЛЛЛЛЛЛЛЛЛЛЛЛЛЛЛЛЛЛЛЛЛЛЛЛЛЛЛЛЛЛЛЛЛЛЛЛЛЛЛЛЛЛЛЛЛЛЛЛЛЛЛЛЛЛЛЛЛЛЛЛЛЛЛЛЛЛЛЛЛММММММММММММММММММММММММММММММММММММММММММММММММММММММММММММММММММММММММННННННННННННННННННННННННННННННННННННННННННННННННННННННННННННННННННННННННННННННННННННННННННННННОООООООООООООООООООООООООООООООООООООООООООООООООООООООППППППППППППППППППППППППППППППППППППППППППППППППППППППППППППППППППППРРРРРРРРРРРРРРРРРРРРРРРРРРРРРРРРРРРРРРРРРРРРРРРРРРРРРРРРРРРРРРРРРРРРРРРРРРРРРРРРРРРРСССССССССССССССССССССССССССССССССССССССССССССССССССССССССССССССССССССССССТТТТТТТТТТТТТТТТТТТТТТТТТТТТТТТТТТТТТТТТТТТТТТТТТТТТТТТТТТТТТТТТУУУУУУУУУУУУУУУУУУУУУУУУУУУУУУУУУУУУУУУУУУУУУУУУУУУУУУУУУУУУУУУЎЎЎЎЎЎЎЎЎЎЎЎЎЎЎЎЎЎЎЎЎЎЎЎЎЎЎЎЎЎЎЎЎЎЎЎЎЎЎЎЎЎФФФФФФФФФФФФФФФФФФФФФФФФХХХХХХХХХХХХХХХХХХХХХХХХХХХХХХХХХХХХХЦЦЦЦЦЦЦЦЦЦЦЦЦЦЦЦЦЦЦЦЦЦЦЦЦЦЦЦЦЦЦЦЦЦЦЦЦЦЦЦЦЦЦЦЦЦЦЦЦЦЦЦЦЦЦЦЦЦЦЦЧЧЧЧЧЧЧЧЧЧЧЧЧЧЧЧЧЧЧЧЧЧЧЧЧЧЧЧЧЧЧЧЧЧЧЧЧЧЧЧЧЧЧЧЧЧШШШШШШШШШШШШШШШШШШШШШШШШШШШШШШШШШШШШШШШШЫЫЫЫЫЫЫЫЫЫЫЫЫЫЫЫЫЫЫЫЫЫЫЫЫЫЫЫЫЫЫЫЫЫЫЫЫЫЫЫЫЫЫЫЫЫЫЫЫЫЫЫЫЫЫЫЫЫЫЫЫЫЫЫЫЫЫЫЫЫЫЫЫЫЫЫЫЬЬЬЬЬЬЬЬЬЬЬЬЬЬЬЬЬЬЬЬЬЬЬЬЬЬЬЬЬЬЬЬЬЬЬЬЬЬЬЬЭЭЭЭЭЭЭЭЭЭЭЭЭЭЭЭЭЭЭЭЭЭЭЭЭЭЭЭЭЭЭЭЭЭЭЭЮЮЮЮЮЮЮЮЮЮЮЮЮЮЮЮЮЮЮЮЮЮЮЮЮЮЮЮЮЮЮЮЮЮЮЮЮЮЯЯЯЯЯЯЯЯЯЯЯЯЯЯЯЯЯЯЯЯЯЯЯЯЯЯЯЯЯЯЯЯЯЯЯЯЯЯЯЯЯЯЯЯЯЯЯЯЯЯЯЯЯЯЯЯЯЯ'

var letterScores = [
		10, //А
		45, //Б
		25, //В
		40, //Г
		35, //Д
		25, //Е
		100, //Ё
		70, //Ж
		35, //З
		25, //І
		45, //Й
		25, //К
		25, //Л
		25, //М
		20, //Н
		35, //О
		25, //П
		20, //Р
		25, //С
		30, //Т
		30, //У
		100,//Ў
		80, //Ф
		50, //Х
		30, //Ц
		40, //Ч
		50, //Ш
		25, //Ы
		50, //Ь
		55, //Э
		50, //Ю
		30, //Я
	]

var bestWords = []
var bestWordScores = []

var cardColors = ["#FFA500", "#EE4433", "gold", "skyblue"]

var cards = []
var disappearingCards = []
var gameOver = false

var selected = []
var r = 5
var r2 = 0
var mouse = {
	x: 0,
	y: 0,
	lastX: 0,
	lastY: 0,
	down: false,
}

function newLetter(){
	return rng.choice(alphabet2)
}

class Card{
	constructor(x, y, id, letter=-1){
		this.id = id
		this.x = x
		this.y1 = y
		this.y = y+cellSize
		this.vy = 0
		this.letter = letter
		this.moved = false
		this.dir = 1
		this.type = 0
		this.notExplode = false
		if((r==0 || (r==1 && rng2.nextFloat() > 0.8))){
			this.type = 1
			if(rng2.nextFloat() > 0.1) r = rng2.nextRange(1,6)
			else r = 5
		}
		else if(rng2.nextFloat() > 0.95){
			this.type = 2
		}

		if(letter == -1) this.letter = newLetter()
	}
}

class DisappearingCard{
	constructor(x, y, letter=-1, type){
		this.x = x
		this.y = y
		this.letter = letter
		this.type = type
		this.size = cellSize/2
	}
	draw(){
		if(this.size <= 0){
			this.size = 0
			return 0
		} 
		ctx.fillStyle = cardColors[this.type]
		ctx.fillRect(this.x+cellSize/2-this.size, this.y+cellSize/2-this.size, this.size*2, this.size*2)
		ctx.strokeStyle = "#666666"
		ctx.strokeRect(this.x+cellSize/2-this.size, this.y+cellSize/2-this.size, this.size*2, this.size*2)
		ctx.font = (this.size*1.2) +'px Balsamiq Sans'
		ctx.fillStyle = "white"
		ctx.fillText(this.letter, this.x + cellSize/2, this.y + cellSize/2)
		this.size -= 4
	}
}

function removeCard(i){
	cards.forEach(card => {
		if(card.y <= cards[i].y - cellSize && card.x == cards[i].x){
			card.y1 += cellSize
			card.moved = false
			return 0
			}
		})
		disappearingCards.push(new DisappearingCard(cards[i].x, cards[i].y, cards[i].letter, cards[i].type))
		cards.splice(i,1)
}

document.addEventListener('keydown', function(e){
	if(e.key == "Enter"){
		newRow()
	}
})

document.addEventListener('mouseup', function(e){
	if(currentWordLegal){
		var wordScore = currentWordScore*currentWord.length*currentWordSpecialMult
		var highlitedWord = currentWord.split('')

		cards.forEach(card => {
			if(currentWordCellIds.includes(card.id)){
				if(card.type == 1) highlitedWord[currentWordCellIds.indexOf(card.id)] = '<span style="color: #993333;">' + highlitedWord[currentWordCellIds.indexOf(card.id)] + '</span>'
				if(card.type == 2) highlitedWord[currentWordCellIds.indexOf(card.id)] = '<span style="color: #999933;">' + highlitedWord[currentWordCellIds.indexOf(card.id)] + '</span>'
			}
		})

		highlitedWord = highlitedWord.join('')

		deltaScore += wordScore
		if(bestWords.length == 0){
			bestWords.splice(0, 0, highlitedWord)
			bestWordScores.splice(0, 0, wordScore)
		}
		else{
			if(wordScore < bestWordScores[bestWordScores.length-1]){
				bestWords.push(highlitedWord)
				bestWordScores.push(wordScore)
			}
			else{
				for(var i = 0; i < bestWords.length; i++){
					if(bestWordScores[i] < wordScore){
						bestWords.splice(i, 0, highlitedWord)
						bestWordScores.splice(i, 0, wordScore)
						break
					}
				}
			}
		}

		while(bestWords.length > 10){
			bestWords.pop()
			bestWordScores.pop()
		}

		document.querySelector("#bestWords").innerHTML = "Найлепшыя словы:<br>"
		for(var i = 0; i < bestWords.length; i++){
			document.querySelector("#bestWords").innerHTML += bestWords[i] + " - " + bestWordScores[i] + "<br>"
		}

		if(cards.some(card => card.type == 1 && currentWordCellIds.includes(card.id))){
			for(var i = 0; i < cards.length; i++){
				if(!currentWordCellIds.includes(cards[i].id) || cards[i].notExplode) continue
				for(var k = 0; k < cards.length; k++){
					if(Math.sqrt((cards[i].x-cards[k].x)**2 + (cards[i].y-cards[k].y)**2) <= cellSize){
						if(!currentWordCellIds.includes(cards[k].id)){
							currentWordCellIds.push(cards[k].id)
							cards[k].notExplode = true
						} 
					}
				}
			}
		}

		for(var i = 0; i < cards.length; i++){
			cards[i].notExplode = false
			if(currentWordCellIds.includes(cards[i].id)){
				removeCard(i)
				i--
			}
		}
		waitingForNewRow = true
	}
	selected = []
	mouse.down = false
	currentWord = ""
currentWordCellIds = []
currentWordScore = 0
})

c.addEventListener('mouseleave', function(e){
	selected = []
	mouse.down = false
	currentWord = ""
currentWordCellIds = []
currentWordScore = 0
})

document.addEventListener('mousemove', function(e){
	if(gameOver) return 0
	mouse.x = e.x-c.getBoundingClientRect().left
	mouse.y = e.y-c.getBoundingClientRect().top
	
	var cellX = Math.floor(mouse.x/cellSize)
	var cellY = Math.floor(mouse.y/cellSize)
	var cellId = cellY*fieldW+cellX

	var dx = Math.abs(cellX - selected[selected.length-1]%fieldW)
	var dy = Math.abs(cellY - Math.floor(selected[selected.length-1]/fieldW))
	var inMiddleOfCell = (Math.abs(mouse.x%cellSize - cellSize /2) < cellSize/3) && Math.abs(mouse.y%cellSize - cellSize /2) <cellSize/3

	if(mouse.down && !selected.includes(cellId)){
		document.querySelector("#startText").innerHTML = ""
		var f = true
		if(selected.length > 0) if(dx > 1 || dy > 1) f = false
		if(!inMiddleOfCell) f = false
		if(f){
			var f1 = false
			cards.forEach(card => {
				if(Math.floor(card.x/cellSize)+Math.floor(card.y/cellSize)*fieldW == cellId){
					currentWord += card.letter
					currentWordScore += letterScores[alphabet.indexOf(card.letter)]
					currentWordCellIds.push(card.id)
					f1 = true
					return 0
			}
			})
			if(f1) selected.push(cellId)
		} 
	}
	if(mouse.down && selected.length > 1 && inMiddleOfCell){
		if(cellId == selected[selected.length-2]){
			selected.pop()
			currentWordScore -= letterScores[alphabet.indexOf( currentWord[currentWord.length-1] )]
			currentWordCellIds.pop()
			currentWord = currentWord.slice(0, currentWord.length-1)
		}
	}
	currentWordLegal = currentWord.length >= 3 && words.includes(currentWord.toLowerCase())
	//currentWordLegal = 1
})

document.addEventListener('mousedown', function(e){
	if(!waitingForNewRow){
		selected = []
		mouse.down = true
		currentWord = ""
		currentWordCellIds = []
		currentWordScore = 0
	}
})

function draw(){
	ctx.clearRect(0, 0, c.width, c.height)
	ctx.strokeStyle = "#555555"
	ctx.font = "30px sans-serif"

	ctx.textBaseline = "middle"
	ctx.textAlign = "center"

	ctx.lineWidth = 3

	ctx.fillStyle = "#666666"
	ctx.fillRect(0, 0, c.width, c.height)

	for(var i = 0; i < fieldW; i++){
		for(var k = 0; k < fieldH; k++){
			ctx.strokeRect(i*cellSize, k*cellSize, cellSize, cellSize)
		}
	}

	ctx.lineWidth = 2
	cards.forEach(card => {
		ctx.fillStyle = cardColors[card.type]
		ctx.fillRect(card.x, card.y, cellSize, cellSize)
	})

	ctx.fillStyle = "#000000"
	ctx.globalAlpha = 0.1
	selected.forEach(c => {
		ctx.fillRect((c%fieldW)*cellSize, Math.floor(c/fieldW)*cellSize, cellSize, cellSize)
	})
	ctx.globalAlpha = 1

	cards.forEach(card => {
		ctx.strokeStyle = "#666666"
		ctx.strokeRect(card.x, card.y, cellSize, cellSize)

		ctx.font = 30*cellSize/50 + 'px Balsamiq Sans'
		ctx.fillStyle = "white"
		ctx.fillText(card.letter, card.x + cellSize/2, card.y + cellSize/2)

		//ctx.font = '10px sans-serif'
		//ctx.fillText(letterScores[alphabet.indexOf(card.letter)], card.x + cellSize/8, card.y + cellSize/8)
	})

	disappearingCards.forEach(c => {
		c.draw()
	})
}

function newRow(){
	r--
	cards.forEach(card => {
		card.y1 -= cellSize
		card.moved = false
		if(card.y == 0){
			gameOver = true
			document.querySelector("#lose").innerHTML = "ГУЛЬНЯ<br>СКОНЧАНА!"
		}
	})
	for(var i = 0; i < fieldW; i++){
		cards.push(new Card(i*cellSize, c.height-cellSize, cardId))
		cardId++
	}
}

setInterval(function(){
	currentWordSpecialMult = 1
	currentWordCellIds.forEach(id => {
		cards.forEach(c => {
			if(c.id == id && c.type == 2){
				currentWordSpecialMult *= 2
				return 0
			} 
		})
	})

	var f = true
	cards.forEach(card => {
		if(gameOver){
			//card.vy += 3
			//card.y += card.vy
			return 0
		}
		if(!card.moved && disappearingCards.length == 0){
			if(card.y < card.y1){
				card.dir = 1
				card.y += 10
			}
			else if(card.y > card.y1){
				card.dir = -1
				card.y += (card.y1 - card.y) / 3
			}
		}
		if((Math.abs(card.y - card.y1) < 0.1 && card.dir == -1) || (card.y >= card.y1 && card.dir == 1)){
			card.moved = true
			card.y = card.y1
		} 
		if(!card.moved){
			f = false
		}
	})
	if(f && waitingForNewRow && disappearingCards.length == 0){
		waitingForNewRow = false
		newRow()
	}
	if(deltaScore >= 1000){
		deltaScore -= 1000
		score += 1000
	}
	if(deltaScore >= 100){
		deltaScore -= 100
		score += 100
	}
	if(deltaScore >= 10){
		deltaScore -= 10
		score += 10
	}
	else{
		score += deltaScore
		deltaScore = 0
	}

	for(var i = 0; i < disappearingCards.length; i++){
		if(disappearingCards[i].size == 0){
			disappearingCards.splice(i, 1)
			i--
		}
	}

	document.getElementById("score").innerHTML = score
	document.getElementById("upperText").innerHTML = currentWord
	document.getElementById("upperText2").innerHTML = currentWordScore*currentWord.length*currentWordSpecialMult
	document.getElementById("upperText2").style.color = "#000000"
	if(currentWordSpecialMult > 1) document.getElementById("upperText2").style.color = "gold"
	if(!currentWordLegal) document.getElementById("upperText2").innerHTML = ''
	draw()
}, 40)

waitingForNewRow = true
newRow()
setTimeout(newRow, 400)
setTimeout(newRow, 800)
setTimeout(function(){
	newRow()
	waitingForNewRow = false
}, 1200)
/*setInterval(function(){
	console.log(selected)
}, 100)*/

document.querySelector("#startText").style.width = cellSize*fieldW+"px"
document.querySelector("#startText").style.fontSize = 25*cellSize/50+"px"
document.querySelector("#startText").innerHTML = "Знайдзіце і вылучыце як мага больш слоў, пакуль літары не перайшлі за верхні радок!<br>Чым даўжэй слова, тым лепей.<br><span style='color: yellow;'>Жоўтая</span> літара - падвоеныя балы за слова.<br><span style='color: red;'>Чырвоная</span> літара - усё слова робіць выбух!<br>Узровень будзе аднолькавы ва ўсіх гульцоў,<br>але ён змяняецца кожны дзень!"