original_image = new Image();
let histogram = {
	red: [],
	green: [],
	blue: []
}

for( let i = 0; i <= 255; i++ ){
	histogram.red.push(0);
	histogram.green.push(0);
	histogram.blue.push(0);
}

let behavior_header = new Vue({
	el: '#behavior_header',

	data: {
		name_file: null,

		view_name: false
	},

	methods: {
		download_image: function(){	// Función para descargar la imagen
			let link = window.document.createElement( 'a' );	// Crea un elemento a
			let url = behavior_main_image.$refs.ref_canvas.toDataURL();	//	Convertimos los datos de de la imagen y la convertimos en URL

			link.setAttribute( 'href', url );	// Al elemento a le ponemos el atributo src
			link.setAttribute( 'download', this.name_file );	// Al elemento a le ponemos el atributo download con el nombre de la imagen
			link.style.visibility = 'hidden';	// Hacemos que el elemento a esté oculto

			window.document.body.appendChild( link );	// Añadimos al DOM el elemento a
			link.click();	// Invocamos la acción click del elemento a
			window.document.body.removeChild( link );	// Removemos del DOM el elemento a
		},

		close_image: function(){ // Función para cerrar la imagen y volver a la vista principal
			this.name_file = null;	// Reseteamos el nombre de la imagen
			this.view_name = false;

			behavior_main_image.umbral_binarizado = 127;
			behavior_main_image.x_plus_value = 0;
			behavior_main_image.y_plus_value = 0;
			behavior_main_image.x_subs_value = 0;
			behavior_main_image.y_subs_value = 0;
			behavior_main_image.x_and_value = 0;
			behavior_main_image.y_and_value = 0;
			behavior_main_image.x_or_value = 0;
			behavior_main_image.y_or_value = 0;
			behavior_main_image.x_min = 0;
			behavior_main_image.x_max = 0;
			behavior_main_image.y_min = 0;
			behavior_main_image.y_max = 0;
			behavior_main_image.exp_min_value = 0;
			behavior_main_image.exp_max_value = 255;
			behavior_main_image.cont_min_value = 0;
			behavior_main_image.cont_max_value = 255;
			behavior_main_image.second_image = null;
			behavior_main_image.context = null;
			behavior_main_image.canvas2 = null;
			behavior_main_image.context2 = null;
			behavior_main_image.pixels_backup = null;
			behavior_main_image.button_message = "Cargar imagen";
			behavior_main_image.view_main_images = false;
			behavior_main_image.view_button_back = false
			behavior_main_image.view_inputs = false;

			behavior_main_load.view_icon_loadImage = true;
		}
	}
});

