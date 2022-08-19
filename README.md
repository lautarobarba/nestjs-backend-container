# NestJS Backend Container

## Dependencias

- Docker

## Configuración

```bash
$ cp .env.example .env
$ nano .env
```

## Iniciar

```bash
$ docker compose up -d prod/dev
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
$ docker container exec -it prod/dev bash
```

## Migraciones

```bash
$ # Para usar las migraciones con TypeORM hay que configurar nuevamente la db en ormconfig.json
$ cd backend
$ cp ormconfig.json.example ormconfig.json
$ nano ormconfig.json
$ # Ver migraciones aplicadas:
$ docker compose exec -it dev bash -c "npm run migration:show"
$ # Generar migración
$ docker compose exec -it dev bash -c "npm run migration:generate NOMBRE_MIGRACION"
$ # Aplicar migraciones
$ docker compose exec -it dev bash -c "npm run migration:run"
```
