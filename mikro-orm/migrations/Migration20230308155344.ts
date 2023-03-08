import { Migration } from '@mikro-orm/migrations';

export class Migration20230308155344 extends Migration {

  async up(): Promise<void> {
    this.addSql('create table `person` (`cognito_id` varchar(255) not null, `email` varchar(255) not null, `agreedToTerms` datetime null, `firstName` varchar(255) not null, `lastName` varchar(255) not null, primary key (`cognito_id`)) default character set utf8mb4 engine = InnoDB;');
  }

}
