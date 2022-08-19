import { NestFactory } from '@nestjs/core';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { AppModule } from 'app.module';
import * as cookieParser from 'cookie-parser';

async function bootstrap() {
	const app = await NestFactory.create(AppModule);

	// CORS
	app.enableCors();

	// Cookies
	app.use(cookieParser());

	// Configuro el prefijo para todas las rutas
	app.setGlobalPrefix('api');

	// Configuración para swagger
	const config = new DocumentBuilder()
		.setTitle('API NOTAS')
		.setDescription('API notas')
		.setVersion('1.0')
		.addBearerAuth()
		.build();
	const document = SwaggerModule.createDocument(app, config);
	SwaggerModule.setup('api/docs', app, document);

	await app.listen(AppModule.port);
}
bootstrap();
