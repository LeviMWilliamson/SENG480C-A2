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

const recipeState = new Map([
	['SUGAR', {
		name: 'Sugar',
		measurement: 'Cup',
		quantity: 0
	}],
	['BAKING SODA', {
		name: 'Baking Soda',
		measurement: 'Tablespoon',
		quantity: 0
	}],
	['WATER', {
		name: 'Water',
		measurement: 'Cup',
		quantity: 0
	}],
	['EGG', {
		name: 'Egg',
		measurement: 'Unit',
		quantity: 0
	}],
	['FLOUR', {
		name: 'Flour',
		measurement: 'Cup',
		quantity: 0
	}],
	['SALT', {
		name: 'Salt',
		measurement: 'Teaspoon',
		quantity: 0
	}],
])

const ingredientsList = document.getElementById('ingredients-list')
const applicationStates = {
	none: {
		message: 'No current action.',
		messageColor: 'lightyellow',
		callback: (_) => {}
	},
	addIngredient: {
		message: 'Scan an ingredient to add it to your recipe!',
		messageColor: 'lightgreen',
		callback: ingredientKey => {
			const ingredient = recipeState.get(ingredientKey)
			recipeState.set(ingredientKey, { ...ingredient,  quantity: ingredient.quantity + 1 })

			while(ingredientsList.firstChild)
				ingredientsList.removeChild(ingredientsList.lastChild)

			for(let ingredient of recipeState.values()) {
				console.log(ingredient)
				if(ingredient.quantity > 0) {
					const ingredientEntry = document.createElement('li')
					ingredientEntry.innerText = ingredient.quantity > 1 ?
						`${ingredient.quantity} ${ingredient.measurement}s of ${ingredient.name}`
						:
						`A ${ingredient.measurement} of ${ingredient.name}`	
					ingredientsList.append(ingredientEntry)
				}
			}

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
			if(recipeState.has(code)) {
				// get code data
				const ingredient = recipeState.get(code)
				
				// log result
				const listElement = document.createElement('li')
				listElement.innerText = code
				scannedBarcodesList.append(listElement)

				// execute application state callback
				currentApplicationState.callback(code)
			} else {
				console.error('failed to parse barcode: item not found in catalog')
			}
		}
})
