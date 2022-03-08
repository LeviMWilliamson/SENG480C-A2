'use strict'

import Quagga from 'quagga'

Quagga.init(
	{
		inputStream: {
			name: 'Live',
			type: 'LiveStream',
			target: document.getElementById('quagga-target')
		},
		decoder: {
			readers: ['code_128_reader'],
			multiple: true
		},
		locate: true,
	},
	err => {
		if (err) {
			console.error(err)
		} else {
			console.log('quagga initialized')
			Quagga.start()
		}
	}
)

const validRecipeIngredientsMap = new Map([
	['SUGAR', 'Sugar'],
	['BAKING SODA', 'Baking Soda'],
	['WATER', 'Water'],
	['EGG', 'Egg'],
	['FLOUR', 'Flour'],
	['SALT', 'Salt'],
])

const ingredientsList = document.getElementById('ingredients-list')
const applicationStates = {
	none: {
		message: 'No current action.',
		mesageColor: 'lightyellow',
		callback: (_) => {}
	},
	addIngredient: {
		message: 'Scan an ingredient to add it to your recipe!',
		messageColor: 'lightgreen',
		callback: ingredient => {
			const ingredientEntry = document.createElement('li')
			ingredientEntry.innerText = ingredient
			ingredientsList.append(ingredientEntry)
			setApplicationState(applicationStates.none)
		}
	}
}

let currentApplicationState = applicationStates.none
const statusElement = document.getElementById('status')
const setApplicationState = (applicationState) => {
	currentApplicationState = applicationState
	statusElement.style.backgroundColor = applicationState.messageColor
	statusElement.innerText = applicationState.message
}

const addIngredientButton = document.getElementById('add-ingredient')
addIngredientButton.addEventListener('click', () => setApplicationState(applicationStates.addIngredient))

// add scanned barcodes to sidelog
const scannedBarcodesList = document.getElementById('scanned-barcodes-list')
Quagga.onDetected(data => {
	for(let datum of data)
		if(datum.codeResult) {
			const { code } = datum.codeResult
			if(validRecipeIngredientsMap.has(code)) {
				// get code data
				const ingredient = validRecipeIngredientsMap.get(code)
				
				// log result
				const listElement = document.createElement('li')
				listElement.innerText = ingredient
				scannedBarcodesList.append(listElement)

				// execute application state callback
				currentApplicationState.callback(ingredient)
			} else {
				console.error('failed to parse barcode: item not found in catalog')
			}
		}
})
