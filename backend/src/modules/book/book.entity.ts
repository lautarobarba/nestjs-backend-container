import { ApiProperty } from "@nestjs/swagger";
import {
  BaseEntity,
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from "typeorm";
import { User } from "../user/user.entity";
import { Note } from "../note/note.entity";

@Entity("books")
export class Book extends BaseEntity {
  @ApiProperty()
  @PrimaryGeneratedColumn("increment")
  id: number;

  @ApiProperty()
  @Column({
    name: "title",
    type: "varchar",
    nullable: false,
    length: 255,
  })
  title: string;

  @ApiProperty()
  @Column({
    name: "description",
    type: "text",
    nullable: true,
  })
  description: string | null;

  @ApiProperty({ type: () => User })
  @ManyToOne(() => User, (user) => user.books, {
    onDelete: "RESTRICT",
    onUpdate: "CASCADE",
    eager: false,
  })
  @JoinColumn({ name: "user_id" })
  user: User;

  @OneToMany(() => Note, (note) => note.book)
  notes: Note[];

  @ApiProperty()
  @CreateDateColumn({ name: "created_at" })
  createdAt: Date;

  @ApiProperty()
  @UpdateDateColumn({ name: "updated_at" })
  updatedAt: Date;

  @ApiProperty()
  @Column({ name: "deleted", type: "boolean", default: false })
  deleted: boolean;
}
