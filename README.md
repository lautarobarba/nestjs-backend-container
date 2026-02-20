# NestJS Backend Container

## Configuración

```bash
$ cp .env.example .env
$ nano .env
```

## Iniciar

```bash
$ docker compose up -d
```

_Quitando la opción *-d* se ven los logs del contenedor._

## Detener

```bash
$ # Si estan corriendo con logs visibles
$ #     detener con Ctr+C
$ docker compose down
```

## Debug

```bash
$ docker compose exec -it nest_back bash
```

## Instalar nuevas librerías

```bash
$ docker compose exec -it nest_back bash -c "npm install NPM_PACKAGE"
```

## Recursos NestJS

```bash
$ # Para crear un nuevo recurso usamos el generador de NestJs
$ # RESOURCE_NAME puede ser el nombre de una entidad(tabla) en singular
$ docker compose exec -it nest_back bash -c "nest g resource modules/RESOURCE_NAME --no-spec"
$ # El contenedor va a generar los archivos con el owner ROOT.
$ # Cambiamos el owner para que nos deje editar
$ sudo chown -R ${USER}:${USER} backend/src/modules
```

<!-- ## Migraciones TypeORM

```bash
$ # Ver migraciones aplicadas:
$ docker compose exec -it nest_back bash -c "npm run migration:show"
$ # Generar migración
$ docker compose exec -it nest_back bash -c "npm run migration:generate --name=nombreMigracion"
$ # Aplicar migraciones
$ docker compose exec -it nest_back bash -c "npm run migration:run"
``` -->

## Crear administrador

```bash
$ docker compose exec -it nest_back bash -c "npm run create-admin"
$ # Esto creara un nuevo administador con las credenciales
$ #   email: admin@admin.com
$ #   contraseña: admin
```

## Test endpoints

Para testear los endpoints se puede usar Postman o dirigirse a la ruta **/api/docs** para testear con _Swagger_.
