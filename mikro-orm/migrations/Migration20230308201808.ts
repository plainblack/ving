import { Migration } from '@mikro-orm/migrations';

export class Migration20230308201808 extends Migration {

  async up(): Promise<void> {
    this.addSql('create table `Author` (`id` varchar(255) not null, `createdAt` datetime not null, `updatedAt` datetime not null, `name` varchar(255) not null, `email` varchar(255) not null, `age` int null, `termsAccepted` tinyint(1) not null default false, `identities` text null, `born` datetime null, `version` int not null default 1, primary key (`id`)) default character set utf8mb4 engine = InnoDB;');

    this.addSql('create table `Base` (`id` varchar(255) not null, `createdAt` datetime not null, `updatedAt` datetime not null, primary key (`id`)) default character set utf8mb4 engine = InnoDB;');

    this.addSql('alter table `person` add `createdAt` datetime not null, add `updatedAt` datetime not null;');
    this.addSql('alter table `person` drop primary key;');
    this.addSql('alter table `person` change `cognito_id` `id` varchar(255) not null;');
    this.addSql('alter table `person` add primary key `person_pkey`(`id`);');
  }

  async down(): Promise<void> {
    this.addSql('drop table if exists `Author`;');

    this.addSql('drop table if exists `Base`;');

    this.addSql('alter table `person` drop primary key;');
    this.addSql('alter table `person` drop `createdAt`;');
    this.addSql('alter table `person` drop `updatedAt`;');
    this.addSql('alter table `person` change `id` `cognito_id` varchar(255) not null;');
    this.addSql('alter table `person` add primary key `person_pkey`(`cognito_id`);');
  }

}
