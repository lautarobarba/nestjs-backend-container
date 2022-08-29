# NestJS Backend Container

## Dependencias

- Docker (Apéndice)

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

# Apéndice

## Instalación de docker en ubuntu 18.04/20.04/22.04

Fuente: [Instalación docker ubuntu](https://docs.docker.com/engine/install/ubuntu).

```bash
$ sudo apt-get update
$ sudo apt-get install \
    ca-certificates \
    curl \
    gnupg \
    lsb-release

$ sudo mkdir -p /etc/apt/keyrings
$ curl -fsSL https://download.docker.com/linux/ubuntu/gpg | sudo gpg --dearmor -o /etc/apt/keyrings/docker.gpg

$  echo \
  "deb [arch=$(dpkg --print-architecture) signed-by=/etc/apt/keyrings/docker.gpg] https://download.docker.com/linux/ubuntu \
  $(lsb_release -cs) stable" | sudo tee /etc/apt/sources.list.d/docker.list > /dev/null

$ sudo apt-get update
$ sudo apt-get install docker-ce docker-ce-cli containerd.io docker-compose-plugin

```
