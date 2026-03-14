import {
  BaseEntity,
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  JoinTable,
  ManyToMany,
  OneToMany,
  OneToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from "typeorm";
import { Exclude } from "class-transformer";
import { ApiProperty } from "@nestjs/swagger";
import { IsBoolean, IsEmail, IsEnum, IsNotEmpty, IsOptional, IsString, MaxLength } from "class-validator";
// import { ProfilePicture } from "./profile-picture.entity";
import { Image } from "../image/image.entity";
import { Role } from "../role/role.entity";
import { Book } from "../book/book.entity";

export enum Status {
  ACTIVE = "ACTIVE",
  INACTIVE = "INACTIVE",
}

@Entity("users")
export class User extends BaseEntity {
  @ApiProperty()
  @PrimaryGeneratedColumn("increment")
  id: number;

  @ApiProperty()
  @IsEmail()
  @IsNotEmpty()
  @MaxLength(255)
  @Column({
    name: "email",
    type: "varchar",
    nullable: false,
    unique: true,
    length: 255,
  })
  email: string;

  @ApiProperty()
  @IsBoolean()
  @IsOptional()
  @Column({
    name: "is_email_confirmed",
    type: "boolean",
    default: false,
  })
  isEmailConfirmed: boolean;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  @MaxLength(255)
  @Column({
    name: "firstname",
    type: "varchar",
    nullable: false,
    unique: false,
    length: 255,
  })
  firstname: string;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  @MaxLength(255)
  @Column({
    name: "lastname",
    type: "varchar",
    nullable: false,
    unique: false,
    length: 255,
  })
  lastname: string;

  // Relation
  @ApiProperty({
    type: () => Image,
  })
  @IsOptional()
  @OneToOne(() => Image, (profilePicture) => {})
  @JoinColumn({
    name: "profile_picture_id",
  })
  profilePicture: Image;

  @Exclude()
  @IsString()
  @IsNotEmpty()
  @MaxLength(255)
  @Column({
    name: "password",
    type: "varchar",
    nullable: false,
    unique: false,
    length: 255,
  })
  password: string;

  @Exclude()
  @IsString()
  @IsOptional()
  @MaxLength(255)
  @Column({
    name: "refresh_token",
    type: "varchar",
    nullable: true,
    unique: false,
    length: 255,
  })
  refreshToken: string;

  @ApiProperty()
  @IsEnum(Status)
  @IsNotEmpty()
  @Column({
    name: "status",
    type: "enum",
    enum: Status,
    default: Status.ACTIVE,
    nullable: false,
  })
  status: string;

  @ApiProperty()
  @CreateDateColumn({ name: "created_at" })
  createdAt: Date;

  @ApiProperty()
  @UpdateDateColumn({ name: "updated_at" })
  updatedAt: Date;

  @ApiProperty()
  @IsBoolean()
  @IsOptional()
  @Column({
    name: "deleted",
    type: "boolean",
    default: false,
  })
  deleted: boolean;

  // Relation
  @OneToMany(() => Book, (book) => book.user)
  books: Book[];

  // Relation
  @ManyToMany(() => Role, (role) => role.users, {
    onDelete: "RESTRICT",
    onUpdate: "CASCADE",
    eager: true,
  })
  @JoinTable({
    name: "users_roles",
    joinColumn: {
      name: "user_id",
      referencedColumnName: "id",
    },
    inverseJoinColumn: {
      name: "role_id",
      referencedColumnName: "id",
    },
  })
  roles: Role[];
}
