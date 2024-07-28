/**
 * @athenna/cron
 *
 * (c) João Lenon <lenon@athenna.io>
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

import { schedule } from 'node-cron'
import { Options } from '@athenna/common'
import type { CronHandler } from '#src/types'

export class CronBuilder {
  private cron: {
    name?: string
    pattern?: string
    runOnInit?: boolean
    timezone?: string
    scheduled?: boolean
    handler?: CronHandler
    recoverMissedExecutions?: boolean
  } = {}

  /**
   * Defines the CRON expression that will determine when
   * the task will run.
   *
   * @example
   * ```ts
   * Cron.schedule().pattern('* * * * *')
   *    .handler(() => console.log('hey'))
   *    .register()
   * ```
   */
  public pattern(pattern: string) {
    this.cron.pattern = pattern

    return this
  }

  /**
   * Defines what operation the scheduler will run.
   *
   * @example
   * ```ts
   * Cron.schedule().pattern('* * * * *')
   *    .handler(() => console.log('hey'))
   *    .register()
   * ```
   */
  public handler(handler: CronHandler) {
    this.cron.handler = handler

    return this
  }

  /**
   * Defines if the task needs to be scheduled to run
   * after registering it.
   *
   * @default true
   * @example
   * ```ts
   * Cron.schedule().pattern('* * * * *')
   *    .handler(() => console.log('hey'))
   *    .scheduled(true)
   *    .register()
   * ```
   */
  public scheduled(scheduled: boolean) {
    this.cron.scheduled = scheduled

    return this
  }

  /**
   * Defines a name to your scheduler.
   *
   * @example
   * ```ts
   * Cron.schedule().pattern('* * * * *')
   *    .name('myScheduler')
   *    .handler(() => console.log('hey'))
   *    .register()
   * ```
   */
  public name(name: string) {
    this.cron.name = name

    return this
  }

  /**
   * Defines the timezone that is used for the job
   * scheduling.
   *
   * @example
   * ```ts
   * Cron.schedule().pattern('* * * * *')
   *    .handler(() => console.log('hey'))
   *    .timezone('America/Sao_Paulo')
   *    .register()
   * ```
   */
  public timezone(timezone: string) {
    this.cron.timezone = timezone

    return this
  }

  /**
   * Runs the task immediately after registering, no matter
   * the CRON pattern defined.
   *
   * @default false
   * @example
   * ```ts
   * Cron.schedule().pattern('* * * * *')
   *    .handler(() => console.log('hey'))
   *    .runOnInit(true)
   *    .register()
   * ```
   */
  public runOnInit(runOnInit: boolean) {
    this.cron.runOnInit = runOnInit

    return this
  }

  /**
   * Specifies whether to recover missed executions instead
   * of skipping them.
   *
   * @default false
   * @example
   * ```ts
   * Cron.schedule().pattern('* * * * *')
   *    .handler(() => console.log('hey'))
   *    .recoverMissingExecutions(true)
   *    .register()
   * ```
   */
  public recoverMissedExecutions(recoverMissedExecutions?: boolean) {
    this.cron.recoverMissedExecutions = recoverMissedExecutions

    return this
  }

  /**
   * Register your scheduler with all options defined.
   * This method also returns an instance of your scheduler,
   * you can use this instance to stop your scheduler.
   *
   * @example
   * ```ts
   * const task = Cron.schedule().pattern('* * * * *')
   *    .handler(() => console.log('hey'))
   *    .register()
   *
   * task.stop()
   * ```
   *
   */
  public register() {
    const ctx = {
      name: this.cron.name,
      pattern: this.cron.pattern,
      timezone: this.cron.timezone,
      runOnInit: this.cron.runOnInit,
      recoverMissedExecutions: this.cron.recoverMissedExecutions
    }

    const options = Options.create({
      name: this.cron.name,
      timezone: this.cron.timezone,
      runOnInit: this.cron.runOnInit,
      scheduled: this.cron.scheduled,
      recoverMissedExecutions: this.cron.recoverMissedExecutions
    })

    return schedule(this.cron.pattern, () => this.cron.handler(ctx), options)
  }
}
