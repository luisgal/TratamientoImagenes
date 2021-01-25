let original_image = new Image();	// Imagen principal

// Datos del histograma (de los 3 canales) de la imagen principal
let histogram = {
	red: [],
	green: [],
	blue: []
}

// Seteo principal de los histogramas
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

		// Función para cerrar la imagen y resetear los datos
		close_image: function(){
			this.name_file = null;
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
		mean_hard_value: 0,
		desviacion_value: 1,
		size_mask_mean_value: 3,
		size_mask_gauss_value: 3,

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

			this.updateHistogram();	// Se actualiza el histograma
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

		updateHistogram: function(){	// Función para actualizar el gráfico del histograma
			// Se reinicia los datos del histograma
			for( let i = 0; i <= 255; i++ ){
				histogram.red[i] = 0;
				histogram.green[i] = 0;
				histogram.blue[i] = 0;
			}

			let imageData = this.context.getImageData( 0, 0, this.$refs.ref_canvas.width, this.$refs.ref_canvas.height );
			let pixels = imageData.data;	// De la información obtenida, obtenemos los pixeles para manipularlos
			let numPixels = imageData.width * imageData.height;	// Se calcula el número de pixeles a procesar

			// Se cuenta aumenta en uno la cantidad de valores con ese nivel de gris
			for( let i = 0; i < numPixels; i++ ){
				let position = i*4;

				histogram.red[pixels[position]] += 1;
				histogram.green[pixels[position+1]] += 1;
				histogram.blue[pixels[position+2]] += 1;
			}

			// Se generan los datos para utilzarlos en el histograma de CANVASJS
			for( let i = 0; i <= 255; i++ ){
				let positionRed = { x: i, y: histogram.red[i] }
				let positionGreen = { x: i, y: histogram.green[i] }
				let positionBlue = { x: i, y: histogram.blue[i] }

				histogram.red[i] = positionRed;
				histogram.green[i] = positionGreen;
				histogram.blue[i] = positionBlue;
			}

			// Creación y seteado del gráfico del histograma (revisar documentación en canvasjs)
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

			chart.render();	// Renderización del gráfico
		},

		changeViewButtonBack: function(){	// Función del boton de deshacer acción
			// Obtención de la información de la imagen principal
			let imageData = this.context.getImageData( 0, 0, this.$refs.ref_canvas.width, this.$refs.ref_canvas.height );
			let pixels = imageData.data;
			let numPixels = imageData.width * imageData.height;

			// Se asignan los pixeles de respaldo a la imagen principal
			for( let i = 0; i < numPixels; i++ ){
				let position = i*4;

				pixels[position] = this.pixels_backup[position];
				pixels[position+1] = this.pixels_backup[position+1];
				pixels[position+2] = this.pixels_backup[position+2];
			}

			this.context.putImageData( imageData, 0, 0 );

			// Se limpian los pixeles de respaldo y se cambia la vista del boton
			this.pixels_backup = null;
			this.view_button_back = false;

			this.updateHistogram();	// Se actualiza el histograma
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

			this.pixels_backup = imageData.data.slice();	// Se hace un respaldo de la información de los pixeles

			// Se recorre pixel por pixel de la imagen cómo un arreglo en vez de matriz
			for( let i = 0; i < numPixels; i++ ){
				let r = pixels[i*4];	// Obtenemos el canal r del pixel
				let g = pixels[i*4+1];	// Obtenemos el canal g del pixel
				let b = pixels[i*4+2];	// Obtenemos el canal b del pixel
				// Se multiplica por 4, ya que se considera rgba, por lo que el 4 valor es alpha

				//let gris = (r+g+b)/3;	// Obtenemos el nivel de gris a través del promedio
				//let gris = (r*0.30) + (g*0.59) + (b*0.11);
				let gris = (r*0.33) + (g*0.52) + (b*0.15);

				pixels[i*4] = gris;		// Asignamos el color gris en el canal r del pixel
				pixels[i*4+1] = gris;	// Asignamos el color gris en el canal g del pixel
				pixels[i*4+2] = gris;	// Asignamos el color gris en el canal b del pixel
			}

			// Se redibuja la imagen procesada en el canvas
			this.context.putImageData( imageData, 0, 0 );
			this.view_button_back = true;

			this.updateHistogram();	// Se actualiza el histograma
		},

		to_binary: function(){	// Función para binarizar con respecto a un umbral
			this.to_gray();	// Se convierte a gris la imagen

			let imageData = this.context.getImageData( 0, 0, this.$refs.ref_canvas.width, this.$refs.ref_canvas.height );
			let pixels = imageData.data;
			let numPixels = imageData.width * imageData.height;

			this.pixels_backup = imageData.data.slice();	// Se hace un respaldo de la información de los pixeles

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

			this.updateHistogram();	// Se actualiza el histograma
		},

		to_negative: function(){	// Función para obtener el negativo de la imagen
			let imageData = this.context.getImageData( 0, 0, this.$refs.ref_canvas.width, this.$refs.ref_canvas.height );
			let pixels = imageData.data;
			let numPixels = imageData.width * imageData.height;

			this.pixels_backup = imageData.data.slice();	// Se hace un respaldo de la información de los pixeles

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

			this.updateHistogram();	// Se actualiza el histograma
		},

		plus_images: function(){	// Función para sumar dos imágenes
			// Obtención de la información de la primer y segunda imagen
			let imageDataOriginal = this.context.getImageData( 0, 0, this.$refs.ref_canvas.width, this.$refs.ref_canvas.height );
			let imageDataSecond = this.context2.getImageData( 0, 0, this.canvas2.width, this.canvas2.height );
			let pixelsOriginal = imageDataOriginal.data;
			let pixelsSecond = imageDataSecond.data;
			let numPixelsOriginal = imageDataOriginal.width * imageDataOriginal.height;
			let numPixelsSecond = imageDataSecond.width * imageDataSecond.height;

			this.pixels_backup = imageDataOriginal.data.slice();	// Se hace un respaldo de la información de los pixeles

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

			this.updateHistogram();	// Se actualiza el histograma
		},

		substract_images: function(){	// Función para restar dos imágenes
			// Obtención de la información de la primer y segunda imagen
			let imageDataOriginal = this.context.getImageData( 0, 0, this.$refs.ref_canvas.width, this.$refs.ref_canvas.height );
			let imageDataSecond = this.context2.getImageData( 0, 0, this.canvas2.width, this.canvas2.height );
			let pixelsOriginal = imageDataOriginal.data;
			let pixelsSecond = imageDataSecond.data;
			let numPixelsOriginal = imageDataOriginal.width * imageDataOriginal.height;
			let numPixelsSecond = imageDataSecond.width * imageDataSecond.height;

			this.pixels_backup = imageDataOriginal.data.slice();	// Se hace un respaldo de la información de los pixeles

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

			this.updateHistogram();	// Se actualiza el histograma
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

		and_images: function(imageDataOriginal, imageDataSecond){	// Función para hacer la operación AND entre dos imágenes
			let pixelsOriginal = imageDataOriginal.data;
			let pixelsSecond = imageDataSecond.data;

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

		},

		and_I: function(){
			// Obtención de la información de la primer y segunda imagen
			let imageDataOriginal = this.context.getImageData( 0, 0, this.$refs.ref_canvas.width, this.$refs.ref_canvas.height );
			let imageDataSecond = this.context2.getImageData( 0, 0, this.canvas2.width, this.canvas2.height );
			
			this.pixels_backup = imageDataOriginal.data.slice();	// Se hace un respaldo de la información de los pixeles

			this.and_images(imageDataOriginal, imageDataSecond);

			this.context.putImageData( imageDataOriginal, 0, 0 );
			this.view_button_back = true;

			this.updateHistogram();	// Se actualiza el histograma
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

		or_images: function(){	// Función para hacer la operación AND entre dos imágenes
			// Obtención de la información de la primer y segunda imagen
			let imageDataOriginal = this.context.getImageData( 0, 0, this.$refs.ref_canvas.width, this.$refs.ref_canvas.height );
			let imageDataSecond = this.context2.getImageData( 0, 0, this.canvas2.width, this.canvas2.height );
			let pixelsOriginal = imageDataOriginal.data;
			let pixelsSecond = imageDataSecond.data;
			let numPixelsOriginal = imageDataOriginal.width * imageDataOriginal.height;
			let numPixelsSecond = imageDataSecond.width * imageDataSecond.height;

			this.pixels_backup = imageDataOriginal.data.slice();	// Se hace un respaldo de la información de los pixeles

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

			this.updateHistogram();	// Se actualiza el histograma
		},

		displace_histogram: function(){	// Función para desplazar el histograma una determinada constante
			let imageData = this.context.getImageData( 0, 0, this.$refs.ref_canvas.width, this.$refs.ref_canvas.height );
			let pixels = imageData.data;	// De la información obtenida, obtenemos los pixeles para manipularlos
			let numPixels = imageData.width * imageData.height;	// Se calcula el número de pixeles a procesar

			this.pixels_backup = imageData.data.slice();	// Se hace un respaldo de la información de los pixeles

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

			this.updateHistogram();	// Se actualiza el histograma
		},

		getMax: function( histograma ){	// Función para obtener el valor máximo de un histograma
			for( let i = 255; i >= 0; i-- ){
				if( histograma[i].y != 0 ){
					return histograma[i].x;
				}
			}
		},

		getMin: function( histograma ){	// Función para obtener el valor minimo de un histograma
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

		// Función para expandir el histograma hasta los valores máximos y mínimos posibles (255 y 0)
		expand_histogram: function(){
			let imageData = this.context.getImageData( 0, 0, this.$refs.ref_canvas.width, this.$refs.ref_canvas.height );
			let pixels = imageData.data;	// De la información obtenida, obtenemos los pixeles para manipularlos
			let numPixels = imageData.width * imageData.height;	// Se calcula el número de pixeles a procesar

			this.pixels_backup = imageData.data.slice();	// Se hace un respaldo de la información de los pixeles

			// Obtención de los datos minimos y máximos de los histogramas en los 3 canales
			let maxRed = this.getMax( histogram.red );
			let minRed = this.getMin( histogram.red );
			let maxGreen = this.getMax( histogram.green );
			let minGreen = this.getMin( histogram.green );
			let maxBlue = this.getMax( histogram.blue );
			let minBlue = this.getMin( histogram.blue );

			// Valores máximos y mínimos posibles (255 y 0)
			let MAX = parseInt(this.exp_max_value);
			let MIN = parseInt(this.exp_min_value);

			// Aplicación de la formula en cada pixel y cada canal
			for( let i = 0; i < numPixels; i++ ){
				let position = i * 4;

				pixels[position] = ( (pixels[position] - minRed)/(maxRed - minRed) ) * ( MAX - MIN ) + MIN;
				pixels[position+1] = ( (pixels[position+1] - minGreen)/(maxGreen - minGreen) ) * ( MAX - MIN ) + MIN;
				pixels[position+2] = ( (pixels[position+2] - minBlue)/(maxBlue - minBlue) ) * ( MAX - MIN ) + MIN;
			}

			this.context.putImageData( imageData, 0, 0 );
			this.view_button_back = true;

			this.updateHistogram();	// Se actualiza el histograma
		},

		verify_contract_numbers_histogram: function(){
			if( this.cont_max_value > 255 ){
				this.cont_max_value = 255;
			}else if( this.cont_min_value < 0 ){
				this.cont_min_value = 0;
			}
		},

		// Función para contraer el histograma hasta los valores máximos y mínimos deseados
		contract_histogram: function(){
			let imageData = this.context.getImageData( 0, 0, this.$refs.ref_canvas.width, this.$refs.ref_canvas.height );
			let pixels = imageData.data;	// De la información obtenida, obtenemos los pixeles para manipularlos
			let numPixels = imageData.width * imageData.height;	// Se calcula el número de pixeles a procesar

			this.pixels_backup = imageData.data.slice();	// Se hace un respaldo de la información de los pixeles

			// Obtención de los datos minimos y máximos de los histogramas en los 3 canales
			let maxRed = this.getMax( histogram.red );
			let minRed = this.getMin( histogram.red );
			let maxGreen = this.getMax( histogram.green );
			let minGreen = this.getMin( histogram.green );
			let maxBlue = this.getMax( histogram.blue );
			let minBlue = this.getMin( histogram.blue );

			// Valores máximos y mínimos deseados en la escena
			let cmax = parseInt(this.cont_max_value);
			let cmin = parseInt(this.cont_min_value);

			// Aplicación de la formula en cada pixel y cada canal
			for( let i = 0; i < numPixels; i++ ){
				let position = i * 4;

				pixels[position] = ( (cmax - cmin)/(maxRed - minRed) ) * ( pixels[position] - minRed ) + cmin;
				pixels[position+1] = ( (cmax - cmin)/(maxGreen - minGreen) ) * ( pixels[position+1] - minGreen ) + cmin;
				pixels[position+2] = ( (cmax - cmin)/(maxBlue - minBlue) ) * ( pixels[position+2] - minBlue ) + cmin;
			}

			this.context.putImageData( imageData, 0, 0 );
			this.view_button_back = true;

			this.updateHistogram();	// Se actualiza el histograma
		},

		verify_alpha_ray: function(){
			if( this.alpha_ray_value > 5 ){
				this.alpha_ray_value = 5;
			}else if( this.alpha_ray_value < 0 ){
				this.alpha_ray_value = 0;
			}
		},

		// Función para obtener la probabilidad de ocurrencia dentro de un histograma
		getProbability: function( histograma, numPixels ){
			let probability = [];

			for( let i = 0; i <= 255; i++ ){
				probability.push( (histograma[i].y)/numPixels );
			}

			return probability;
		},

		// Función para obtener la probabilidad acumulativa de un histograma
		getCumulativeProbability: function( probability ){
			let cumulativeProbability = [];

			cumulativeProbability.push( probability[0] );

			for( let i = 1; i <= 255; i++ ){
				cumulativeProbability.push( cumulativeProbability[i-1] + probability[i] );
			}

			return cumulativeProbability;
		},

		uniform: function(){	// Función de ecualización uniforme
			let imageData = this.context.getImageData( 0, 0, this.$refs.ref_canvas.width, this.$refs.ref_canvas.height );
			let pixels = imageData.data;	// De la información obtenida, obtenemos los pixeles para manipularlos
			let numPixels = imageData.width * imageData.height;	// Se calcula el número de pixeles a procesar

			this.pixels_backup = imageData.data.slice();	// Se hace un respaldo de la información de los pixeles

			// Obtención de las probabilidades de cada intensidad de color
			let probabilityRed = this.getProbability( histogram.red, numPixels );
			let probabilityGreen = this.getProbability( histogram.green, numPixels );
			let probabilityBlue = this.getProbability( histogram.blue, numPixels );

			// Obtención de las probabilidades cumulativas de cada intensidad de color
			let cumulativeProbabilityRed = this.getCumulativeProbability( probabilityRed );
			let cumulativeProbabilityGreen = this.getCumulativeProbability( probabilityGreen );
			let cumulativeProbabilityBlue = this.getCumulativeProbability( probabilityBlue );

			// Obtención de los datos minimos y máximos de los histogramas en los 3 canales
			let minRed = this.getMin( histogram.red );
			let minGreen = this.getMin( histogram.green );
			let minBlue = this.getMin( histogram.blue );
			let maxRed = this.getMax( histogram.red );
			let maxGreen = this.getMax( histogram.green );
			let maxBlue = this.getMax( histogram.blue );

			// Aplicación de la formula en cada pixel y cada canal
			for( let i = 0; i < numPixels; i++ ){
				let position = i * 4;

				pixels[position] = (maxRed - minRed) * cumulativeProbabilityRed[pixels[position]] + minRed;
				pixels[position+1] = (maxGreen - minGreen) * cumulativeProbabilityGreen[pixels[position+1]] + minGreen;
				pixels[position+2] = (maxBlue - minBlue) * cumulativeProbabilityBlue[pixels[position+2]] + minBlue;
			}

			this.context.putImageData( imageData, 0, 0 );
			this.view_button_back = true;

			this.updateHistogram();	// Se actualiza el histograma
		},

		rayleigh: function(){	// Función de ecualización de Rayleigh
			let imageData = this.context.getImageData( 0, 0, this.$refs.ref_canvas.width, this.$refs.ref_canvas.height );
			let pixels = imageData.data;	// De la información obtenida, obtenemos los pixeles para manipularlos
			let numPixels = imageData.width * imageData.height;	// Se calcula el número de pixeles a procesar

			this.pixels_backup = imageData.data.slice();	// Se hace un respaldo de la información de los pixeles

			// Obtención de las probabilidades de cada intensidad de color
			let probabilityRed = this.getProbability( histogram.red, numPixels );
			let probabilityGreen = this.getProbability( histogram.green, numPixels );
			let probabilityBlue = this.getProbability( histogram.blue, numPixels );

			// Obtención de las probabilidades cumulativas de cada intensidad de color
			let cumulativeProbabilityRed = this.getCumulativeProbability( probabilityRed );
			let cumulativeProbabilityGreen = this.getCumulativeProbability( probabilityGreen );
			let cumulativeProbabilityBlue = this.getCumulativeProbability( probabilityBlue );

			// Obtención de los datos minimos de los histogramas en los 3 canales
			let minRed = this.getMin( histogram.red );
			let minGreen = this.getMin( histogram.green );
			let minBlue = this.getMin( histogram.blue );

			// Valor de alfa que se considera en la formula
			let alpha = Number( this.alpha_ray_value );

			// Aplicación de la formula en cada pixel y cada canal
			for( let i = 0; i < numPixels; i++ ){
				let position = i * 4;

				pixels[position] = minRed + Math.sqrt( 2 * alpha*alpha * Math.log10(1/(1 + cumulativeProbabilityRed[pixels[position]])) );
				pixels[position+1] = minGreen + Math.sqrt( 2 * alpha*alpha * Math.log10(1/(1 + cumulativeProbabilityGreen[pixels[position+1]])) );
				pixels[position+2] = minBlue + Math.sqrt( 2 * alpha*alpha * Math.log10(1/(1 + cumulativeProbabilityBlue[pixels[position+2]])) );
			}

			this.context.putImageData( imageData, 0, 0 );
			this.view_button_back = true;

			this.updateHistogram();	// Se actualiza el histograma
		},

		hypercubic: function(){	// Función de ecualización hipercúbica
			let imageData = this.context.getImageData( 0, 0, this.$refs.ref_canvas.width, this.$refs.ref_canvas.height );
			let pixels = imageData.data;	// De la información obtenida, obtenemos los pixeles para manipularlos
			let numPixels = imageData.width * imageData.height;	// Se calcula el número de pixeles a procesar

			this.pixels_backup = imageData.data.slice();	// Se hace un respaldo de la información de los pixeles

			// Obtención de las probabilidades de cada intensidad de color
			let probabilityRed = this.getProbability( histogram.red, numPixels );
			let probabilityGreen = this.getProbability( histogram.green, numPixels );
			let probabilityBlue = this.getProbability( histogram.blue, numPixels );

			// Obtención de las probabilidades cumulativas de cada intensidad de color
			let cumulativeProbabilityRed = this.getCumulativeProbability( probabilityRed );
			let cumulativeProbabilityGreen = this.getCumulativeProbability( probabilityGreen );
			let cumulativeProbabilityBlue = this.getCumulativeProbability( probabilityBlue );

			// Obtención de los datos minimos y máximos de los histogramas en los 3 canales
			let minRed = this.getMin( histogram.red );
			let minGreen = this.getMin( histogram.green );
			let minBlue = this.getMin( histogram.blue );
			let maxRed = this.getMax( histogram.red );
			let maxGreen = this.getMax( histogram.green );
			let maxBlue = this.getMax( histogram.blue );

			// Aplicación de la formula en cada pixel y cada canal
			for( let i = 0; i < numPixels; i++ ){
				let position = i * 4;

				pixels[position] = Math.pow((( Math.pow(maxRed, 1/3) - Math.pow(minRed, 1/3) ) * cumulativeProbabilityRed[pixels[position]]) + ( Math.pow(minRed, 1/3) ), 3);
				pixels[position+1] = Math.pow((( Math.pow(maxGreen, 1/3) - Math.pow(minGreen, 1/3) ) * cumulativeProbabilityRed[pixels[position+1]]) + ( Math.pow(minGreen, 1/3) ), 3);
				pixels[position+2] = Math.pow((( Math.pow(maxBlue, 1/3) - Math.pow(minBlue, 1/3) ) * cumulativeProbabilityRed[pixels[position+2]]) + ( Math.pow(minBlue, 1/3) ), 3);
			}

			this.context.putImageData( imageData, 0, 0 );
			this.view_button_back = true;

			this.updateHistogram();	// Se actualiza el histograma
		},

		log_hyperbolic: function(){	// Función de ecualización logaritmica hiperbólica
			let imageData = this.context.getImageData( 0, 0, this.$refs.ref_canvas.width, this.$refs.ref_canvas.height );
			let pixels = imageData.data;	// De la información obtenida, obtenemos los pixeles para manipularlos
			let numPixels = imageData.width * imageData.height;	// Se calcula el número de pixeles a procesar

			this.pixels_backup = imageData.data.slice();	// Se hace un respaldo de la información de los pixeles

			// Obtención de las probabilidades de cada intensidad de color
			let probabilityRed = this.getProbability( histogram.red, numPixels );
			let probabilityGreen = this.getProbability( histogram.green, numPixels );
			let probabilityBlue = this.getProbability( histogram.blue, numPixels );

			// Obtención de las probabilidades cumulativas de cada intensidad de color
			let cumulativeProbabilityRed = this.getCumulativeProbability( probabilityRed );
			let cumulativeProbabilityGreen = this.getCumulativeProbability( probabilityGreen );
			let cumulativeProbabilityBlue = this.getCumulativeProbability( probabilityBlue );

			// Obtención de los datos minimos y máximos de los histogramas en los 3 canales
			let minRed = this.getMin( histogram.red );
			let minGreen = this.getMin( histogram.green );
			let minBlue = this.getMin( histogram.blue );
			let maxRed = this.getMax( histogram.red );
			let maxGreen = this.getMax( histogram.green );
			let maxBlue = this.getMax( histogram.blue );

			// Aplicación de la formula en cada pixel y cada canal
			for( let i = 0; i < numPixels; i++ ){
				let position = i * 4;

				pixels[position] = minRed * ( maxRed / minRed ) * cumulativeProbabilityRed[pixels[position]];
				pixels[position+1] = minGreen * ( maxGreen / minGreen ) * cumulativeProbabilityGreen[pixels[position+1]];
				pixels[position+2] = minBlue * ( maxBlue / minBlue ) * cumulativeProbabilityBlue[pixels[position+2]];
			}

			this.context.putImageData( imageData, 0, 0 );
			this.view_button_back = true;

			this.updateHistogram();	// Se actualiza el histograma
		},

		getPositionsNeighborhood: function( i, j, width, height, sizeMask ){
			let neighborhood = [];
			let halfSizeMask = Math.floor( sizeMask / 2 );

			i = i - halfSizeMask;
			j = j - halfSizeMask;
			let i2 = i + sizeMask;
			let j2 = j + sizeMask;

			for( let iCurrent = i; iCurrent < i2; iCurrent++ ){
				for( let jCurrent = j; jCurrent < j2; jCurrent++ ){
					let position = (width * iCurrent) + jCurrent;
					neighborhood.push( position * 4 );
				}
			}

			return neighborhood;
		},

		meanConvolution: function( positionsNeighborhood, pixels, channel ){
			let mean = 0;

			for( let position of positionsNeighborhood ){
				mean += pixels[position + channel];
			}
			mean = Math.floor( mean / positionsNeighborhood.length );

			return mean;
		},

		mean: function(){	// Mediana o promedio
			let imageData = this.context.getImageData( 0, 0, this.$refs.ref_canvas.width, this.$refs.ref_canvas.height );
			let pixels = imageData.data;	// De la información obtenida, obtenemos los pixeles para manipularlos
			let numPixels = imageData.width * imageData.height;	// Se calcula el número de pixeles a procesar
			let newPixels = imageData.data.slice();

			this.pixels_backup = imageData.data.slice();	// Se hace un respaldo de la información de los pixeles

			let i = Math.floor(parseInt( this.size_mask_mean_value ) / 2), i2 = imageData.height - i;
			let j = i, j2 = imageData.width - i;

			for( let iCurrent = i; iCurrent < i2; iCurrent++ ){
				for( let jCurrent = j; jCurrent < j2; jCurrent++ ){
					let position = (iCurrent * imageData.width) + jCurrent;
					let positionsNeighborhood = this.getPositionsNeighborhood( iCurrent, jCurrent, imageData.width, imageData.height, parseInt( this.size_mask_mean_value ) );

					for( let channel = 0; channel < 3; channel++ ){
						pixels[(position*4)+channel] = Math.floor(this.meanConvolution( positionsNeighborhood, newPixels, channel ));
					}
				}
			}

			this.context.putImageData( imageData, 0, 0 );
			this.view_button_back = true;

			this.updateHistogram();	// Se actualiza el histograma
		},

		convolution: function( mask, positionsNeighborhood, pixels ){
			let addPartial = 0, n = 0;

			for( let i = 0; i < mask.length; i++ ){
				addPartial += mask[i] * pixels[positionsNeighborhood[i]];
				n += mask[i];
			}

			return Math.floor( addPartial / n );
		},

		mean_hard: function(){	// Media o promedio
			let imageData = this.context.getImageData( 0, 0, this.$refs.ref_canvas.width, this.$refs.ref_canvas.height );
			let pixels = imageData.data;	// De la información obtenida, obtenemos los pixeles para manipularlos
			let numPixels = imageData.width * imageData.height;	// Se calcula el número de pixeles a procesar
			let newPixels = imageData.data.slice();

			this.pixels_backup = imageData.data.slice();	// Se hace un respaldo de la información de los pixeles

			let mask = [1, 1, 1, 1, parseInt(this.mean_hard_value), 1, 1, 1, 1];

			let i = 1, i2 = imageData.height - i;
			let j = i, j2 = imageData.width - i;

			for( let iCurrent = i; iCurrent < i2; iCurrent++ ){
				for( let jCurrent = j; jCurrent < j2; jCurrent++ ){
					let position = (iCurrent * imageData.width) + jCurrent;
					let positionsNeighborhood = this.getPositionsNeighborhood( iCurrent, jCurrent, imageData.width, imageData.height, 3 );

					for( let channel = 0; channel < 3; channel++ ){
						pixels[(position*4)+channel] = Math.floor(this.convolution( mask, positionsNeighborhood, newPixels ));
					}
				}
			}

			this.context.putImageData( imageData, 0, 0 );
			this.view_button_back = true;

			this.updateHistogram();	// Se actualiza el histograma
		},

		getMaskGauss: function(){
			let mask = [];
			let sizeMask = parseInt( this.size_mask_gauss_value * this.size_mask_gauss_value );
			let range = parseInt( this.size_mask_gauss_value / 2 );
			let desviacion = parseInt( this.desviacion_value );
			let i = 0, norm;

			for( let y = 0; y < parseInt( this.size_mask_gauss_value ); y++ ){
				for( let x = 0; x < parseInt( this.size_mask_gauss_value ); x++ ){
					let exponential = Math.exp( -( ((x-range)*(x-range)) + ((y-range)*(y-range)) )/(2*desviacion*desviacion) );
					if( !i ){
						norm = exponential;
					}
					mask.push( exponential );
				}
			}

			return mask;
		},

		gauss: function(){
			let imageData = this.context.getImageData( 0, 0, this.$refs.ref_canvas.width, this.$refs.ref_canvas.height );
			let pixels = imageData.data;	// De la información obtenida, obtenemos los pixeles para manipularlos
			let numPixels = imageData.width * imageData.height;	// Se calcula el número de pixeles a procesar
			let newPixels = imageData.data.slice();

			this.pixels_backup = imageData.data.slice();	// Se hace un respaldo de la información de los pixeles

			let mask = this.getMaskGauss();

			let i = Math.floor(parseInt( this.size_mask_gauss_value ) / 2), i2 = imageData.height - i;
			let j = i, j2 = imageData.width - i;

			for( let iCurrent = i; iCurrent < i2; iCurrent++ ){
				for( let jCurrent = j; jCurrent < j2; jCurrent++ ){
					let position = (iCurrent * imageData.width) + jCurrent;
					let positionsNeighborhood = this.getPositionsNeighborhood( iCurrent, jCurrent, imageData.width, imageData.height, parseInt(this.size_mask_gauss_value) );

					for( let channel = 0; channel < 3; channel++ ){
						pixels[(position*4)+channel] = Math.floor(this.convolution( mask, positionsNeighborhood, newPixels, channel ));
					}
				}
			}

			this.context.putImageData( imageData, 0, 0 );
			this.view_button_back = true;

			this.updateHistogram();	// Se actualiza el histograma
		},

		find_max: function(vecindad){
			//Se recorre el arreglo entero una sola vez
			let max = vecindad[0];
			for (var i = 0; i < vecindad.length; i++) {
				if(max < vecindad[i]){
					//Si se encuentra un nuevo max se actualiza
					max = vecindad[i];
				}
			}
			return max;
		},

		find_min: function(vecindad){
			//Se recorre el arreglo entero una sola vez
			let min = vecindad[0];
			for (var i = 0; i < vecindad.length; i++) {
				if(min > vecindad[i]){
					//Si se encuentra un nuevo min se actualiza
					min = vecindad[i];
				}
			}
			return min;
		},

		find_moda: function(vecindad){
			//Ordenar de menor a mayo
			vecindad = mergeSort(vecindad);
			
			//Variables auxiliares
			let num = vecindad[0];
			let aux = 0;

			//Valores moda
			let modas = [];
			modas.push(vecindad[0]);
			let max = 1;

			//Se recorre una sola vez el arreglo ordenao de menor a mayor
			for (var i = 0; i < vecindad.length; i++) {
				//Si se encuentra un nuevo valor reinicia auxiliares
				if(num != vecindad[i]){
					num = vecindad[i];
					aux = 0;
				}
				//Incremento en uno de aux
				aux++;

				//Si aux es mayor a max se actualiza max, esto puede indicar una nueva moda
				if(aux > max){
					max = aux;
					//Si se encuentra una nueva moda se actualiza
					if(modas[0] != num){
						modas = [];
						modas.push(num);
					}
				} else if(aux == max && modas[modas.length-1] != num){
					//Si se encontro una nueva moda, pero con el mismo valor de la anterior se añade a modas
					modas.push(num);
				}
			}

			//Si existe mas de una moda, se saca el promedio de las modas
			let moda = 0;
			for (var i = 0; i < modas.length; i++) {
				moda += modas[i];
			}
			Math.floor(moda/moda.length);
			
			return moda;
		},

		find_mediana: function(vecindad){
			//Ordenar de menor a mayo
			vecindad = mergeSort(vecindad);

			//La mediana es el valor medio del arreglo ordenado de menor a mayor
			let mediana = vecindad[Math.floor(vecindad.length/2)];

			return mediana;
		},

		valorValido: function(pix, val, min, max){
			if(val >= 0 && val<max){
				return pix[val];
			} else{
				return 0;
			}
		},

		//Canal 0:red 1:green 2:blue 3:alpha
		getVecindad: function(pixels, position, width, canal, numP){
			// Inicializar en 0 para en un futuro no duplicar 
			let vecindad = [0,0,0,0,0,0,0,0,0];
			let x = 0;

			// Si esta sobre la parte izquierda de la imagen
			if(position % width == canal){
				// Esquina superior izquierda
				if(position == canal){
					vecindad[7] = this.valorValido(pixels,position+width,0,numP);	// f(x+1,y)
					vecindad[8] = this.valorValido(pixels,position+width+4,0,numP);	// f(x+1,y+1)
				}
				// Esquina inferior izquierda
				else if(position == numP - width + canal){
					vecindad[1] = this.valorValido(pixels,position-width,0,numP);	// f(x-1,y)
					vecindad[2] = this.valorValido(pixels,position-width+4,0,numP);	// f(x-1,y+1)

				} else{
					vecindad[1] = this.valorValido(pixels,position-width,0,numP);	// f(x-1,y)
					vecindad[2] = this.valorValido(pixels,position-width+4,0,numP);	// f(x-1,y+1)

					vecindad[7] = this.valorValido(pixels,position+width,0,numP);	// f(x+1,y)
					vecindad[8] = this.valorValido(pixels,position+width+4,0,numP);	// f(x+1,y+1)
				}

				vecindad[4] = this.valorValido(pixels,position,0,numP);		// f(x,y)
				vecindad[5] = this.valorValido(pixels,position+4,0,numP);		// f(x,y+1)
			} 
			// Si esta sobre la parte derecha de la imagen
			else if(position % width == width - 4 + canal){
				// Esquina superior derecha
				if(position == width - 4 + canal){
					vecindad[6] = this.valorValido(pixels,position+width-4,0,numP);	// f(x+1,y-1)
					vecindad[7] = this.valorValido(pixels,position+width,0,numP);	// f(x+1,y)
				}
				// Esquina inferior derecha
				else if(position == numP - 4 + canal){
					vecindad[0] = this.valorValido(pixels,position-width-4,0,numP);	// f(x-1,y-1)
					vecindad[1] = this.valorValido(pixels,position-width,0,numP);	// f(x-1,y)

				} else{
					vecindad[0] = this.valorValido(pixels,position-width-4,0,numP);	// f(x-1,y-1)
					vecindad[1] = this.valorValido(pixels,position-width,0,numP);	// f(x-1,y)
					
					vecindad[6] = this.valorValido(pixels,position+width-4,0,numP);	// f(x+1,y-1)
					vecindad[7] = this.valorValido(pixels,position+width,0,numP);	// f(x+1,y)
				}

				vecindad[3] = this.valorValido(pixels,position-4,0,numP);		// f(x,y-1)
				vecindad[4] = this.valorValido(pixels,position,0,numP);		// f(x,y)
			} 
			// Si no esta en ningun borde o esquina
			else{
				vecindad[0] = this.valorValido(pixels,position-width-4,0,numP);	// f(x-1,y-1)
				vecindad[1] = this.valorValido(pixels,position-width,0,numP);	// f(x-1,y)
				vecindad[2] = this.valorValido(pixels,position-width+4,0,numP);	// f(x-1,y+1)
				
				vecindad[3] = this.valorValido(pixels,position-4,0,numP);	// f(x,y-1)
				vecindad[4] = this.valorValido(pixels,position,0,numP);	// f(x,y)
				vecindad[5] = this.valorValido(pixels,position+4,0,numP);	// f(x,y+1)
				
				vecindad[6] = this.valorValido(pixels,position+width-4,0,numP);	// f(x+1,y-1)
				vecindad[7] = this.valorValido(pixels,position+width,0,numP);	// f(x+1,y)
				vecindad[8] = this.valorValido(pixels,position+width+4,0,numP);	// f(x+1,y+1)
			}

			return vecindad;
		},

		f_maximo: function(){
			let imageData = this.context.getImageData( 0, 0, this.$refs.ref_canvas.width, this.$refs.ref_canvas.height );
			let pixels = imageData.data;	// De la información obtenida, obtenemos los pixeles para manipularlos
			let newPixels = imageData.data.slice();	// Se hace una copia de los pixeles
			let numPixels = imageData.width * imageData.height;	// Se calcula el número de pixeles a procesar

			this.pixels_backup = imageData.data.slice();	// Se hace un respaldo de la información de los pixeles

			for( let i = 0; i < numPixels; i++ ){
				let position = i * 4;

				for (let j = 0; j < 3; j++) {
					pixels[position + j] = this.find_max(this.getVecindad(newPixels,position+j,imageData.width*4,j,numPixels*4));
				}
			}
			this.context.putImageData( imageData, 0, 0 );
			this.view_button_back = true;

			this.updateHistogram();	// Se actualiza el histograma			
		},

		f_minimo: function(){
			let imageData = this.context.getImageData( 0, 0, this.$refs.ref_canvas.width, this.$refs.ref_canvas.height );
			let pixels = imageData.data;	// De la información obtenida, obtenemos los pixeles para manipularlos
			let newPixels = imageData.data.slice();	// Se hace una copia de los pixeles
			let numPixels = imageData.width * imageData.height;	// Se calcula el número de pixeles a procesar

			this.pixels_backup = imageData.data.slice();	// Se hace un respaldo de la información de los pixeles

			for( let i = 0; i < numPixels; i++ ){
				let position = i * 4;

				for (let j = 0; j < 3; j++) {
					pixels[position + j] = this.find_min(this.getVecindad(newPixels,position+j,imageData.width*4,j,numPixels*4));
				}
			}
			this.context.putImageData( imageData, 0, 0 );
			this.view_button_back = true;

			this.updateHistogram();	// Se actualiza el histograma			
		},

		f_moda: function(){
			let imageData = this.context.getImageData( 0, 0, this.$refs.ref_canvas.width, this.$refs.ref_canvas.height );
			let pixels = imageData.data;	// De la información obtenida, obtenemos los pixeles para manipularlos
			let newPixels = imageData.data.slice();	// Se hace una copia de los pixeles
			let numPixels = imageData.width * imageData.height;	// Se calcula el número de pixeles a procesar

			this.pixels_backup = imageData.data.slice();	// Se hace un respaldo de la información de los pixeles

			for( let i = 0; i < numPixels; i++ ){
				let position = i * 4;

				for (let j = 0; j < 3; j++) {
					pixels[position + j] = this.find_moda(this.getVecindad(newPixels,position+j,imageData.width*4,j,numPixels*4));
				}
			}
			this.context.putImageData( imageData, 0, 0 );
			this.view_button_back = true;

			this.updateHistogram();	// Se actualiza el histograma			
		},

		f_mediana: function(){
			let imageData = this.context.getImageData( 0, 0, this.$refs.ref_canvas.width, this.$refs.ref_canvas.height );
			let pixels = imageData.data;	// De la información obtenida, obtenemos los pixeles para manipularlos
			let newPixels = imageData.data.slice();	// Se hace una copia de los pixeles
			let numPixels = imageData.width * imageData.height;	// Se calcula el número de pixeles a procesar

			this.pixels_backup = imageData.data.slice();	// Se hace un respaldo de la información de los pixeles

			for( let i = 0; i < numPixels; i++ ){
				let position = i * 4;

				for (let j = 0; j < 3; j++) {
					pixels[position + j] = this.find_mediana(this.getVecindad(newPixels,position+j,imageData.width*4,j,numPixels*4));
				}
			}
			this.context.putImageData( imageData, 0, 0 );
			this.view_button_back = true;

			this.updateHistogram();	// Se actualiza el histograma			
		},

		convolution2: function( mask1, mask2, factor, positionsNeighborhood, pixels ){
			let addPartial1 = 0, addPartial2 = 0;

			for( let i = 0; i < mask1.length; i++ ){
				addPartial1 += mask1[i] * pixels[positionsNeighborhood[i]];
				addPartial2 += mask2[i] * pixels[positionsNeighborhood[i]];
			}

			addPartial1 = Math.floor( addPartial1 / factor );
			addPartial2 = Math.floor( addPartial2 / factor );

			return Math.floor( Math.sqrt( (addPartial1*addPartial1) + (addPartial2*addPartial2) ) );
		},

		convolution3: function( mask, factor, positionsNeighborhood, pixels ){
			let addPartial = 0;

			for( let i = 0; i < mask.length; i++ ){
				addPartial += mask[i] * pixels[positionsNeighborhood[i]];
			}

			return Math.floor( addPartial / factor );
		},

		sobel: function(){
			this.to_gray();

			let imageData = this.context.getImageData( 0, 0, this.$refs.ref_canvas.width, this.$refs.ref_canvas.height );
			let pixels = imageData.data;	// De la información obtenida, obtenemos los pixeles para manipularlos
			let numPixels = imageData.width * imageData.height;	// Se calcula el número de pixeles a procesar
			let newPixels = imageData.data.slice();

			this.pixels_backup = imageData.data.slice();	// Se hace un respaldo de la información de los pixeles

			let mask1 = [-1, -2, -1, 0, 0, 0, 1, 2, 1];
			let mask2 = [-1, 0, 1, -2, 0, 2, -1, 0, 1];
			let factor = 4;

			let i = 1, i2 = imageData.height - i;
			let j = i, j2 = imageData.width - i;

			for( let iCurrent = i; iCurrent < i2; iCurrent++ ){
				for( let jCurrent = j; jCurrent < j2; jCurrent++ ){
					let position = (iCurrent * imageData.width) + jCurrent;
					let positionsNeighborhood = this.getPositionsNeighborhood( iCurrent, jCurrent, imageData.width, imageData.height, 3 );

					let conv = this.convolution2( mask1, mask2, factor, positionsNeighborhood, newPixels );

					pixels[(position*4)] = conv;
					pixels[(position*4)+1] = conv;
					pixels[(position*4)+2] = conv;
				}
			}

			this.context.putImageData( imageData, 0, 0 );
			this.view_button_back = true;

			this.updateHistogram();	// Se actualiza el histograma
		},

		prewitt: function(){
			this.to_gray();

			let imageData = this.context.getImageData( 0, 0, this.$refs.ref_canvas.width, this.$refs.ref_canvas.height );
			let pixels = imageData.data;	// De la información obtenida, obtenemos los pixeles para manipularlos
			let numPixels = imageData.width * imageData.height;	// Se calcula el número de pixeles a procesar
			let newPixels = imageData.data.slice();

			this.pixels_backup = imageData.data.slice();	// Se hace un respaldo de la información de los pixeles

			let mask1 = [-1, -1, -1, 0, 0, 0, 1, 1, 1];
			let mask2 = [-1, 0, 1, -1, 0, 1, -1, 0, 1];
			let factor = 3;

			let i = 1, i2 = imageData.height - i;
			let j = i, j2 = imageData.width - i;

			for( let iCurrent = i; iCurrent < i2; iCurrent++ ){
				for( let jCurrent = j; jCurrent < j2; jCurrent++ ){
					let position = (iCurrent * imageData.width) + jCurrent;
					let positionsNeighborhood = this.getPositionsNeighborhood( iCurrent, jCurrent, imageData.width, imageData.height, 3 );

					let conv = this.convolution2( mask1, mask2, factor, positionsNeighborhood, newPixels );

					pixels[(position*4)] = conv;
					pixels[(position*4)+1] = conv;
					pixels[(position*4)+2] = conv;
				}
			}

			this.context.putImageData( imageData, 0, 0 );
			this.view_button_back = true;

			this.updateHistogram();	// Se actualiza el histograma
		},

		robert: function(){
			this.to_gray();

			let imageData = this.context.getImageData( 0, 0, this.$refs.ref_canvas.width, this.$refs.ref_canvas.height );
			let pixels = imageData.data;	// De la información obtenida, obtenemos los pixeles para manipularlos
			let numPixels = imageData.width * imageData.height;	// Se calcula el número de pixeles a procesar
			let newPixels = imageData.data.slice();

			this.pixels_backup = imageData.data.slice();	// Se hace un respaldo de la información de los pixeles

			let mask1 = [-1, 0, 0, 0, 1, 0, 0, 0, 0];
			let mask2 = [0, 0, -1, 0, 1, 0, 0, 0, 0];
			let factor = 1;

			let i = 1, i2 = imageData.height - i;
			let j = i, j2 = imageData.width - i;

			for( let iCurrent = i; iCurrent < i2; iCurrent++ ){
				for( let jCurrent = j; jCurrent < j2; jCurrent++ ){
					let position = (iCurrent * imageData.width) + jCurrent;
					let positionsNeighborhood = this.getPositionsNeighborhood( iCurrent, jCurrent, imageData.width, imageData.height, 3 );

					let conv = this.convolution2( mask1, mask2, factor, positionsNeighborhood, newPixels );

					pixels[(position*4)] = conv;
					pixels[(position*4)+1] = conv;
					pixels[(position*4)+2] = conv;
				}
			}

			this.context.putImageData( imageData, 0, 0 );
			this.view_button_back = true;

			this.updateHistogram();	// Se actualiza el histograma
		},

		laplace: function(){
			this.to_gray();

			let imageData = this.context.getImageData( 0, 0, this.$refs.ref_canvas.width, this.$refs.ref_canvas.height );
			let pixels = imageData.data;	// De la información obtenida, obtenemos los pixeles para manipularlos
			let numPixels = imageData.width * imageData.height;	// Se calcula el número de pixeles a procesar
			let newPixels = imageData.data.slice();

			this.pixels_backup = imageData.data.slice();	// Se hace un respaldo de la información de los pixeles

			let mask = [0, 1, 0, 1, -4, 1, 0, 1, 0], factor = 4;
			//let mask = [2, -1, -1, -1, 2, -1, -1, -1, 2], factor = 6;

			let i = 1, i2 = imageData.height - i;
			let j = i, j2 = imageData.width - i;

			for( let iCurrent = i; iCurrent < i2; iCurrent++ ){
				for( let jCurrent = j; jCurrent < j2; jCurrent++ ){
					let position = (iCurrent * imageData.width) + jCurrent;
					let positionsNeighborhood = this.getPositionsNeighborhood( iCurrent, jCurrent, imageData.width, imageData.height, 3 );

					let conv = this.convolution3( mask, factor, positionsNeighborhood, newPixels );

					pixels[(position*4)] = conv;
					pixels[(position*4)+1] = conv;
					pixels[(position*4)+2] = conv;
				}
			}

			this.context.putImageData( imageData, 0, 0 );
			this.view_button_back = true;

			this.updateHistogram();	// Se actualiza el histograma
		},

		inverse_laplace: function(){
			this.to_gray();

			let imageData = this.context.getImageData( 0, 0, this.$refs.ref_canvas.width, this.$refs.ref_canvas.height );
			let pixels = imageData.data;	// De la información obtenida, obtenemos los pixeles para manipularlos
			let numPixels = imageData.width * imageData.height;	// Se calcula el número de pixeles a procesar
			let newPixels = imageData.data.slice();

			this.pixels_backup = imageData.data.slice();	// Se hace un respaldo de la información de los pixeles

			let mask = [0, -1, 0, -1, 4, -1, 0, -1, 0], factor = 4;
			//let mask = [2, -1, -1, -1, 2, -1, -1, -1, 2], factor = 6;

			let i = 1, i2 = imageData.height - i;
			let j = i, j2 = imageData.width - i;

			for( let iCurrent = i; iCurrent < i2; iCurrent++ ){
				for( let jCurrent = j; jCurrent < j2; jCurrent++ ){
					let position = (iCurrent * imageData.width) + jCurrent;
					let positionsNeighborhood = this.getPositionsNeighborhood( iCurrent, jCurrent, imageData.width, imageData.height, 3 );

					let conv = this.convolution3( mask, factor, positionsNeighborhood, newPixels );

					pixels[(position*4)] = conv;
					pixels[(position*4)+1] = conv;
					pixels[(position*4)+2] = conv;
				}
			}

			this.context.putImageData( imageData, 0, 0 );
			this.view_button_back = true;

			this.updateHistogram();	// Se actualiza el histograma
		},

		check_rgb: function(R,G,B){
			if((R>95) && (G>40) && (B>20)){
				if(Math.max(R,G,B)-Math.min(R,G,B) > 15){
					if(Math.abs(R-G) > 15){
						if((R>G) && (R>B)){
							return true;
						}	
					}
				}
			}
			return false;
		},

		umbral_piel: function(){	// Función para binarizar con respecto a un umbral
			let imageData = this.context.getImageData( 0, 0, this.$refs.ref_canvas.width, this.$refs.ref_canvas.height );
			let pixels = imageData.data;
			let numPixels = imageData.width * imageData.height;

			this.pixels_backup = imageData.data.slice();	// Se hace un respaldo de la información de los pixeles

			let piel = false;
			for( let i = 0; i < numPixels; i++ ){
				piel = this.check_rgb(pixels[i*4],pixels[i*4+1],pixels[i*4+2]);

				// Se compara el valor del pixel con el del umbral en slider
				if( piel ){
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

			this.updateHistogram();	// Se actualiza el histograma
		},

		//elementS = [[-1,0],[0,-1],[0,1],[1,0]];
		getPositionsElement: function( x, y, width, height, elementS ){
			let element = [];
			let i = 0;
			let j = 0;
			let position = 0;

			for (let k = 0; k < elementS.length; k++) {
				i = x + elementS[k][0];
				j = y + elementS[k][1];
				if(i >= 0 && i < height){
					if(j >= 0 && j < width){
						position = (width * i) + j;
						element.push( position * 4 );
					}
				}
			}

			return element;
		},

		dilatacion: function(elementS){
			let imageData = this.context.getImageData( 0, 0, this.$refs.ref_canvas.width, this.$refs.ref_canvas.height );
			let pixels = imageData.data;	// De la información obtenida, obtenemos los pixeles para manipularlos
			let newPixels = imageData.data.slice();	// Se hace una copia de los pixeles
			
			this.pixels_backup = imageData.data.slice();	// Se hace un respaldo de la información de los pixeles

			for( let iCurrent = 0; iCurrent < imageData.height; iCurrent++ ){
				for( let jCurrent = 0; jCurrent < imageData.width; jCurrent++ ){
					let position = (iCurrent * imageData.width) + jCurrent;
					let positionsElement = this.getPositionsElement( iCurrent, jCurrent, imageData.width, imageData.height, elementS);
					let vals = [];
					for (let k = 0; k < positionsElement.length; k++) {
						vals.push(newPixels[positionsElement[k]]);
					}
					vals.push(newPixels[position*4]);
					let max = this.find_max(vals);
					for (let k = 0; k < positionsElement.length; k++) {
						for( let channel = 0; channel < 3; channel++ ){
							pixels[positionsElement[k]+channel] = max;
						}
					}
				}
			}

			this.context.putImageData( imageData, 0, 0 );
			this.view_button_back = true;

			this.updateHistogram();	// Se actualiza el histograma	
		},

		erosion: function(elementS){
			let imageData = this.context.getImageData( 0, 0, this.$refs.ref_canvas.width, this.$refs.ref_canvas.height );
			let pixels = imageData.data;	// De la información obtenida, obtenemos los pixeles para manipularlos
			let newPixels = imageData.data.slice();	// Se hace una copia de los pixeles
			let numPixels = imageData.width * imageData.height;	// Se calcula el número de pixeles a procesar

			this.pixels_backup = imageData.data.slice();	// Se hace un respaldo de la información de los pixeles

			for( let iCurrent = 0; iCurrent < imageData.height; iCurrent++ ){
				for( let jCurrent = 0; jCurrent < imageData.width; jCurrent++ ){
					let position = (iCurrent * imageData.width) + jCurrent;

					let positionsElement = this.getPositionsElement( iCurrent, jCurrent, imageData.width, imageData.height, elementS);
					let vals = [];
					for (let k = 0; k < positionsElement.length; k++) {
						vals.push(newPixels[positionsElement[k]]);
					}
					vals.push(newPixels[position*4]);
					let min = this.find_min(vals);
					for( let channel = 0; channel < 3; channel++ ){
						pixels[position*4+channel] = min;
					}
				}
			}

			this.context.putImageData( imageData, 0, 0 );
			this.view_button_back = true;

			this.updateHistogram();	// Se actualiza el histograma	
		},

		apertura: function(elementS){
			this.erosion(elementS);
			this.dilatacion(elementS);
		},

		cierre: function(elementS){
			this.dilatacion(elementS);
			this.erosion(elementS);
		},

		andMancha: function(newPixels){	// Función para hacer la operación AND entre dos imágenes
			let imageData = this.context.getImageData( 0, 0, this.$refs.ref_canvas.width, this.$refs.ref_canvas.height );
			let pixelsOriginal = imageData.data;

			for( let iCurrent = 0; iCurrent < imageData.height; iCurrent++ ){
				for( let jCurrent = 0; jCurrent < imageData.width; jCurrent++ ){
					let position = (iCurrent * imageData.width) + jCurrent;

					// Asignación del resultado de la operación AND entre pixeles X,Y a nivel de bit
					pixelsOriginal[position*4] = this.and_pixel( pixelsOriginal[position*4], newPixels[position*4] );
					pixelsOriginal[position*4+1] = this.and_pixel( pixelsOriginal[position*4+1], newPixels[position*4+1] );
					pixelsOriginal[position*4+2] = this.and_pixel( pixelsOriginal[position*4+2], newPixels[position*4+2] );
				}
			}

			this.context.putImageData( imageData, 0, 0 );
			this.view_button_back = true;

			this.updateHistogram();	// Se actualiza el histograma	

		},

		mancha: function(){
			let newPixels = this.context.getImageData( 0, 0, this.$refs.ref_canvas.width, this.$refs.ref_canvas.height ).data.slice();

			let elementS = [];

			this.umbral_piel();
			this.to_negative();
			this.f_moda();
			
			elementS = [[-1,-1],[-1,0],[-1,1],[0,-1],[0,1],[1,0]];
			this.erosion(elementS);
			
			this.f_mediana();
			this.f_moda();
			
			this.erosion(elementS);

			elementS = [[-1,1],[0,1],[1,1],[1,0]];
			this.cierre(elementS);

			elementS = [[0,-1],[0,1],[1,0],[1,-1],[-1,1]];
			this.dilatacion(elementS);
			this.dilatacion(elementS);

			elementS = [[-1,0],[-1,1],[0,1],[1,0]];
			this.apertura(elementS);

			elementS = [[1,0],[1,1]];
			this.dilatacion(elementS);
			this.dilatacion(elementS);

			elementS = [[0,1],[1,0],[1,-1],[1,1]];
			this.cierre(elementS);

			elementS = [[1,0],[1,1]];
			this.dilatacion(elementS);

			this.andMancha(newPixels);

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

function merge(left, right) {
  	let result = [];
    let il = 0;
    let ir = 0;
  
  	while(il < left.length && ir < right.length) {
    	if (left[il] < right[ir]) {
	      	result.push(left[il]);
	      	il++;
		    //si el item del array left es menor
		    //este se agrega a la lista y se aumenta en uno su indice (il)
    	} else {
	      	//si el item de right es menor este se agrega a la lista e igualmente su indice crece
	      	result.push(right[ir]);
	      	ir++;	
	    }
  	}
  
  	return result.concat(left.slice(il)).concat(right.slice(ir));
}

function mergeSort(items) {
	if (items.length < 2) {
  		return items;
	}

  	let middle = Math.floor(items.length / 2);
    let left = items.slice(0, middle);
    let right = items.slice(middle);

  	return merge(mergeSort(left), mergeSort(right));
}