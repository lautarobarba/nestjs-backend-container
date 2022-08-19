import {
	BaseEntity,
	Column,
	CreateDateColumn,
	Entity,
	PrimaryGeneratedColumn,
	UpdateDateColumn,
	ManyToOne,
	JoinColumn,
} from 'typeorm';
import { User } from 'modules/user/user.entity';

@Entity('notes')
export class Note extends BaseEntity {
	@PrimaryGeneratedColumn('increment')
	id: number;

	@Column({ name: 'title', type: 'varchar', nullable: false, unique: true })
	title: string;

	@Column({ name: 'content', type: 'text', nullable: false, unique: false })
	content: string;

	@ManyToOne(() => User, author => author.notes, { eager: true })
	@JoinColumn({ name: 'author', referencedColumnName: 'id' })
	author: User;

	@CreateDateColumn()
	created: Date;

	@UpdateDateColumn()
	updated: Date;

	@Column({ name: 'deleted', type: 'boolean', default: false })
	deleted: boolean;
}
