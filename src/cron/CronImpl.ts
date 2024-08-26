/**
 * @athenna/cron
 *
 * (c) João Lenon <lenon@athenna.io>
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

import { getTasks, validate } from 'node-cron'
import type { ScheduledTask } from '#src/types'
import { CronBuilder } from '#src/cron/CronBuilder'
import { NotFoundTaskNameException } from '#src/exceptions/NotFoundTaskNameException'

export class CronImpl {
  /**
   * Creates a new instance of CronBuilder to register
   * your scheduler.
   *
   * @example
   * ```ts
   * Cron.schedule().pattern('59 * * * *')
   *    .handler((ctx) => console.log(`my cron pattern is ${ctx.pattern}`))
   *    .register()
   * ```
   */
  public schedule() {
    return new CronBuilder()
  }

  /**
   * Validate if CRON pattern is correct.
   *
   * @example
   * ```ts
   * const valid = Cron.validate('59 * * * *')
   * const invalid = Cron.validate('60 * * * *')
   * ```
   */
  public validate(pattern: string) {
    return validate(pattern)
  }

  /**
   * Register the error handler for all tasks.
   *
   * @example
   * ```ts
   * Cron.setErrorHandler((err) => console.error(err))
   * ```
   */
  public setErrorHandler(handler: any) {
    CronBuilder.exceptionHandler = handler

    return this
  }

  /**
   * Returns a map with all tasks that has been scheduled.
   *
   * @example
   * ```ts
   * const tasks = Cron.getTasks()
   *
   * task.map(task => task.stop())
   * ```
   */
  public getTasks(): Map<string, ScheduledTask> {
    return getTasks() as Map<string, ScheduledTask>
  }

  /**
   * Run a scheduler by its name.
   *
   * @example
   * ```ts
   * await Cron.runByName('MySchedulerClassName')
   * ```
   */
  public async runByName(name: string) {
    const task = this.getTasks()?.get(name)

    if (!task) {
      throw new NotFoundTaskNameException(name)
    }

    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    await task._task._execution()
  }

  /**
   * Close all scheduled tasks.
   *
   * @example
   * ```ts
   * Cron.close()
   * ```
   */
  public close() {
    for (const task of this.getTasks().values()) {
      task.stop()
    }

    return this
  }

  /**
   * Delete all scheduled tasks.
   *
   * @example
   * ```ts
   * Cron.truncate()
   * ```
   */
  public truncate() {
    const tasks = this.getTasks()

    for (const task of tasks.keys()) {
      tasks.delete(task)
    }

    return this
  }
}
