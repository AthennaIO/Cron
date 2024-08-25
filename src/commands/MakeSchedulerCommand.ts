/**
 * @athenna/cron
 *
 * (c) João Lenon <lenon@athenna.io>
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

import { Path } from '@athenna/common'
import { BaseCommand, Argument } from '@athenna/artisan'

export class MakeSchedulerCommand extends BaseCommand {
  @Argument({
    description: 'The scheduler name.'
  })
  public name: string

  public static signature(): string {
    return 'make:scheduler'
  }

  public static description(): string {
    return 'Make a new scheduler file.'
  }

  public async handle(): Promise<void> {
    this.logger.simple('({bold,green} [ MAKING SCHEDULER ])\n')

    const destination = Config.get(
      'rc.commands.make:scheduler.destination',
      Path.schedulers()
    )

    const file = await this.generator
      .fileName(this.name)
      .destination(destination)
      .template('scheduler')
      .setNameProperties(true)
      .make()

    this.logger.success(
      `Scheduler ({yellow} "${file.name}") successfully created.`
    )

    const importPath = this.generator.getImportPath()

    await this.rc.pushTo('schedulers', importPath).save()

    this.logger.success(
      `Athenna RC updated: ({dim,yellow} [ schedulers += "${importPath}" ])`
    )
  }
}
