import { Migration } from '@mikro-orm/migrations';

export class Migration20230308155412 extends Migration {

  async up(): Promise<void> {
    this.addSql('alter table `person` add `middleName` varchar(255) not null;');
  }

  async down(): Promise<void> {
    this.addSql('alter table `person` drop `middleName`;');
  }

}
