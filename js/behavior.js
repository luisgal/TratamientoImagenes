original_image = new Image();

let behavior_header = new Vue({
	el: '#behavior_header',

	data: {
		name_file: null,

		view_name: false
	},

	methods: {
		download_image: function(){
			let link = window.document.createElement( 'a' );
			let url = behavior_main_image.$refs.ref_canvas.toDataURL();

			link.setAttribute( 'href', url );
			link.setAttribute( 'download', this.name_file );
			link.style.visibility = 'hidden';

			window.document.body.appendChild( link );
			link.click();
			window.document.body.removeChild( link );
		},

		close_image: function(){
			this.name_file = null;
			this.view_name = false;

			behavior_main_load.view_icon_loadImage = true;
			
			behavior_main_image.view_main_images = false;
		}
	}
});

let behavior_main_image = new Vue({
	el: '#behavior_main_image',

	data: {
		umbral_binarizado: 127,

		context: null,

		view_main_images: false
	},

	methods: {
		load_image: function( width, height ){
			this.$refs.ref_canvas.width = width;
			this.$refs.ref_canvas.height = height;

			this.context = this.$refs.ref_canvas.getContext( '2d' );
			this.context.drawImage( original_image, 0, 0 );
		},

		to_gray: function(){
			let imageData = this.context.getImageData( 0, 0, this.$refs.ref_canvas.width, this.$refs.ref_canvas.height );
			let pixels = imageData.data;
			let numPixels = imageData.width * imageData.height;

			for( var i = 0; i < numPixels; i++ ){
				var r = pixels[i*4];
				var g = pixels[i*4+1];
				var b = pixels[i*4+2];

				var gris = (r+g+b)/3;

				pixels[i*4] = gris;
				pixels[i*4+1] = gris;
				pixels[i*4+2] = gris;
			}

			this.context.putImageData( imageData, 0, 0 );
		},

		to_binary: function(){
			this.to_gray();

			let imageData = this.context.getImageData( 0, 0, this.$refs.ref_canvas.width, this.$refs.ref_canvas.height );
			let pixels = imageData.data;
			let numPixels = imageData.width * imageData.height;

			for( var i = 0; i < numPixels; i++ ){
				if( pixels[i*4] > Number(this.umbral_binarizado) ){
					pixels[i*4] = 255;
					pixels[i*4+1] = 255;
					pixels[i*4+2] = 255;
				}else{
					pixels[i*4] = 0;
					pixels[i*4+1] = 0;
					pixels[i*4+2] = 0;
				}
			}

			this.context.putImageData( imageData, 0, 0 );
		},

		to_negative: function(){
			let imageData = this.context.getImageData( 0, 0, this.$refs.ref_canvas.width, this.$refs.ref_canvas.height );
			let pixels = imageData.data;
			let numPixels = imageData.width * imageData.height;

			for( var i = 0; i < numPixels; i++ ){
				var r = pixels[i*4];
				var g = pixels[i*4+1];
				var b = pixels[i*4+2];

				pixels[i*4] = 255 - r;
				pixels[i*4+1] = 255 - g;
				pixels[i*4+2] = 255 - b;
			}

			this.context.putImageData( imageData, 0, 0 );
		}
	}
});

let behavior_main_load = new Vue({
	el: '#behavior_main_load',

	data: {
		view_icon_loadImage: true,
	},

	methods: {
		upload_image: function( event ){
			let file = this.$refs.ref_input_file.files[0];
			let reader = new FileReader();

			if( reader ){
				reader.readAsDataURL( file );
				reader.onload = ( e ) => {
					original_image.name = file.name;
					original_image.src = reader.result;

					original_image.onload = () =>{
						behavior_main_image.load_image( original_image.width, original_image.height );
					}
				}
			}

			this.change_views( file.name );
		},

		change_views: function( name_file ){
			behavior_header.name_file = name_file;
			behavior_header.view_name = true;

			this.view_icon_loadImage = false;
			
			behavior_main_image.view_main_images = true;
		}
	}
});