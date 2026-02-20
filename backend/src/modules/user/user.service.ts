import {
  ConflictException,
  Inject,
  Injectable,
  Logger,
  NotAcceptableException,
  NotFoundException,
  forwardRef,
} from "@nestjs/common";
import { Request } from "express";
import { InjectRepository } from "@nestjs/typeorm";
import { In, Repository } from "typeorm";
import { CreateUserDto, UpdateUserDto } from "./user.dto";
import { Status, User } from "./user.entity";
import * as moment from "moment";
import * as mv from "mv";
import * as fs from "fs";
import { validate } from "class-validator";
import { IJWTPayload } from "modules/auth/jwt-payload.interface";
import { ImageService } from "modules/image/image.service";
import { CreateImageDto } from "modules/image/image.dto";
import { Image } from "modules/image/image.entity";
import { Role } from "modules/role/role.entity";

@Injectable()
export class UserService {
  constructor(
    @InjectRepository(User)
    private readonly _userRepository: Repository<User>,
    @InjectRepository(Role)
    private readonly _roleRepository: Repository<Role>,
    @Inject(forwardRef(() => ImageService))
    private readonly _imageService: ImageService
  ) {}
  private readonly _logger = new Logger(UserService.name);

  async create(createUserDto: CreateUserDto): Promise<User> {
    this._logger.debug("create()");
    const { email, firstname, lastname, password } = createUserDto;
    const timestamp: any = moment().format("YYYY-MM-DD HH:mm:ss");

    // Controlo que el nuevo usuario no exista
    const exists: User = await this._userRepository.findOne({
      where: { email },
    });

    // Si existe y no esta borrado lógico entonces hay conflictos
    if (exists && !exists.deleted) {
      this._logger.debug("Error: Email already in use");
      throw new ConflictException("Error: Email already in use");
    }

    // Si existe pero estaba borrado lógico entonces lo recupero
    if (exists && exists.deleted) {
      exists.firstname = firstname;
      exists.lastname = lastname;
      exists.password = password;
      exists.deleted = false;
      exists.updatedAt = timestamp;

      // Actualizo foto de perfil
      // Primero reviso si existía una foto de perfil previa y la marco como eliminada.
      if (createUserDto.profilePicture) {
        // Si recibí una nueva foto de perfil
        const createImageDto: CreateImageDto = {
          fileName: createUserDto.profilePicture.filename,
          originalPath: createUserDto.profilePicture.mimetype,
          saveFolder: "profile-pictures",
          mimetype: createUserDto.profilePicture.mimetype,
          originalName: createUserDto.profilePicture.originalname,
        };

        const newProfilePicture: Image = await this._imageService.create(
          createImageDto,
          1
        );

        exists.profilePicture = newProfilePicture;
      } else {
        exists.profilePicture = null;
      }

      // Controlo que el modelo no tenga errores antes de guardar
      const errors = await validate(exists);
      if (errors && errors.length > 0) {
        this._logger.debug("Error: Not Acceptable");
        throw new NotAcceptableException("Error: Not Acceptable");
      }

      return this._userRepository.save(exists);
    }

    // Si no existe entonces creo uno nuevo
    const user: User = this._userRepository.create();
    user.email = email;
    user.isEmailConfirmed = false;
    user.firstname = firstname;
    user.lastname = lastname;
    user.password = password;
    user.status = Status.ACTIVE;
    user.roles = [];
    user.updatedAt = timestamp;
    user.createdAt = timestamp;

    // // Guardo la foto de perfil
    // if (createUserDto.profilePicture) {
    //   // 1° Voy a mover la imagen desde la carpeta temporal donde la recibí
    //   const imgSource = createUserDto.profilePicture.path;
    //   const imgDestination = imgSource.replace("temp", "profile-pictures");
    //   mv(imgSource, imgDestination, { mkdirp: true }, (err: Error) => {
    //     console.log(err);
    //   });

    //   // 2° La guardo en la DB
    //   const newProfilePicture: ProfilePicture =
    //     this._profilePictureRepository.create();
    //   newProfilePicture.fileName = createUserDto.profilePicture.filename;
    //   newProfilePicture.path = imgDestination;
    //   newProfilePicture.mimetype = createUserDto.profilePicture.mimetype;
    //   newProfilePicture.originalName =
    //     createUserDto.profilePicture.originalname;

    //   // 3° Asigno la nueva al usuario
    //   user.profilePicture = await this._profilePictureRepository.save(
    //     newProfilePicture
    //   );
    // }

    // Controlo que el modelo no tenga errores antes de guardar
    const errors = await validate(user);
    if (errors && errors.length > 0) {
      this._logger.debug("Error: Not Acceptable");
      throw new NotAcceptableException("Error: Not Acceptable");
    }

    return this._userRepository.save(user);
  }

