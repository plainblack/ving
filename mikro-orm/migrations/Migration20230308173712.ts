import { Migration } from '@mikro-orm/migrations';

export class Migration20230308173712 extends Migration {

  async up(): Promise<void> {
    this.addSql('alter table `person` drop `middleName`;');
  }

  async down(): Promise<void> {
    this.addSql('alter table `person` add `middleName` varchar(255) not null;');
  }

}