let behavior_main_image = new Vue({
	el: '#behavior_main_image',

	data: {
		umbral_binarizado: 127,
		x_plus_value: 0,
		y_plus_value: 0,
		x_subs_value: 0,
		y_subs_value: 0,
		x_and_value: 0,
		y_and_value: 0,
		x_or_value: 0,
		y_or_value: 0,
		const_value: 0,
		exp_min_value: 0,
		exp_max_value: 255,
		cont_min_value: 0,
		cont_max_value: 255,
		alpha_ray_value: 0,

		x_min: 0,
		x_max: 0,
		y_min: 0,
		y_max: 0,

		second_image: null,
		context: null,
		canvas2: null,
		context2: null,
		pixels_backup: null,
		histogram: null,

		button_message: "Cargar imagen",

		view_main_images: false,
		view_button_back: false,
		view_inputs: false
	},

	methods: {
		load_image: function( width, height ){	// Función para cargar la imágen 
			this.$refs.ref_canvas.width = width;	// Al canvas le asignamos el ancho de la imagen
			this.$refs.ref_canvas.height = height;	// Al canvas le asignamos el alto de la imagen

			this.context = this.$refs.ref_canvas.getContext( '2d' );	// Obtenemos el contexto del canvas
			this.context.drawImage( original_image, 0, 0 );	// Dibujamos la imagen en el canvas

			this.updateHistogram();
		},

		load_second_image: function(){
			let file = this.$refs.ref_second_input_file.files[0];	// Obtenemos la ruta de la imagen a cargar
			let reader = new FileReader();	// Creamos un objeto de tipo FileReader
			this.second_image = new Image();
			this.canvas2 = document.createElement( 'canvas' );

			if( reader ){
				reader.readAsDataURL( file );	// Se lee la información de la imagen con base a la ruta del archivo
				reader.onload = ( e ) => {	// Cuando se termine de leer la información
					this.second_image.name = file.name;	// Asignamos el nombre de la imagen
					this.second_image.src = reader.result;	// Asignamos la información de la imagen

					this.second_image.onload = () =>{	// Cuando se termine de subir la imagen
						this.canvas2.width = this.second_image.width;	// Al canvas le asignamos el ancho de la imagen
						this.canvas2.height = this.second_image.height;	// Al canvas le asignamos el alto de la imagen

						this.x_min = -this.second_image.width;
						this.y_min = -this.second_image.height;
						this.x_max = original_image.width;
						this.y_max = original_image.height;
						
						this.context2 = this.canvas2.getContext( '2d' );	// Obtenemos el contexto del canvas
						this.context2.drawImage( this.second_image, 0, 0 );	// Dibujamos la imagen en el canvas
					}
				}
			}

			this.$refs.ref_main_images.appendChild( this.canvas2 );

			this.button_message = "Cambiar imagen";
			this.view_inputs = true;
		},

		updateHistogram: function(){
			for( let i = 0; i <= 255; i++ ){
				histogram.red[i] = 0;
				histogram.green[i] = 0;
				histogram.blue[i] = 0;
			}

			let imageData = this.context.getImageData( 0, 0, this.$refs.ref_canvas.width, this.$refs.ref_canvas.height );
			let pixels = imageData.data;	// De la información obtenida, obtenemos los pixeles para manipularlos
			let numPixels = imageData.width * imageData.height;	// Se calcula el número de pixeles a procesar

			for( let i = 0; i < numPixels; i++ ){
				let position = i*4;

				histogram.red[pixels[position]] += 1;
				histogram.green[pixels[position+1]] += 1;
				histogram.blue[pixels[position+2]] += 1;
			}

			for( let i = 0; i <= 255; i++ ){
				let positionRed = { x: i, y: histogram.red[i] }
				let positionGreen = { x: i, y: histogram.green[i] }
				let positionBlue = { x: i, y: histogram.blue[i] }

				histogram.red[i] = positionRed;
				histogram.green[i] = positionGreen;
				histogram.blue[i] = positionBlue;
			}

			let chart = new CanvasJS.Chart("canvas_chart", {
				animationEnabled: true,
				theme: "light2",
				backgroundColor: "transparent",
				title: {
					text: "Histograma de la imagen Original",
					fontFamily: "Unica One",
					fontSize: 20
				},
				axisX: {
					title: "Intensidad",
					titleFontFamily: "Unica One",
					titleFontSize: 19,
					includeZero: true,
					minimum: 0,
					maximum: 255
				},
				axisY: {
					title: "Pixeles",
					titleFontFamily: "Unica One",
					titleFontSize: 19,
					includeZero: true
				},
				legend: {
					verticalAlign: "top",
					horizontalAlign: "right",
					dockInsidePlotArea: false
				},
				toolTip: {
					shared: true
				},
				data: [{
					name: "Red",
					showInLegend: true,
					legendMarkerType: "square",
					type: "area",
					color: "rgba(255,0,0,0.33)",
					markerSize: 0,
					dataPoints: histogram.red
				},
				{
					name: "Green",
					showInLegend: true,
					legendMarkerType: "square",
					type: "area",
					color: "rgba(0,255,0,0.33)",
					markerSize: 0,
					dataPoints: histogram.green
				},
				{
					name: "Blue",
					showInLegend: true,
					legendMarkerType: "square",
					type: "area",
					color: "rgba(0,0,255,0.33)",
					markerSize: 0,
					dataPoints: histogram.blue
				}]
			});

			chart.render();
		},

		changeViewButtonBack: function(){
			let imageData = this.context.getImageData( 0, 0, this.$refs.ref_canvas.width, this.$refs.ref_canvas.height );
			let pixels = imageData.data;
			let numPixels = imageData.width * imageData.height;

			for( let i = 0; i < numPixels; i++ ){
				let position = i*4;

				pixels[position] = this.pixels_backup[position];
				pixels[position+1] = this.pixels_backup[position+1];
				pixels[position+2] = this.pixels_backup[position+2];
			}

			this.context.putImageData( imageData, 0, 0 );

			this.pixels_backup = null;
			this.view_button_back = false;

			this.updateHistogram();
		},

		getAxesIniEnd: function( x, y ){
			let newX, newY, newI, newJ, newI2, newJ2;

			if( x < 0 ){
				newJ = 0;
				newJ2 = Math.abs( x );
				if( original_image.width+Math.abs( x ) < this.second_image.width ){
					newX = original_image.width;
				}else{
					newX = this.second_image.width - Math.abs( x );
				}
			}else{
				newJ = Math.abs( x );
				newJ2 = 0;
				if( this.second_image.width+x > original_image.width ){
					newX = original_image.width;
				}else{
					newX = this.second_image.width + x;
				}
			}

			if( y < 0 ){
				newI = 0;
				newI2 = Math.abs( y );
				if( original_image.width+Math.abs( y ) < this.second_image.height ){
					newY = original_image.height;
				}else{
					newY = this.second_image.height - Math.abs( y );
				}
			}else{
				newI = Math.abs( y );
				newI2 = 0;
				if( this.second_image.height+y < original_image.height ){
					newY = this.second_image.height + y;
				}else{
					newY = original_image.height;
				}
			}

			return {
				x: newX,
				y: newY,
				i: newI,
				j: newJ,
				i2: newI2,
				j2: newJ2
			};
		},

		verify_number: function(){
			if( this.x_plus_value > original_image.width ){
				this.x_plus_value = original_image.width;
			}else if( this.x_plus_value < -original_image.width ){
				this.x_plus_value = -original_image.width;
			}

			if( this.y_plus_value > original_image.height ){
				this.y_plus_value = original_image.height;
			}else if( this.y_plus_value < -original_image.height ){
				this.y_plus_value = -original_image.height;
			}
		},

		to_gray: function(){	// Función para escalar a grises
			// Se obtiene la información de la imagen que está en el contexto del canvas
			let imageData = this.context.getImageData( 0, 0, this.$refs.ref_canvas.width, this.$refs.ref_canvas.height );
			let pixels = imageData.data;	// De la información obtenida, obtenemos los pixeles para manipularlos
			let numPixels = imageData.width * imageData.height;	// Se calcula el número de pixeles a procesar

			this.pixels_backup = imageData.data.slice();

			// Se recorre pixel por pixel de la imagen cómo un arreglo en vez de matriz
			for( let i = 0; i < numPixels; i++ ){
				let r = pixels[i*4];	// Obtenemos el canal r del pixel
				let g = pixels[i*4+1];	// Obtenemos el canal g del pixel
				let b = pixels[i*4+2];	// Obtenemos el canal b del pixel
				// Se multiplica por 4, ya que se considera rgba, por lo que el 4 valor es alpha

				let gris = (r+g+b)/3;	// Obtenemos el nivel de gris a través del promedio

				pixels[i*4] = gris;		// Asignamos el color gris en el canal r del pixel
				pixels[i*4+1] = gris;	// Asignamos el color gris en el canal g del pixel
				pixels[i*4+2] = gris;	// Asignamos el color gris en el canal b del pixel
			}

			// Se redibuja la imagen procesada en el canvas
			this.context.putImageData( imageData, 0, 0 );
			this.view_button_back = true;

			this.updateHistogram();
		},

		to_binary: function(){	// Función para binarizar con respecto a un umbral
			this.to_gray();	// Se convierte a gris la imagen

			let imageData = this.context.getImageData( 0, 0, this.$refs.ref_canvas.width, this.$refs.ref_canvas.height );
			let pixels = imageData.data;
			let numPixels = imageData.width * imageData.height;

			this.pixels_backup = imageData.data.slice();

			for( let i = 0; i < numPixels; i++ ){
				// Se compara el valor del pixel con el del umbral en slider
				if( pixels[i*4] > parseInt( this.umbral_binarizado ) ){
					// En caso de que el valor del pixel sea mayor al umbral se asigna 255 en los 3 canales
					pixels[i*4] = 255;
					pixels[i*4+1] = 255;
					pixels[i*4+2] = 255;
				}else{
					// En caso de que el valor del pixel sea menor al umbral se asigna 0 en los 3 canales
					pixels[i*4] = 0;
					pixels[i*4+1] = 0;
					pixels[i*4+2] = 0;
				}
			}

			this.context.putImageData( imageData, 0, 0 );
			this.view_button_back = true;

			this.updateHistogram();
		},

		to_negative: function(){	// Función para obtener el negativo de la imagen
			let imageData = this.context.getImageData( 0, 0, this.$refs.ref_canvas.width, this.$refs.ref_canvas.height );
			let pixels = imageData.data;
			let numPixels = imageData.width * imageData.height;

			this.pixels_backup = imageData.data.slice();

			for( let i = 0; i < numPixels; i++ ){
				let r = pixels[i*4];
				let g = pixels[i*4+1];
				let b = pixels[i*4+2];

				pixels[i*4] = 255 - r;		// Al valor 255 se le resta el valor del canal r
				pixels[i*4+1] = 255 - g;	// Al valor 255 se le resta el valor del canal g
				pixels[i*4+2] = 255 - b;	// Al valor 255 se le resta el valor del canal b
			}

			this.context.putImageData( imageData, 0, 0 );
			this.view_button_back = true;

			this.updateHistogram();
		},

		plus_images: function(){
			// Obtención de la información de la primer y segunda imagen
			let imageDataOriginal = this.context.getImageData( 0, 0, this.$refs.ref_canvas.width, this.$refs.ref_canvas.height );
			let imageDataSecond = this.context2.getImageData( 0, 0, this.canvas2.width, this.canvas2.height );
			let pixelsOriginal = imageDataOriginal.data;
			let pixelsSecond = imageDataSecond.data;
			let numPixelsOriginal = imageDataOriginal.width * imageDataOriginal.height;
			let numPixelsSecond = imageDataSecond.width * imageDataSecond.height;

			this.pixels_backup = imageDataOriginal.data.slice();

			// Obtención del pixel de incio y fin tanto en el eje Y cómo el eje X
			let axes = this.getAxesIniEnd( parseInt(this.x_plus_value), parseInt(this.y_plus_value) );

			// Se reccorre desde los pixeles en donde se debe manipular
			let i2 = axes.i2;
			for( let i = axes.i; i < axes.y; i++, i2++ ){
				let j2 = axes.j2;
				for( let j = axes.j; j < axes.x; j++, j2++ ){
					let indexOriginal = (original_image.width * i + j) * 4;
					let indexSecond = (this.second_image.width * i2 + j2) * 4;

					// Suma con un 50% de transparencia cada imagen
					pixelsOriginal[indexOriginal] = (pixelsOriginal[indexOriginal] + pixelsSecond[indexSecond]) / 2;
					pixelsOriginal[indexOriginal+1] = (pixelsOriginal[indexOriginal+1] + pixelsSecond[indexSecond+1]) / 2;
					pixelsOriginal[indexOriginal+2] = (pixelsOriginal[indexOriginal+2] + pixelsSecond[indexSecond+2]) / 2;
				}
			}

			this.context.putImageData( imageDataOriginal, 0, 0 );
			this.view_button_back = true;

			this.updateHistogram();
		},

		substract_images: function(){
			// Obtención de la información de la primer y segunda imagen
			let imageDataOriginal = this.context.getImageData( 0, 0, this.$refs.ref_canvas.width, this.$refs.ref_canvas.height );
			let imageDataSecond = this.context2.getImageData( 0, 0, this.canvas2.width, this.canvas2.height );
			let pixelsOriginal = imageDataOriginal.data;
			let pixelsSecond = imageDataSecond.data;
			let numPixelsOriginal = imageDataOriginal.width * imageDataOriginal.height;
			let numPixelsSecond = imageDataSecond.width * imageDataSecond.height;

			this.pixels_backup = imageDataOriginal.data.slice();

			// Obtención del pixel de incio y fin tanto en el eje Y cómo el eje X
			let axes = this.getAxesIniEnd( parseInt(this.x_subs_value), parseInt(this.y_subs_value) );

			// Se reccorre desde los pixeles en donde se debe manipular
			let i2 = axes.i2;
			for( let i = axes.i; i < axes.y; i++, i2++ ){
				let j2 = axes.j2;
				for( let j = axes.j; j < axes.x; j++, j2++ ){
					let indexOriginal = (original_image.width * i + j) * 4;
					let indexSecond = (this.second_image.width * i2 + j2) * 4;

					// Resta de imagenes respetando el rango de salida
					pixelsOriginal[indexOriginal] = 127 + ((pixelsOriginal[indexOriginal] - pixelsSecond[indexSecond]) / 2);
					pixelsOriginal[indexOriginal+1] = 127 + ((pixelsOriginal[indexOriginal+1] - pixelsSecond[indexSecond+1]) / 2);
					pixelsOriginal[indexOriginal+2] = 127 + ((pixelsOriginal[indexOriginal+2] - pixelsSecond[indexSecond+2]) / 2);
				}
			}

			this.context.putImageData( imageDataOriginal, 0, 0 );
			this.view_button_back = true;

			this.updateHistogram();
		},

		and_pixel: function( pixel1, pixel2 ){
			// Obtención del pixel en base 2 (binario)
			pixel1 = pixel1.toString( 2 );
			pixel2 = pixel2.toString( 2 );

			// Completado del pixel 1
			if( pixel1.length < 8 ){
				let length = 8 - pixel1.length;
				for( let i = 0; i < length; i++ ){
					pixel1 = "0" + pixel1;
				}
			}

			// Completado del pixel 2
			if( pixel2.length < 8 ){
				let length = 8 - pixel2.length;
				for( let i = 0; i < length; i++ ){
					pixel2 = "0" + pixel2;
				}
			}

			// Comparación AND de cada bit de los pixeles
			let pixelResul = "";
			for( let i = 0; i < 8; i++ ){
				if( pixel1.charAt( i ) == 1 && pixel2.charAt( i ) == 1 ){
					pixelResul += "1";
				}else{
					pixelResul += "0";
				}
			}

			// Retorno del pixel resultante en base 10
			return parseInt( pixelResul, 2 );
		},

		and_images: function(){
			// Obtención de la información de la primer y segunda imagen
			let imageDataOriginal = this.context.getImageData( 0, 0, this.$refs.ref_canvas.width, this.$refs.ref_canvas.height );
			let imageDataSecond = this.context2.getImageData( 0, 0, this.canvas2.width, this.canvas2.height );
			let pixelsOriginal = imageDataOriginal.data;
			let pixelsSecond = imageDataSecond.data;
			let numPixelsOriginal = imageDataOriginal.width * imageDataOriginal.height;
			let numPixelsSecond = imageDataSecond.width * imageDataSecond.height;

			this.pixels_backup = imageDataOriginal.data.slice();

			// Obtención del pixel de incio y fin tanto en el eje Y cómo el eje X
			let axes = this.getAxesIniEnd( parseInt(this.x_and_value), parseInt(this.y_and_value) );

			// Se reccorre desde los pixeles en donde se debe manipular
			let i2 = axes.i2;
			for( let i = axes.i; i < axes.y; i++, i2++ ){
				let j2 = axes.j2;
				for( let j = axes.j; j < axes.x; j++, j2++ ){
					let indexOriginal = (original_image.width * i + j) * 4;
					let indexSecond = (this.second_image.width * i2 + j2) * 4;

					// Asignación del resultado de la operación AND entre pixeles X,Y a nivel de bit
					pixelsOriginal[indexOriginal] = this.and_pixel( pixelsOriginal[indexOriginal], pixelsSecond[indexSecond] );
					pixelsOriginal[indexOriginal+1] = this.and_pixel( pixelsOriginal[indexOriginal+1], pixelsSecond[indexSecond+1] );
					pixelsOriginal[indexOriginal+2] = this.and_pixel( pixelsOriginal[indexOriginal+2], pixelsSecond[indexSecond+2] );
				}
			}

			this.context.putImageData( imageDataOriginal, 0, 0 );
			this.view_button_back = true;

			this.updateHistogram();
		},

		or_pixel: function( pixel1, pixel2 ){
			// Obtención del pixel en base 2 (binario)
			pixel1 = pixel1.toString( 2 );
			pixel2 = pixel2.toString( 2 );

			// Completado del pixel 1
			if( pixel1.length < 8 ){
				let length = 8 - pixel1.length;
				for( let i = 0; i < length; i++ ){
					pixel1 = "0" + pixel1;
				}
			}

			// Completado del pixel 2
			if( pixel2.length < 8 ){
				let length = 8 - pixel2.length;
				for( let i = 0; i < length; i++ ){
					pixel2 = "0" + pixel2;
				}
			}

			// Comparación OR de cada bit de los pixeles
			let pixelResul = "";
			for( let i = 0; i < 8; i++ ){
				if( pixel1.charAt( i ) == 1 || pixel2.charAt( i ) == 1 ){
					pixelResul += "1";
				}else{
					pixelResul += "0";
				}
			}

			// Retorno del pixel resultante en base 10
			return parseInt( pixelResul, 2 );
		},

		or_images: function(){
			// Obtención de la información de la primer y segunda imagen
			let imageDataOriginal = this.context.getImageData( 0, 0, this.$refs.ref_canvas.width, this.$refs.ref_canvas.height );
			let imageDataSecond = this.context2.getImageData( 0, 0, this.canvas2.width, this.canvas2.height );
			let pixelsOriginal = imageDataOriginal.data;
			let pixelsSecond = imageDataSecond.data;
			let numPixelsOriginal = imageDataOriginal.width * imageDataOriginal.height;
			let numPixelsSecond = imageDataSecond.width * imageDataSecond.height;

			this.pixels_backup = imageDataOriginal.data.slice();

			// Obtención del pixel de incio y fin tanto en el eje Y cómo el eje X
			let axes = this.getAxesIniEnd( parseInt(this.x_or_value), parseInt(this.y_or_value) );

			// Se reccorre desde los pixeles en donde se debe manipular
			let i2 = axes.i2;
			for( let i = axes.i; i < axes.y; i++, i2++ ){
				let j2 = axes.j2;
				for( let j = axes.j; j < axes.x; j++, j2++ ){
					let indexOriginal = (original_image.width * i + j) * 4;
					let indexSecond = (this.second_image.width * i2 + j2) * 4;

					// Asignación del resultado de la operación OR entre pixeles X,Y a nivel de bit
					pixelsOriginal[indexOriginal] = this.or_pixel( pixelsOriginal[indexOriginal], pixelsSecond[indexSecond] );
					pixelsOriginal[indexOriginal+1] = this.or_pixel( pixelsOriginal[indexOriginal+1], pixelsSecond[indexSecond+1] );
					pixelsOriginal[indexOriginal+2] = this.or_pixel( pixelsOriginal[indexOriginal+2], pixelsSecond[indexSecond+2] );
				}
			}

			this.context.putImageData( imageDataOriginal, 0, 0 );
			this.view_button_back = true;

			this.updateHistogram();
		},

		displace_histogram: function(){
			let imageData = this.context.getImageData( 0, 0, this.$refs.ref_canvas.width, this.$refs.ref_canvas.height );
			let pixels = imageData.data;	// De la información obtenida, obtenemos los pixeles para manipularlos
			let numPixels = imageData.width * imageData.height;	// Se calcula el número de pixeles a procesar

			this.pixels_backup = imageData.data.slice();

			// Se recorre pixel por pixel de la imagen cómo un arreglo en vez de matriz
			for( let i = 0; i < numPixels; i++ ){
				let position = i*4;
				let displace = parseInt( this.const_value );

				if( (pixels[position] + displace) > 255 ){
					pixels[position] = 255
				}else if( (pixels[position] + displace) < 0 ){
					pixels[position] = 0
				}else{
					pixels[position] += displace;
				}

				if( (pixels[position+1] + displace) > 255 ){
					pixels[position+1] = 255
				}else if( (pixels[position+1] + displace) < 0 ){
					pixels[position+1] = 0
				}else{
					pixels[position+1] += displace;
				}

				if( (pixels[position+2] + displace) > 255 ){
					pixels[position+2] = 255
				}else if( (pixels[position+2] + displace) < 0 ){
					pixels[position+2] = 0
				}else{
					pixels[position+2] += displace;
				}
			}

			// Se redibuja la imagen procesada en el canvas
			this.context.putImageData( imageData, 0, 0 );
			this.view_button_back = true;

			this.updateHistogram();
		},

		getMax: function( histograma ){
			for( let i = 255; i >= 0; i-- ){
				if( histograma[i].y != 0 ){
					return histograma[i].x;
				}
			}
		},

		getMin: function( histograma ){
			for( let i = 0; i <= 255; i++ ){
				if( histograma[i].y != 0 ){
					return histograma[i].x;
				}
			}
		},

		verify_expand_numbers_histogram: function(){
			if( this.exp_max_value > 255 ){
				this.exp_max_value = 255;
			}else if( this.exp_min_value < 0 ){
				this.exp_min_value = 0;
			}
		},

		expand_histogram: function(){
			let imageData = this.context.getImageData( 0, 0, this.$refs.ref_canvas.width, this.$refs.ref_canvas.height );
			let pixels = imageData.data;	// De la información obtenida, obtenemos los pixeles para manipularlos
			let numPixels = imageData.width * imageData.height;	// Se calcula el número de pixeles a procesar

			this.pixels_backup = imageData.data.slice();

			let maxRed = this.getMax( histogram.red );
			let minRed = this.getMin( histogram.red );
			let maxGreen = this.getMax( histogram.green );
			let minGreen = this.getMin( histogram.green );
			let maxBlue = this.getMax( histogram.blue );
			let minBlue = this.getMin( histogram.blue );

			let MAX = parseInt(this.exp_max_value);
			let MIN = parseInt(this.exp_min_value);

			for( let i = 0; i < numPixels; i++ ){
				let position = i * 4;

				pixels[position] = ( (pixels[position] - minRed)/(maxRed - minRed) ) * ( MAX - MIN ) + MIN;
				pixels[position+1] = ( (pixels[position+1] - minGreen)/(maxGreen - minGreen) ) * ( MAX - MIN ) + MIN;
				pixels[position+2] = ( (pixels[position+2] - minBlue)/(maxBlue - minBlue) ) * ( MAX - MIN ) + MIN;
			}

			this.context.putImageData( imageData, 0, 0 );
			this.view_button_back = true;

			this.updateHistogram();
		},

		verify_contract_numbers_histogram: function(){
			if( this.cont_max_value > 255 ){
				this.cont_max_value = 255;
			}else if( this.cont_min_value < 0 ){
				this.cont_min_value = 0;
			}
		},

		contract_histogram: function(){
			let imageData = this.context.getImageData( 0, 0, this.$refs.ref_canvas.width, this.$refs.ref_canvas.height );
			let pixels = imageData.data;	// De la información obtenida, obtenemos los pixeles para manipularlos
			let numPixels = imageData.width * imageData.height;	// Se calcula el número de pixeles a procesar

			this.pixels_backup = imageData.data.slice();

			let maxRed = this.getMax( histogram.red );
			let minRed = this.getMin( histogram.red );
			let maxGreen = this.getMax( histogram.green );
			let minGreen = this.getMin( histogram.green );
			let maxBlue = this.getMax( histogram.blue );
			let minBlue = this.getMin( histogram.blue );

			let cmax = parseInt(this.cont_max_value);
			let cmin = parseInt(this.cont_min_value);

			for( let i = 0; i < numPixels; i++ ){
				let position = i * 4;

				pixels[position] = ( (cmax - cmin)/(maxRed - minRed) ) * ( pixels[position] - minRed ) + cmin;
				pixels[position+1] = ( (cmax - cmin)/(maxGreen - minGreen) ) * ( pixels[position+1] - minGreen ) + cmin;
				pixels[position+2] = ( (cmax - cmin)/(maxBlue - minBlue) ) * ( pixels[position+2] - minBlue ) + cmin;
			}

			this.context.putImageData( imageData, 0, 0 );
			this.view_button_back = true;

			this.updateHistogram();
		},

		verify_alpha_ray: function(){
			if( this.alpha_ray_value > 5 ){
				this.alpha_ray_value = 5;
			}else if( this.alpha_ray_value < 0 ){
				this.alpha_ray_value = 0;
			}
		},

		getProbability: function( histograma, numPixels ){
			let probability = [];

			for( let i = 0; i <= 255; i++ ){
				probability.push( (histograma[i].y)/numPixels );
			}

			return probability;
		},

		getCumulativeProbability: function( probability ){
			let cumulativeProbability = [];

			cumulativeProbability.push( probability[0] );

			for( let i = 1; i <= 255; i++ ){
				cumulativeProbability.push( cumulativeProbability[i-1] + probability[i] );
			}

			return cumulativeProbability;
		},

		uniform: function(){
			let imageData = this.context.getImageData( 0, 0, this.$refs.ref_canvas.width, this.$refs.ref_canvas.height );
			let pixels = imageData.data;	// De la información obtenida, obtenemos los pixeles para manipularlos
			let numPixels = imageData.width * imageData.height;	// Se calcula el número de pixeles a procesar

			this.pixels_backup = imageData.data.slice();

			let probabilityRed = this.getProbability( histogram.red, numPixels );
			let probabilityGreen = this.getProbability( histogram.green, numPixels );
			let probabilityBlue = this.getProbability( histogram.blue, numPixels );

			let cumulativeProbabilityRed = this.getCumulativeProbability( probabilityRed );
			let cumulativeProbabilityGreen = this.getCumulativeProbability( probabilityGreen );
			let cumulativeProbabilityBlue = this.getCumulativeProbability( probabilityBlue );

			let minRed = this.getMin( histogram.red );
			let minGreen = this.getMin( histogram.green );
			let minBlue = this.getMin( histogram.blue );
			let maxRed = this.getMax( histogram.red );
			let maxGreen = this.getMax( histogram.green );
			let maxBlue = this.getMax( histogram.blue );

			for( let i = 0; i < numPixels; i++ ){
				let position = i * 4;

				pixels[position] = (maxRed - minRed) * cumulativeProbabilityRed[pixels[position]] + minRed;
				pixels[position+1] = (maxGreen - minGreen) * cumulativeProbabilityGreen[pixels[position+1]] + minGreen;
				pixels[position+2] = (maxBlue - minBlue) * cumulativeProbabilityBlue[pixels[position+2]] + minBlue;
			}

			this.context.putImageData( imageData, 0, 0 );
			this.view_button_back = true;

			this.updateHistogram();
		},

		rayleigh: function(){
			let imageData = this.context.getImageData( 0, 0, this.$refs.ref_canvas.width, this.$refs.ref_canvas.height );
			let pixels = imageData.data;	// De la información obtenida, obtenemos los pixeles para manipularlos
			let numPixels = imageData.width * imageData.height;	// Se calcula el número de pixeles a procesar

			this.pixels_backup = imageData.data.slice();

			let probabilityRed = this.getProbability( histogram.red, numPixels );
			let probabilityGreen = this.getProbability( histogram.green, numPixels );
			let probabilityBlue = this.getProbability( histogram.blue, numPixels );

			let cumulativeProbabilityRed = this.getCumulativeProbability( probabilityRed );
			let cumulativeProbabilityGreen = this.getCumulativeProbability( probabilityGreen );
			let cumulativeProbabilityBlue = this.getCumulativeProbability( probabilityBlue );

			let minRed = this.getMin( histogram.red );
			let minGreen = this.getMin( histogram.green );
			let minBlue = this.getMin( histogram.blue );

			let alpha = Number( this.alpha_ray_value );

			for( let i = 0; i < numPixels; i++ ){
				let position = i * 4;

				pixels[position] = minRed + Math.sqrt( 2 * alpha*alpha * Math.log10(1/(1 + cumulativeProbabilityRed[pixels[position]])) );
				pixels[position+1] = minGreen + Math.sqrt( 2 * alpha*alpha * Math.log10(1/(1 + cumulativeProbabilityGreen[pixels[position+1]])) );
				pixels[position+2] = minBlue + Math.sqrt( 2 * alpha*alpha * Math.log10(1/(1 + cumulativeProbabilityBlue[pixels[position+2]])) );
			}

			this.context.putImageData( imageData, 0, 0 );
			this.view_button_back = true;

			this.updateHistogram();
		},

		hypercubic: function(){
			let imageData = this.context.getImageData( 0, 0, this.$refs.ref_canvas.width, this.$refs.ref_canvas.height );
			let pixels = imageData.data;	// De la información obtenida, obtenemos los pixeles para manipularlos
			let numPixels = imageData.width * imageData.height;	// Se calcula el número de pixeles a procesar

			this.pixels_backup = imageData.data.slice();

			let probabilityRed = this.getProbability( histogram.red, numPixels );
			let probabilityGreen = this.getProbability( histogram.green, numPixels );
			let probabilityBlue = this.getProbability( histogram.blue, numPixels );

			let cumulativeProbabilityRed = this.getCumulativeProbability( probabilityRed );
			let cumulativeProbabilityGreen = this.getCumulativeProbability( probabilityGreen );
			let cumulativeProbabilityBlue = this.getCumulativeProbability( probabilityBlue );

			let minRed = this.getMin( histogram.red );
			let minGreen = this.getMin( histogram.green );
			let minBlue = this.getMin( histogram.blue );
			let maxRed = this.getMax( histogram.red );
			let maxGreen = this.getMax( histogram.green );
			let maxBlue = this.getMax( histogram.blue );

			for( let i = 0; i < numPixels; i++ ){
				let position = i * 4;

				pixels[position] = Math.pow((( Math.pow(maxRed, 1/3) - Math.pow(minRed, 1/3) ) * cumulativeProbabilityRed[pixels[position]]) + ( Math.pow(minRed, 1/3) ), 3);
				pixels[position+1] = Math.pow((( Math.pow(maxGreen, 1/3) - Math.pow(minGreen, 1/3) ) * cumulativeProbabilityRed[pixels[position+1]]) + ( Math.pow(minGreen, 1/3) ), 3);
				pixels[position+2] = Math.pow((( Math.pow(maxBlue, 1/3) - Math.pow(minBlue, 1/3) ) * cumulativeProbabilityRed[pixels[position+2]]) + ( Math.pow(minBlue, 1/3) ), 3);
			}

			this.context.putImageData( imageData, 0, 0 );
			this.view_button_back = true;

			this.updateHistogram();
		},

		log_hyperbolic: function(){
			let imageData = this.context.getImageData( 0, 0, this.$refs.ref_canvas.width, this.$refs.ref_canvas.height );
			let pixels = imageData.data;	// De la información obtenida, obtenemos los pixeles para manipularlos
			let numPixels = imageData.width * imageData.height;	// Se calcula el número de pixeles a procesar

			this.pixels_backup = imageData.data.slice();

			let probabilityRed = this.getProbability( histogram.red, numPixels );
			let probabilityGreen = this.getProbability( histogram.green, numPixels );
			let probabilityBlue = this.getProbability( histogram.blue, numPixels );

			let cumulativeProbabilityRed = this.getCumulativeProbability( probabilityRed );
			let cumulativeProbabilityGreen = this.getCumulativeProbability( probabilityGreen );
			let cumulativeProbabilityBlue = this.getCumulativeProbability( probabilityBlue );

			let minRed = this.getMin( histogram.red );
			let minGreen = this.getMin( histogram.green );
			let minBlue = this.getMin( histogram.blue );
			let maxRed = this.getMax( histogram.red );
			let maxGreen = this.getMax( histogram.green );
			let maxBlue = this.getMax( histogram.blue );

			for( let i = 0; i < numPixels; i++ ){
				let position = i * 4;

				pixels[position] = minRed * ( maxRed / minRed ) * cumulativeProbabilityRed[pixels[position]];
				pixels[position+1] = minGreen * ( maxGreen / minGreen ) * cumulativeProbabilityGreen[pixels[position+1]];
				pixels[position+2] = minBlue * ( maxBlue / minBlue ) * cumulativeProbabilityBlue[pixels[position+2]];
			}

			this.context.putImageData( imageData, 0, 0 );
			this.view_button_back = true;

			this.updateHistogram();
		}
	}
});

let behavior_main_load = new Vue({
	el: '#behavior_main_load',

	data: {
		view_icon_loadImage: true,
	},

	methods: {
		upload_image: function( event ){	// Función para subir la imagen
			let file = this.$refs.ref_input_file.files[0];	// Obtenemos la ruta de la imagen a cargar
			let reader = new FileReader();	// Creamos un objeto de tipo FileReader

			if( reader ){
				reader.readAsDataURL( file );	// Se lee la información de la imagen con base a la ruta del archivo
				reader.onload = ( e ) => {	// Cuando se termine de leer la información
					original_image.name = file.name;	// Asignamos el nombre de la imagen
					original_image.src = reader.result;	// Asignamos la información de la imagen

					original_image.onload = () =>{	// Cuando se termine de subir la imagen
						// Mandamos a cargar la imagen en el canvas
						behavior_main_image.load_image( original_image.width, original_image.height );
					}
				}
			}

			this.change_views( file.name );	// Se haces los cambios de vista con el nombre de la imagen
		},

		change_views: function( name_file ){	// Función para cambiar la vista
			behavior_header.name_file = name_file;
			behavior_header.view_name = true;

			this.view_icon_loadImage = false;
			
			behavior_main_image.view_main_images = true;
		}
	}
});