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
import type { CronExceptionHandler } from '#src/handlers/CronExceptionHandler'

export class CronBuilder {
  public static rTracerPlugin: any
  public static exceptionHandler: CronExceptionHandler

  /**
   * Register the cls-rtracer plugin into cron handlers.
   */
  public static registerRTracer(plugin: any) {
    this.rTracerPlugin = plugin
  }

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
   * Cron.schedule()
   *    .pattern('* * * * *')
   *    .handler(() => console.log('hey'))
   * ```
   */
  public pattern(pattern: string) {
    this.cron.pattern = pattern

    return this
  }

  /**
   * Register a scheduler handler for a dependency that exists
   * inside "rc.schedulers".
   *
   * @example
   * ```ts
   * const task = Cron.schedule()
   *    .pattern('* * * * *')
   *    .scheduler('MyCustomSchedulerClass')
   *
   * task.stop()
   * ```
   */
  public scheduler(name: string) {
    return this.handler(ctx => {
      const scheduler =
        ioc.use(name) || ioc.safeUse(`App/Cron/Schedulers/${name}`)

      return scheduler.handle(ctx)
    })
  }

  /**
   * Defines what operation the scheduler will run and
   * register your scheduler with all options defined.
   * This method also return an instance of your scheduler,
   * you can use this instance to stop your scheduler.
   *
   * @example
   * ```ts
   * const task = Cron.schedule()
   *    .pattern('* * * * *')
   *    .handler(() => console.log('hey'))
   *
   * task.stop()
   * ```
   */
  public handler(handler: CronHandler) {
    const register = () => {
      const getCtx = () => ({
        name: this.cron.name,
        traceId: CronBuilder.rTracerPlugin
          ? CronBuilder.rTracerPlugin.id()
          : null,
        pattern: this.cron.pattern,
        timezone: this.cron.timezone,
        runOnInit: this.cron.runOnInit,
        recoverMissedExecutions: this.cron.recoverMissedExecutions
      })

      const options = Options.create({
        name: this.cron.name,
        timezone: this.cron.timezone,
        runOnInit: this.cron.runOnInit,
        scheduled: this.cron.scheduled,
        recoverMissedExecutions: this.cron.recoverMissedExecutions
      })

      if (CronBuilder.rTracerPlugin) {
        return schedule(
          this.cron.pattern,
          () =>
            CronBuilder.rTracerPlugin.runWithId(() =>
              this.cron.handler(getCtx())
            ),
          options
        )
      }

      return schedule(
        this.cron.pattern,
        () => this.cron.handler(getCtx()),
        options
      )
    }

    if (!CronBuilder.exceptionHandler) {
      this.cron.handler = handler

      return register()
    }

    this.cron.handler = async (...args: any[]) => {
      try {
        await handler(...args)
      } catch (err) {
        CronBuilder.exceptionHandler.handle(err)
      }
    }

    return register()
  }

  /**
   * Defines if the task needs to be scheduled to run
   * after registering it.
   *
   * @default true
   * @example
   * ```ts
   * Cron.schedule().pattern('* * * * *')
   *    .scheduled(true)
   *    .handler(() => console.log('hey'))
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
   *    .timezone('America/Sao_Paulo')
   *    .handler(() => console.log('hey'))
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
   *    .runOnInit(true)
   *    .handler(() => console.log('hey'))
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
   *    .recoverMissingExecutions(true)
   *    .handler(() => console.log('hey'))
   * ```
   */
  public recoverMissedExecutions(recoverMissedExecutions?: boolean) {
    this.cron.recoverMissedExecutions = recoverMissedExecutions

    return this
  }
}