  async findAll(): Promise<User[]> {
    this._logger.debug("findAll()");
    return this._userRepository.find({
      where: { deleted: false },
      order: { id: "ASC" },
    });
  }

  async findOne(id: number): Promise<User> {
    this._logger.debug("findOne()");
    return this._userRepository.findOne({
      where: { id },
      relations: ["profilePicture", "roles"],
    });
  }

  async findOneById(id: number): Promise<User> {
    this._logger.debug("findOneById()");
    return this._userRepository.findOne({
      where: { id },
      relations: ["roles"],
    });
  }

  async findOneByEmail(email: string): Promise<User> {
    this._logger.debug("findOneByEmail()");
    return this._userRepository.findOne({
      where: { email },
      relations: ["roles"],
    });
  }

  async update(updateUserDto: UpdateUserDto): Promise<User> {
    this._logger.debug("update()");
    const { id, email, isEmailConfirmed, firstname, lastname, status, roles } =
      updateUserDto;
    const timestamp: any = moment().format("YYYY-MM-DD HH:mm:ss");

    const user: User = await this._userRepository.findOne({
      where: { id },
      relations: ["profilePicture"],
    });

    if (!user) throw new NotFoundException();

    // Controlo que las claves no estén en uso
    if (email) {
      const exists: User = await this._userRepository.findOne({
        where: { email },
      });

      // Si existe y no esta borrado lógico entonces hay conflictos
      if (exists && !exists.deleted && exists.id !== id)
        throw new ConflictException("Error: Keys already in use");
    }

    // Si no hay problemas actualizo los atributos
    if (email) user.email = email;
    if (isEmailConfirmed) user.isEmailConfirmed = isEmailConfirmed;
    if (firstname) user.firstname = firstname;
    if (lastname) user.lastname = lastname;
    if (status) user.status = status;
    if (roles) {
      const normalizedRoles = [...new Set(roles.map((roleName) => roleName.trim()))].filter(
        (roleName) => roleName.length > 0
      );

      const roleEntities = await this._roleRepository.find({
        where: { name: In(normalizedRoles) },
      });

      if (roleEntities.length !== normalizedRoles.length) {
        throw new NotFoundException("Error: Roles not found");
      }

      user.roles = roleEntities;
    }
    user.updatedAt = timestamp;

    // // Actualizo foto de perfil
    // // Primero reviso si existía una foto de perfil previa y la marco como eliminada.
    // if (updateUserDto.profilePicture) {
    //   // Si recibí una nueva foto de perfil
    //   // 1° Elimino la vieja
    //   if (user.profilePicture) {
    //     const oldProfilePicture = await this._profilePictureRepository.findOne({
    //       where: { id: user.profilePicture.id },
    //     });
    //     oldProfilePicture.deleted = true;
    //     oldProfilePicture.updatedAt = timestamp;
    //     await this._profilePictureRepository.save(oldProfilePicture);
    //   }

    //   // 2° Voy a mover la imagen desde la carpeta temporal donde la recibí
    //   const imgSource = updateUserDto.profilePicture.path;
    //   const imgDestination = imgSource.replace("temp", "profile-pictures");
    //   mv(imgSource, imgDestination, { mkdirp: true }, (err: Error) => {
    //     console.log(err);
    //   });

    //   // 3° La guardo en la DB
    //   const newProfilePicture: ProfilePicture =
    //     this._profilePictureRepository.create();
    //   newProfilePicture.fileName = updateUserDto.profilePicture.filename;
    //   newProfilePicture.path = imgDestination;
    //   newProfilePicture.mimetype = updateUserDto.profilePicture.mimetype;
    //   newProfilePicture.originalName =
    //     updateUserDto.profilePicture.originalname;

    //   // 4° Asigno la nueva al usuario
    //   user.profilePicture = await this._profilePictureRepository.save(
    //     newProfilePicture
    //   );
    // }

    // Controlo que el modelo no tenga errores antes de guardar
    const errors = await validate(user);
    if (errors && errors.length > 0) throw new NotAcceptableException();

    return this._userRepository.save(user);
  }

