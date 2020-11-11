original_image = new Image();

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

			behavior_main_image.x_plus_value = 0;
			behavior_main_image.y_plus_value = 0;
			behavior_main_image.view_inputs = false;
			behavior_main_image.button_message = "Cargar imagen";

			behavior_main_load.view_icon_loadImage = true;
			
			behavior_main_image.view_main_images = false;
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

		x_min: 0,
		x_max: 0,
		y_min: 0,
		y_max: 0,

		second_image: null,
		context: null,
		canvas2: null,
		context2: null,

		button_message: "Cargar imagen",

		view_main_images: false,
		view_inputs: false
	},

	methods: {
		load_image: function( width, height ){	// Función para cargar la imágen 
			this.$refs.ref_canvas.width = width;	// Al canvas le asignamos el ancho de la imagen
			this.$refs.ref_canvas.height = height;	// Al canvas le asignamos el alto de la imagen

			this.context = this.$refs.ref_canvas.getContext( '2d' );	// Obtenemos el contexto del canvas
			this.context.drawImage( original_image, 0, 0 );	// Dibujamos la imagen en el canvas
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
		},

		to_binary: function(){	// Función para binarizar con respecto a un umbral
			this.to_gray();	// Se convierte a gris la imagen

			let imageData = this.context.getImageData( 0, 0, this.$refs.ref_canvas.width, this.$refs.ref_canvas.height );
			let pixels = imageData.data;
			let numPixels = imageData.width * imageData.height;

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
		},

		to_negative: function(){	// Función para obtener el negativo de la imagen
			let imageData = this.context.getImageData( 0, 0, this.$refs.ref_canvas.width, this.$refs.ref_canvas.height );
			let pixels = imageData.data;
			let numPixels = imageData.width * imageData.height;

			for( let i = 0; i < numPixels; i++ ){
				let r = pixels[i*4];
				let g = pixels[i*4+1];
				let b = pixels[i*4+2];

				pixels[i*4] = 255 - r;		// Al valor 255 se le resta el valor del canal r
				pixels[i*4+1] = 255 - g;	// Al valor 255 se le resta el valor del canal g
				pixels[i*4+2] = 255 - b;	// Al valor 255 se le resta el valor del canal b
			}

			this.context.putImageData( imageData, 0, 0 );
		},

		plus_images: function(){
			let imageDataOriginal = this.context.getImageData( 0, 0, this.$refs.ref_canvas.width, this.$refs.ref_canvas.height );
			let imageDataSecond = this.context2.getImageData( 0, 0, this.canvas2.width, this.canvas2.height );
			let pixelsOriginal = imageDataOriginal.data;
			let pixelsSecond = imageDataSecond.data;
			let numPixelsOriginal = imageDataOriginal.width * imageDataOriginal.height;
			let numPixelsSecond = imageDataSecond.width * imageDataSecond.height;

			let axes = this.getAxesIniEnd( parseInt(this.x_plus_value), parseInt(this.y_plus_value) );

			let i2 = axes.i2;
			for( let i = axes.i; i < axes.y; i++, i2++ ){
				let j2 = axes.j2;
				for( let j = axes.j; j < axes.x; j++, j2++ ){
					let indexOriginal = (original_image.width * i + j) * 4;
					let indexSecond = (this.second_image.width * i2 + j2) * 4;

					pixelsOriginal[indexOriginal] = (pixelsOriginal[indexOriginal] + pixelsSecond[indexSecond]) / 2;
					pixelsOriginal[indexOriginal+1] = (pixelsOriginal[indexOriginal+1] + pixelsSecond[indexSecond+1]) / 2;
					pixelsOriginal[indexOriginal+2] = (pixelsOriginal[indexOriginal+2] + pixelsSecond[indexSecond+2]) / 2;
				}
			}

			this.context.putImageData( imageDataOriginal, 0, 0 );
		},

		substract_images: function(){
			let imageDataOriginal = this.context.getImageData( 0, 0, this.$refs.ref_canvas.width, this.$refs.ref_canvas.height );
			let imageDataSecond = this.context2.getImageData( 0, 0, this.canvas2.width, this.canvas2.height );
			let pixelsOriginal = imageDataOriginal.data;
			let pixelsSecond = imageDataSecond.data;
			let numPixelsOriginal = imageDataOriginal.width * imageDataOriginal.height;
			let numPixelsSecond = imageDataSecond.width * imageDataSecond.height;

			let axes = this.getAxesIniEnd( parseInt(this.x_subs_value), parseInt(this.y_subs_value) );

			let i2 = axes.i2;
			for( let i = axes.i; i < axes.y; i++, i2++ ){
				let j2 = axes.j2;
				for( let j = axes.j; j < axes.x; j++, j2++ ){
					let indexOriginal = (original_image.width * i + j) * 4;
					let indexSecond = (this.second_image.width * i2 + j2) * 4;

					pixelsOriginal[indexOriginal] = (255/2) + ((pixelsOriginal[indexOriginal] - pixelsSecond[indexSecond]) / 2);
					pixelsOriginal[indexOriginal+1] = (255/2) + ((pixelsOriginal[indexOriginal+1] - pixelsSecond[indexSecond+1]) / 2);
					pixelsOriginal[indexOriginal+2] = (255/2) + ((pixelsOriginal[indexOriginal+2] - pixelsSecond[indexSecond+2]) / 2);
				}
			}

			this.context.putImageData( imageDataOriginal, 0, 0 );
		},

		and_pixel: function( pixel1, pixel2 ){
			pixel1 = pixel1.toString( 2 );
			pixel2 = pixel2.toString( 2 );

			if( pixel1.length < 8 ){
				let length = 8 - pixel1.length;
				for( let i = 0; i < length; i++ ){
					pixel1 = "0" + pixel1;
				}
			}

			if( pixel2.length < 8 ){
				let length = 8 - pixel2.length;
				for( let i = 0; i < length; i++ ){
					pixel2 = "0" + pixel2;
				}
			}

			let pixelResul = "";
			for( let i = 0; i < 8; i++ ){
				if( pixel1.charAt( i ) == 1 && pixel2.charAt( i ) == 1 ){
					pixelResul += "1";
				}else{
					pixelResul += "0";
				}
			}

			return parseInt( pixelResul, 2 );
		},

		and_images: function(){
			let imageDataOriginal = this.context.getImageData( 0, 0, this.$refs.ref_canvas.width, this.$refs.ref_canvas.height );
			let imageDataSecond = this.context2.getImageData( 0, 0, this.canvas2.width, this.canvas2.height );
			let pixelsOriginal = imageDataOriginal.data;
			let pixelsSecond = imageDataSecond.data;
			let numPixelsOriginal = imageDataOriginal.width * imageDataOriginal.height;
			let numPixelsSecond = imageDataSecond.width * imageDataSecond.height;

			let axes = this.getAxesIniEnd( parseInt(this.x_and_value), parseInt(this.y_and_value) );

			let i2 = axes.i2;
			for( let i = axes.i; i < axes.y; i++, i2++ ){
				let j2 = axes.j2;
				for( let j = axes.j; j < axes.x; j++, j2++ ){
					let indexOriginal = (original_image.width * i + j) * 4;
					let indexSecond = (this.second_image.width * i2 + j2) * 4;

					pixelsOriginal[indexOriginal] = this.and_pixel( pixelsOriginal[indexOriginal], pixelsSecond[indexSecond] );
					pixelsOriginal[indexOriginal+1] = this.and_pixel( pixelsOriginal[indexOriginal+1], pixelsSecond[indexSecond+1] );
					pixelsOriginal[indexOriginal+2] = this.and_pixel( pixelsOriginal[indexOriginal+2], pixelsSecond[indexSecond+2] );
				}
			}

			this.context.putImageData( imageDataOriginal, 0, 0 );
		},

		or_pixel: function( pixel1, pixel2 ){
			pixel1 = pixel1.toString( 2 );
			pixel2 = pixel2.toString( 2 );

			if( pixel1.length < 8 ){
				let length = 8 - pixel1.length;
				for( let i = 0; i < length; i++ ){
					pixel1 = "0" + pixel1;
				}
			}

			if( pixel2.length < 8 ){
				let length = 8 - pixel2.length;
				for( let i = 0; i < length; i++ ){
					pixel2 = "0" + pixel2;
				}
			}

			let pixelResul = "";
			for( let i = 0; i < 8; i++ ){
				if( pixel1.charAt( i ) == 1 || pixel2.charAt( i ) == 1 ){
					pixelResul += "1";
				}else{
					pixelResul += "0";
				}
			}

			return parseInt( pixelResul, 2 );
		},

		or_images: function(){
			let imageDataOriginal = this.context.getImageData( 0, 0, this.$refs.ref_canvas.width, this.$refs.ref_canvas.height );
			let imageDataSecond = this.context2.getImageData( 0, 0, this.canvas2.width, this.canvas2.height );
			let pixelsOriginal = imageDataOriginal.data;
			let pixelsSecond = imageDataSecond.data;
			let numPixelsOriginal = imageDataOriginal.width * imageDataOriginal.height;
			let numPixelsSecond = imageDataSecond.width * imageDataSecond.height;

			let axes = this.getAxesIniEnd( parseInt(this.x_or_value), parseInt(this.y_or_value) );

			let i2 = axes.i2;
			for( let i = axes.i; i < axes.y; i++, i2++ ){
				let j2 = axes.j2;
				for( let j = axes.j; j < axes.x; j++, j2++ ){
					let indexOriginal = (original_image.width * i + j) * 4;
					let indexSecond = (this.second_image.width * i2 + j2) * 4;
					pixelsOriginal[indexOriginal] = this.or_pixel( pixelsOriginal[indexOriginal], pixelsSecond[indexSecond] );
					pixelsOriginal[indexOriginal+1] = this.or_pixel( pixelsOriginal[indexOriginal+1], pixelsSecond[indexSecond+1] );
					pixelsOriginal[indexOriginal+2] = this.or_pixel( pixelsOriginal[indexOriginal+2], pixelsSecond[indexSecond+2] );
				}
			}

			this.context.putImageData( imageDataOriginal, 0, 0 );
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