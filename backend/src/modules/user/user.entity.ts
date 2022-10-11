import {
	BaseEntity,
	Column,
	CreateDateColumn,
	Entity,
	OneToMany,
	PrimaryGeneratedColumn,
	UpdateDateColumn,
} from 'typeorm';
import { Exclude } from 'class-transformer';
import { Note } from '../note/note.entity';

export enum EStatus {
	ACTIVE = 'ACTIVE',
	INACTIVE = 'INACTIVE',
}

@Entity('users')
export class User extends BaseEntity {
	@PrimaryGeneratedColumn('increment')
	id: number;

	@Column({
		name: 'email',
		type: 'varchar',
		nullable: false,
		unique: true,
		length: 255,
	})
	email: string;

	@Column({
		name: 'name',
		type: 'varchar',
		nullable: false,
		unique: false,
		length: 255,
	})
	name: string;

	@Exclude()
	@Column({
		name: 'password',
		type: 'varchar',
		nullable: false,
		unique: false,
		length: 255,
	})
	password: string;

	@Exclude()
	@Column({
		name: 'refresh_token',
		type: 'varchar',
		nullable: true,
		unique: false,
		length: 255,
	})
	refreshToken: string;

	@OneToMany(() => Note, note => note.author)
	notes: Note[];

	@Column({
		name: 'status',
		type: 'enum',
		enum: EStatus,
		default: EStatus.ACTIVE,
	})
	status: string;

	@Column({ name: 'is_admin', type: 'boolean', default: false })
	isAdmin: boolean;

	@CreateDateColumn()
	created: Date;

	@UpdateDateColumn()
	updated: Date;

	@Column({ name: 'deleted', type: 'boolean', default: false })
	deleted: boolean;
}
