/**
 * @athenna/cron
 *
 * (c) João Lenon <lenon@athenna.io>
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

export type SchedulerOptions = {
  /**
   * The CRON expression that will determined when the scheduler
   * will run.
   *
   * @example '* * * * *'
   */
  pattern: string

  /**
   * The timezone that the CRON expression needs to respect when
   * running the scheduler.
   */
  timezone?: string

  /**
   * Defines if the scheduler should run when initiating the application,
   * not matter the CRON expression, it will always run on boot.
   *
   * @default false
   */
  runOnInit?: boolean

  /**
   * Defines if the scheduler should already be registered when booting
   * the application. This option is not like `runOnInit`, if you set it
   * as `false`, it will basically register your CRON but disabled, meaning
   * you need to manually start it using `Cron` facade.
   *
   * @default true
   */
  scheduled?: boolean

  /**
   * If this option is `true`, when the main thread froze for any reason,
   * the elapsed time since last execution will be considered an all the
   * missed executions will be triggered.
   *
   * @default false
   */
  recoverMissedExecutions?: boolean

  /**
   * The name that will be used to register the scheduler node-cron
   * and also inside the service container as an alias.
   *
   * @default YourSchedulerClassName
   */
  name?: string

  /**
   * The alias that will be used to register the scheduler inside
   * the service container.
   *
   * @default App/Cron/Schedulers/YourSchedulerClassName
   */
  alias?: string

  /**
   * The camel alias that will be used as an alias of the real
   * scheduler alias. Camel alias is important when you want to
   * work with constructor injection. By default, Athenna doesn't
   * create camel alias for schedulers.
   *
   * @default undefined
   */
  camelAlias?: string

  /**
   * The registration type that will be used to register your scheduler
   * inside the service container.
   *
   * @default 'transient'
   */
  type?: 'fake' | 'scoped' | 'singleton' | 'transient'
}
