import { Migration } from '@mikro-orm/migrations';

export class Migration20230308202411 extends Migration {

  async up(): Promise<void> {
    this.addSql('drop table if exists `Base`;');
  }

  async down(): Promise<void> {
    this.addSql('create table `Base` (`id` varchar(255) not null, `createdAt` datetime not null, `updatedAt` datetime not null, primary key (`id`)) default character set utf8mb4 engine = InnoDB;');
  }

}
