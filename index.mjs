'use strict'

import Quagga from 'quagga'

Quagga.init(
	{
		inputStream: {
			name: 'Live',
			type: 'LiveStream',
			target: document.getElementById('quagga-target')
		},
		decoder: { readers: ['code_128_reader'] },
	},
	err => {
		if(err) {
			console.error(err)
			return
		}
		console.log('quagga initialized')
		Quagga.start()
	}
)