  async updateRefreshToken(id: number, refreshToken: string): Promise<User> {
    this._logger.debug("updateRefreshToken()");
    const timestamp: any = moment().format("YYYY-MM-DD HH:mm:ss");

    const user: User = await this._userRepository.findOne({
      where: { id },
    });

    if (!user) {
      this._logger.debug("Error: Not Found");
      throw new NotFoundException("Error: Not Found");
    }

    user.refreshToken = refreshToken;
    user.updatedAt = timestamp;

    // Controlo que el modelo no tenga errores antes de guardar
    const errors = await validate(user);
    if (errors && errors.length > 0) {
      this._logger.debug("Error: Not Acceptable");
      throw new NotAcceptableException("Error: Not Acceptable");
    }

    return this._userRepository.save(user);
  }

  async updatePassword(user: User, password: string) {
    this._logger.debug("updatePassword()");
    const timestamp: any = moment().format("YYYY-MM-DD HH:mm:ss");

    user.password = password;
    user.updatedAt = timestamp;

    return this._userRepository.save(user);
  }

  async delete(id: number): Promise<void> {
    this._logger.debug("delete()");
    const timestamp: any = moment().format("YYYY-MM-DD HH:mm:ss");
    const user: User = await this._userRepository.findOne({
      where: { id },
    });
    user.deleted = true;
    user.updatedAt = timestamp;
    this._userRepository.save(user);
  }

  async logout(id: number): Promise<void> {
    const user: User = await this._userRepository.findOne({
      where: { id },
    });
    user.refreshToken = null;
    this._userRepository.save(user);
  }

  async getUserFromRequest(request: Request): Promise<User> {
    this._logger.debug("getUserFromRequest()");
    const session: IJWTPayload = request.user as IJWTPayload;
    const user: User = await this._userRepository.findOne({
      where: { id: session.sub },
      relations: ["roles"],
    });

    if (!user) {
      this._logger.debug("Error: Not Found");
      throw new NotFoundException("Error: Not Found");
    }

    return user;
  }

  hasRole(user: User, roleName: string): boolean {
    return (
      user.roles?.some(
        (role) => role.name.toLowerCase() === roleName.toLowerCase()
      ) ?? false
    );
  }

  async getProfilePicture(id: number): Promise<Image> {
    this._logger.debug("getProfilePicture()");
    const profilePicture: Image = await this._imageService.findOne(id);

    if (!profilePicture) throw new NotFoundException("Error: Not Found");

    return profilePicture;
  }

  //   async deleteUselessProfilePictures() {
  //     this._logger.debug("deleteUselessProfilePictures()");
  //     const profilePictures: ProfilePicture[] =
  //       await this._profilePictureRepository.find({
  //         where: { deleted: true, fileDeleted: false },
  //       });

  //     // console.log(profilePictures);
  //     profilePictures.forEach(async (pp) => {
  //       const timestamp: any = moment().format("YYYY-MM-DD HH:mm:ss");
  //       fs.unlink(pp.path, (err: Error) => {
  //         if (err) console.log(err);
  //       });
  //       pp.fileDeleted = true;
  //       pp.updatedAt = timestamp;
  //       await this._profilePictureRepository.save(pp);
  //     });
  //   }
}
