/**
 * @athenna/cron
 *
 * (c) João Lenon <lenon@athenna.io>
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

import { Cron } from '#src/facades/Cron'
import { CronProvider } from '#src/providers/CronProvider'
import { Test, BeforeEach, AfterEach, Mock, type Context } from '@athenna/test'

export class CronImplTest {
  @BeforeEach()
  public async beforeEach() {
    ioc.reconstruct()

    new CronProvider().register()
  }

  @AfterEach()
  public async afterEach() {
    await new CronProvider().shutdown()

    Mock.restoreAll()
  }

  @Test()
  public async shouldBeAbleToScheduleATask({ assert }: Context) {
    let hasRun = false

    Cron.schedule()
      .pattern('59 * * * *')
      .runOnInit(true)
      .handler(() => (hasRun = true))

    assert.isTrue(hasRun)
  }

  @Test()
  public async shouldBeAbleToValidateThatACronIsValidOrInvalid({ assert }: Context) {
    assert.isTrue(Cron.validate('59 * * * *'))
    assert.isFalse(Cron.validate('60 * * * *'))
  }

  @Test()
  public async shouldBeAbleToListAllScheduledTasks({ assert }: Context) {
    Cron.schedule()
      .name('listAll')
      .pattern('59 * * * *')
      .handler(() => {})

    const tasks = Cron.getTasks()

    assert.isTrue(tasks.size >= 1)
  }

  @Test()
  public async shouldBeAbleToStopAllScheduledTasks({ assert }: Context) {
    let hasRun = false

    Cron.schedule()
      .name('stopAll')
      .pattern('59 * * * *')
      .handler(() => (hasRun = true))

    Cron.close()

    assert.isFalse(hasRun)
  }

  @Test()
  public async shouldBeAbleToScheduleATaskWithName({ assert }: Context) {
    Cron.schedule()
      .name('myTask')
      .pattern('59 * * * *')
      .handler(() => {})

    const tasks = Cron.getTasks()

    assert.isDefined(tasks.get('myTask'))
  }

  @Test()
  public async shouldBeAbleToManuallyRunATaskByName({ assert }: Context) {
    let hasRun = false

    Cron.schedule()
      .name('manual_run')
      .pattern('59 * * * *')
      .handler(() => (hasRun = true))

    await Cron.runByName('manual_run')

    assert.isTrue(hasRun)
  }

  @Test()
  public async shouldBeAbleToScheduleATaskWithDisabledScheduler({ assert }: Context) {
    Cron.schedule()
      .name('disabledTask')
      .pattern('59 * * * *')
      .scheduled(false)
      .handler(() => {})

    const tasks = Cron.getTasks()
    const task = tasks.get('disabledTask')

    assert.isFalse(task.options.scheduled)
  }

  @Test()
  public async shouldBeAbleToScheduleATaskToRunInDifferentTimezone({ assert }: Context) {
    Cron.schedule()
      .name('timezoneTask')
      .pattern('59 * * * *')
      .timezone('America/Sao_Paulo')
      .handler(() => {})

    const tasks = Cron.getTasks()
    const task = tasks.get('timezoneTask')

    assert.deepEqual(task.options.timezone, 'America/Sao_Paulo')
  }

  @Test()
  public async shouldBeAbleToScheduleATaskWithRecoverMissedExecutions({ assert }: Context) {
    Cron.schedule()
      .name('recoverMissedExecutionsTask')
      .pattern('59 * * * *')
      .recoverMissedExecutions(true)
      .handler(() => {})

    const tasks = Cron.getTasks()
    const task = tasks.get('recoverMissedExecutionsTask')

    assert.isTrue(task.options.recoverMissedExecutions)
  }

  @Test()
  public async shouldBeAbleToOverwriteSchedulersIfUsingSameName({ assert }: Context) {
    Cron.schedule()
      .name('overwriteScheduler')
      .scheduled(false)
      .pattern('59 * * * *')
      .handler(() => {})

    Cron.schedule()
      .name('overwriteScheduler')
      .scheduled(true)
      .pattern('59 * * * *')
      .handler(() => {})

    const tasks = Cron.getTasks()
    const task = tasks.get('overwriteScheduler')

    assert.isTrue(task.options.scheduled)
  }

  @Test()
  public async shouldRunTheSchedulerOnlyOnceForTheSameMatchedTimeWhenRecoveringMissedExecutions({ assert }: Context) {
    const clock = Mock.useFakeTimers(new Date('2026-10-20T10:59:59.500Z'))

    try {
      let runs = 0

      Cron.schedule()
        .name('recoverWithoutDuplicates')
        .pattern('* * * * *')
        .recoverMissedExecutions(true)
        .handler(() => runs++)

      clock.tick(1000)

      assert.equal(runs, 1)

      clock.tick(1000)

      assert.equal(runs, 1)

      clock.tick(58000)

      assert.equal(runs, 1)

      clock.tick(1000)

      assert.equal(runs, 2)

      clock.tick(1000)

      assert.equal(runs, 2)
    } finally {
      Cron.close()
      clock.restore()
    }
  }

  @Test()
  public async shouldRunADailySchedulerWithTimezoneOnlyOnceWhenRecoveringMissedExecutions({ assert }: Context) {
    const clock = Mock.useFakeTimers(new Date('2026-10-20T10:59:59.500Z'))

    try {
      const runs: string[] = []

      Cron.schedule()
        .name('dailyRecoverWithoutDuplicates')
        .pattern('0 8 * * *')
        .timezone('America/Sao_Paulo')
        .recoverMissedExecutions(true)
        .handler(() => runs.push(new Date().toISOString()))

      clock.tick(5000)

      assert.deepEqual(runs, ['2026-10-20T11:00:00.500Z'])
    } finally {
      Cron.close()
      clock.restore()
    }
  }

  @Test()
  public async shouldRecoverAnExecutionMissedBecauseTheEventLoopWasBlockedOnlyOnce({ assert }: Context) {
    const clock = Mock.useFakeTimers(new Date('2026-10-20T10:59:59.500Z'))

    try {
      const runs: string[] = []

      Cron.schedule()
        .name('recoverBlockedExecution')
        .pattern('* * * * *')
        .recoverMissedExecutions(true)
        .handler(() => runs.push(new Date().toISOString()))

      /**
       * The check that should happen at 11:00:00.500 only happens
       * at 11:00:01.700, when 11:00:00 is not matching anymore.
       */
      clock.jump(2200)

      assert.deepEqual(runs, ['2026-10-20T11:00:01.700Z'])

      clock.tick(5000)

      assert.deepEqual(runs, ['2026-10-20T11:00:01.700Z'])
    } finally {
      Cron.close()
      clock.restore()
    }
  }

  @Test()
  public async shouldSkipAnExecutionMissedBecauseTheEventLoopWasBlockedWhenNotRecoveringMissedExecutions({
    assert
  }: Context) {
    const clock = Mock.useFakeTimers(new Date('2026-10-20T10:59:59.500Z'))

    try {
      let runs = 0

      Cron.schedule()
        .name('skipBlockedExecution')
        .pattern('* * * * *')
        .recoverMissedExecutions(false)
        .handler(() => runs++)

      clock.jump(2200)
      clock.tick(5000)

      assert.equal(runs, 0)
    } finally {
      Cron.close()
      clock.restore()
    }
  }
}
